# backend/applications/views.py

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from accounts.permissions import IsCandidate, IsEmployer
from jobs.models import Job
from .models import Application
from .serializers import ApplicationSerializer, ApplicationStatusSerializer
class ApplyView(APIView):
    """
    Candidate submits application with resume.
    Validates file type and size before saving.
    """
    permission_classes = [IsAuthenticated, IsCandidate]
    parser_classes     = [MultiPartParser, FormParser]

    ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    MAX_SIZE_MB = 5

    def post(self, request):
        job_id = request.data.get('job')

        # Check job exists and is active
        try:
            job = Job.objects.get(pk=job_id, is_active=True)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found or no longer active'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check not already applied
        if Application.objects.filter(job=job, candidate=request.user).exists():
            return Response(
                {'error': 'You have already applied for this job'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate resume file
        resume = request.FILES.get('resume')
        if not resume:
            return Response(
                {'error': 'Resume file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check file type
        if resume.content_type not in self.ALLOWED_TYPES:
            return Response(
                {'error': 'Only PDF and Word documents (.pdf, .doc, .docx) are allowed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check file size (max 5MB)
        if resume.size > self.MAX_SIZE_MB * 1024 * 1024:
            return Response(
                {'error': f'File size must be under {self.MAX_SIZE_MB}MB'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(candidate=request.user, job=job)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyApplicationsView(APIView):
    """Candidate sees all their own applications."""
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        apps = Application.objects.filter(
            candidate=request.user
        ).select_related('job', 'job__employer')
        return Response(ApplicationSerializer(apps, many=True).data)


class JobApplicationsView(APIView):
    """Employer sees all applicants for one of their jobs."""
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request, job_id):
        # Make sure this job belongs to the requesting employer
        try:
            job = Job.objects.get(pk=job_id, employer=request.user)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )

        apps = Application.objects.filter(job=job).select_related('candidate')
        return Response(ApplicationSerializer(apps, many=True).data)


class UpdateApplicationStatusView(APIView):
    """Employer updates the status of a specific application."""
    permission_classes = [IsAuthenticated, IsEmployer]

    def patch(self, request, pk):
        try:
            app = Application.objects.get(pk=pk, job__employer=request.user)
        except Application.DoesNotExist:
            return Response(
                {'error': 'Application not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ApplicationStatusSerializer(app, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WithdrawApplicationView(APIView):
    """Candidate withdraws their own application."""
    permission_classes = [IsAuthenticated, IsCandidate]

    def delete(self, request, pk):
        try:
            app = Application.objects.get(pk=pk, candidate=request.user)
        except Application.DoesNotExist:
            return Response(
                {'error': 'Application not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        app.delete()
        return Response(
            {'message': 'Application withdrawn'},
            status=status.HTTP_204_NO_CONTENT
        )