"""Utilities for interacting with AWS services using the project's IAM role.

This module centralizes the creation of boto3 sessions and helpers for
retrieving secrets from AWS Secrets Manager.  The helpers intentionally avoid
accepting static access keys so that the application always relies on the
attached IAM role (MyAppRole).
"""

from __future__ import annotations

import base64
import json
import logging
import os
from functools import lru_cache
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError

LOGGER = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_boto3_session() -> boto3.Session:
    """Return a cached boto3 session using mounted AWS credentials file."""
    
    try:
        # Force boto3 to use the mounted credentials file by setting environment
        import os
        
        # Temporarily disable instance metadata to force file-based credentials
        original_metadata_disabled = os.environ.get('AWS_EC2_METADATA_DISABLED')
        os.environ['AWS_EC2_METADATA_DISABLED'] = 'true'
        
        # Create session which will now use the mounted credentials file
        session = boto3.Session()
        
        # Restore original metadata setting
        if original_metadata_disabled is not None:
            os.environ['AWS_EC2_METADATA_DISABLED'] = original_metadata_disabled
        else:
            os.environ.pop('AWS_EC2_METADATA_DISABLED', None)
            
        return session
        
    except Exception as e:
        LOGGER.warning(f"Could not create AWS session with mounted credentials: {e}")
        # Fall back to default session if mounted credentials fail
        return boto3.Session()


def _decode_secret_payload(response: Dict[str, Any]) -> Dict[str, Any]:
    """Decode the payload returned by ``get_secret_value`` into a dictionary."""

    if "SecretString" in response and response["SecretString"]:
        try:
            return json.loads(response["SecretString"])
        except json.JSONDecodeError as exc:  # pragma: no cover - defensive
            LOGGER.warning("Secret string is not valid JSON: %s", exc)
            return {"value": response["SecretString"]}

    if "SecretBinary" in response and response["SecretBinary"]:
        decoded = base64.b64decode(response["SecretBinary"])
        try:
            return json.loads(decoded)
        except json.JSONDecodeError as exc:  # pragma: no cover - defensive
            LOGGER.warning("Secret binary is not valid JSON: %s", exc)
            return {"value": decoded.decode("utf-8")}

    return {}


@lru_cache(maxsize=None)
def get_secret(secret_name: str, *, region: str = "eu-west-3") -> Dict[str, Any]:
    """Fetch and cache a secret from AWS Secrets Manager.

    Parameters
    ----------
    secret_name:
        Name or ARN of the secret to retrieve.
    region:
        AWS region that hosts the secret. Defaults to ``eu-west-3`` to align
        with the shared environment configuration.

    Returns
    -------
    dict
        Parsed secret payload. For JSON secrets this will be the decoded
        dictionary. If the payload cannot be decoded as JSON it falls back to
        a dictionary containing the raw value under the ``"value"`` key.
    """

    try:
        client = get_boto3_session().client("secretsmanager", region_name=region)
        response = client.get_secret_value(SecretId=secret_name)
    except (ClientError, BotoCoreError) as exc:
        LOGGER.error("Unable to retrieve secret '%s': %s", secret_name, exc)
        raise

    return _decode_secret_payload(response)


def get_optional_secret(secret_name: str, *, region: str = "eu-west-3") -> Optional[Dict[str, Any]]:
    """Return the secret payload if it can be fetched, otherwise ``None``."""
    
    # Skip AWS calls during Docker build or CI environments
    if (os.environ.get('DOCKER_BUILDKIT') or 
        os.environ.get('CI') or 
        os.environ.get('GITHUB_ACTIONS') or
        os.environ.get('SKIP_AWS_DURING_BUILD')):
        LOGGER.info("Skipping AWS Secrets Manager call during build/CI environment")
        return None

    try:
        return get_secret(secret_name, region=region)
    except (ClientError, BotoCoreError) as exc:
        LOGGER.warning("Could not retrieve secret '%s': %s (this is expected during build/CI)", secret_name, exc)
        return None
