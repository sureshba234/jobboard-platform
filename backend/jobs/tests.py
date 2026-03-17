# backend/jobs/tests.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Job

User = get_user_model()


class JobTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        # Create employer user
        self.employer = User.objects.create_user(
            email='employer@test.com',
            password='pass1234',
            full_name='Test Employer',
            role='employer',
            company_name='Test Corp'
        )

        # Create candidate user
        self.candidate = User.objects.create_user(
            email='candidate@test.com',
            password='pass1234',
            full_name='Test Candidate',
            role='candidate'
        )

        # Create a sample job
        self.job = Job.objects.create(
            employer=self.employer,
            title='Django Developer',
            description='Build REST APIs',
            location='Hyderabad',
            job_type='full_time',
            experience='mid',
            salary_min=600000,
            salary_max=1000000,
            skills='Django, Python, PostgreSQL',
        )

    # ── Public job listing ────────────────────────────────────

    def test_anyone_can_list_jobs(self):
        res = self.client.get('/api/jobs/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_anyone_can_view_job_detail(self):
        res = self.client.get(f'/api/jobs/{self.job.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], 'Django Developer')

    # ── Search and filter ─────────────────────────────────────

    def test_search_by_title(self):
        res = self.client.get('/api/jobs/?search=Django')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_search_returns_empty_for_no_match(self):
        res = self.client.get('/api/jobs/?search=Java')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_filter_by_job_type(self):
        res = self.client.get('/api/jobs/?job_type=full_time')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_filter_by_location(self):
        res = self.client.get('/api/jobs/?location=Hyderabad')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    # ── Employer creates job ──────────────────────────────────

    def test_employer_can_create_job(self):
        self.client.force_authenticate(user=self.employer)
        res = self.client.post('/api/jobs/', {
            'title':       'React Developer',
            'description': 'Build React apps',
            'location':    'Remote',
            'job_type':    'remote',
            'experience':  'entry',
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['title'], 'React Developer')

    def test_candidate_cannot_create_job(self):
        self.client.force_authenticate(user=self.candidate)
        res = self.client.post('/api/jobs/', {
            'title':       'Fake Job',
            'description': 'Should not work',
            'location':    'Nowhere',
            'job_type':    'full_time',
            'experience':  'entry',
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_create_job(self):
        res = self.client.post('/api/jobs/', {
            'title': 'Fake Job'
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Employer updates and deletes job ──────────────────────

    def test_employer_can_update_own_job(self):
        self.client.force_authenticate(user=self.employer)
        res = self.client.put(f'/api/jobs/{self.job.id}/', {
            'title':       'Senior Django Developer',
            'description': 'Build REST APIs',
            'location':    'Hyderabad',
            'job_type':    'full_time',
            'experience':  'senior',
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], 'Senior Django Developer')

    def test_employer_can_delete_own_job(self):
        self.client.force_authenticate(user=self.employer)
        res = self.client.delete(f'/api/jobs/{self.job.id}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Job.objects.count(), 0)

    def test_employer_cannot_delete_other_employers_job(self):
        # Create a second employer
        other_employer = User.objects.create_user(
            email='other@test.com', password='pass1234',
            full_name='Other', role='employer', company_name='Other Corp'
        )
        self.client.force_authenticate(user=other_employer)
        res = self.client.delete(f'/api/jobs/{self.job.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    # ── Employer job list ─────────────────────────────────────

    def test_employer_sees_only_own_jobs(self):
        self.client.force_authenticate(user=self.employer)
        res = self.client.get('/api/jobs/my/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)