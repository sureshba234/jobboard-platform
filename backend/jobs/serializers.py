# backend/jobs/serializers.py

from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    employer_name     = serializers.CharField(source='employer.company_name', read_only=True)
    employer_email    = serializers.CharField(source='employer.email',        read_only=True)
    application_count = serializers.SerializerMethodField()

    class Meta:
        model  = Job
        fields = [
            'id', 'title', 'description', 'location',
            'job_type', 'experience', 'salary_min', 'salary_max',
            'skills', 'is_active', 'created_at', 'updated_at',
            'employer_name', 'employer_email', 'application_count'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'employer_name', 'employer_email'
        ]

    def get_application_count(self, obj):
        return obj.applications.count()


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Job
        fields = [
            'id', 'title', 'description', 'location',
            'job_type', 'experience', 'salary_min',
            'salary_max', 'skills', 'is_active'
        ]