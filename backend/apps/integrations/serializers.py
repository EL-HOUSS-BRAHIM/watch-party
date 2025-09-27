from rest_framework import serializers

class IntegrationStatusSerializer(serializers.Serializer):
    name = serializers.CharField()
    type = serializers.CharField()
    enabled = serializers.BooleanField()
    healthy = serializers.BooleanField()
    rate_limit = serializers.IntegerField(allow_null=True)
    base_url = serializers.CharField(allow_blank=True, allow_null=True)
    capabilities = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    last_checked = serializers.DateTimeField()

class IntegrationStatusSummarySerializer(serializers.Serializer):
    total = serializers.IntegerField()
    healthy = serializers.IntegerField()
    enabled = serializers.IntegerField()
    health_percentage = serializers.FloatField()

class IntegrationStatusResponseSerializer(serializers.Serializer):
    summary = IntegrationStatusSummarySerializer()
    integrations = IntegrationStatusSerializer(many=True)
    types_available = serializers.ListField(child=serializers.CharField())
    last_updated = serializers.DateTimeField()

class IntegrationManagementResponseSerializer(serializers.Serializer):
    integration_name = serializers.CharField()
    action = serializers.CharField()
    config = serializers.DictField()
    message = serializers.CharField()
