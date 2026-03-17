# backend/applications/serializers.py

from rest_framework import serializers
from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    candidate_name  = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email',     read_only=True)
    job_title       = serializers.CharField(source='job.title',           read_only=True)
    job_company     = serializers.CharField(source='job.employer.company_name', read_only=True)
    job_location    = serializers.CharField(source='job.location',        read_only=True)

    class Meta:
        model  = Application
        fields = [
            'id', 'job', 'job_title', 'job_company', 'job_location',
            'candidate', 'candidate_name', 'candidate_email',
            'resume', 'cover_letter', 'status',
            'applied_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'candidate', 'status',
            'applied_at', 'updated_at',
            'candidate_name', 'candidate_email',
            'job_title', 'job_company', 'job_location'
        ]


class ApplicationStatusSerializer(serializers.ModelSerializer):
    """Used by employer to update only the status field."""
    class Meta:
        model  = Application
        fields = ['id', 'status']