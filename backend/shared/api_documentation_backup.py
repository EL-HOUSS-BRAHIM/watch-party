"""
Enhanced API documentation and schema generation - Backup of original
"""

from rest_framework import serializers


# Custom serializers for documentation
class SearchResponseSerializer(serializers.Serializer):
    """Search response documentation"""
    query = serializers.CharField(help_text="The search query")
    type = serializers.CharField(help_text="Search type filter")
    sort_by = serializers.CharField(help_text="Sort method")
    total_results = serializers.IntegerField(help_text="Total number of results")
    results = serializers.DictField(help_text="Search results by category")
