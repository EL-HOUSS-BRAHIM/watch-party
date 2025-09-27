"""Smoke tests for the public authentication API."""

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


class AuthenticationFlowTests(TestCase):
    """Exercise the registration and login endpoints end-to-end."""

    client_class = APIClient

    def test_user_can_register_and_login(self):
        register_url = reverse("authentication:register")
        payload = {
            "email": "pytest-user@example.com",
            "password": "PytestPass123!",
            "confirm_password": "PytestPass123!",
            "first_name": "Pytest",
            "last_name": "User",
        }

        register_response = self.client.post(register_url, payload, format="json")
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        response_data = register_response.data
        self.assertTrue(response_data["success"])
        self.assertTrue(response_data["verification_sent"])
        self.assertIn("access_token", response_data)
        self.assertIn("refresh_token", response_data)

        login_url = reverse("authentication:login")
        login_payload = {"email": payload["email"], "password": payload["password"]}
        login_response = self.client.post(login_url, login_payload, format="json")

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        login_data = login_response.data
        self.assertTrue(login_data["success"])
        self.assertIn("access_token", login_data)
        self.assertIn("refresh_token", login_data)
        self.assertEqual(login_data["user"]["email"], payload["email"])
