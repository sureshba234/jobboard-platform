# backend/jobs/views.py

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from accounts.permissions import IsEmployer, IsCandidate
from .models import Job, Bookmark
from .serializers import JobSerializer, JobCreateSerializer


class JobListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsEmployer()]

    def get(self, request):
        jobs = Job.objects.filter(is_active=True)

        search     = request.query_params.get('search')
        location   = request.query_params.get('location')
        job_type   = request.query_params.get('job_type')
        experience = request.query_params.get('experience')
        salary_min = request.query_params.get('salary_min')

        if search:
            jobs = jobs.filter(title__icontains=search) | \
                   jobs.filter(description__icontains=search) | \
                   jobs.filter(skills__icontains=search)
        if location:
            jobs = jobs.filter(location__icontains=location)
        if job_type:
            jobs = jobs.filter(job_type=job_type)
        if experience:
            jobs = jobs.filter(experience=experience)
        if salary_min:
            jobs = jobs.filter(salary_min__gte=salary_min)

        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = JobCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(employer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobDetailView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsEmployer()]

    def get_object(self, pk, user=None):
        try:
            job = Job.objects.get(pk=pk)
            if user and job.employer != user:
                return None
            return job
        except Job.DoesNotExist:
            return None

    def get(self, request, pk):
        job = self.get_object(pk)
        if not job:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(JobSerializer(job).data)

    def put(self, request, pk):
        job = self.get_object(pk, user=request.user)
        if not job:
            return Response(
                {'error': 'Job not found or you do not have permission'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = JobCreateSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        job = self.get_object(pk, user=request.user)
        if not job:
            return Response(
                {'error': 'Job not found or you do not have permission'},
                status=status.HTTP_404_NOT_FOUND
            )
        job.delete()
        return Response(
            {'message': 'Job deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class EmployerJobListView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        jobs = Job.objects.filter(employer=request.user)
        return Response(JobSerializer(jobs, many=True).data)


class BookmarkView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def post(self, request, job_id):
        try:
            job = Job.objects.get(pk=job_id, is_active=True)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        bookmark, created = Bookmark.objects.get_or_create(
            candidate=request.user, job=job
        )
        if not created:
            bookmark.delete()
            return Response({'bookmarked': False, 'message': 'Bookmark removed'})
        return Response({'bookmarked': True, 'message': 'Job bookmarked'})


class MyBookmarksView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        bookmarks = Bookmark.objects.filter(
            candidate=request.user
        ).select_related('job', 'job__employer')
        jobs = [b.job for b in bookmarks]
        return Response(JobSerializer(jobs, many=True).data)