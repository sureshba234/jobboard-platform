# backend/applications/tests.py

import tempfile
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from jobs.models import Job
from .models import Application

User = get_user_model()


class ApplicationTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.employer = User.objects.create_user(
            email='employer@test.com', password='pass1234',
            full_name='Employer', role='employer', company_name='Corp'
        )
        self.candidate = User.objects.create_user(
            email='candidate@test.com', password='pass1234',
            full_name='Candidate', role='candidate'
        )
        self.candidate2 = User.objects.create_user(
            email='candidate2@test.com', password='pass1234',
            full_name='Candidate 2', role='candidate'
        )
        self.job = Job.objects.create(
            employer=self.employer,
            title='Test Job',
            description='Test',
            location='Remote',
            job_type='remote',
            experience='entry',
        )

        # A fake PDF file for testing uploads
        self.fake_pdf = SimpleUploadedFile(
            'resume.pdf',
            b'%PDF-1.4 fake pdf content',
            content_type='application/pdf'
        )

    def _make_application(self, candidate=None):
        """Helper — creates an application for the given candidate."""
        c = candidate or self.candidate
        return Application.objects.create(
            job=self.job,
            candidate=c,
            resume='resumes/test.pdf',
            cover_letter='I am interested.'
        )

    # ── Apply ─────────────────────────────────────────────────

    def test_candidate_can_apply(self):
        self.client.force_authenticate(user=self.candidate)
        fake_pdf = SimpleUploadedFile(
            'resume.pdf', b'%PDF fake', content_type='application/pdf'
        )
        res = self.client.post('/api/applications/apply/', {
            'job':          self.job.id,
            'resume':       fake_pdf,
            'cover_letter': 'I am a great fit.',
        }, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Application.objects.count(), 1)

    def test_candidate_cannot_apply_twice(self):
        self._make_application()
        self.client.force_authenticate(user=self.candidate)
        fake_pdf = SimpleUploadedFile(
            'resume2.pdf', b'%PDF fake', content_type='application/pdf'
        )
        res = self.client.post('/api/applications/apply/', {
            'job':    self.job.id,
            'resume': fake_pdf,
        }, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already applied', res.data['error'])

    def test_employer_cannot_apply_to_job(self):
        self.client.force_authenticate(user=self.employer)
        fake_pdf = SimpleUploadedFile(
            'resume.pdf', b'%PDF fake', content_type='application/pdf'
        )
        res = self.client.post('/api/applications/apply/', {
            'job':    self.job.id,
            'resume': fake_pdf,
        }, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_apply(self):
        res = self.client.post('/api/applications/apply/', {
            'job': self.job.id,
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── My Applications ───────────────────────────────────────

    def test_candidate_sees_own_applications(self):
        self._make_application(self.candidate)
        self._make_application(self.candidate2)
        self.client.force_authenticate(user=self.candidate)
        res = self.client.get('/api/applications/my/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Should only see their own
        self.assertEqual(len(res.data), 1)

    def test_employer_cannot_access_my_applications(self):
        self.client.force_authenticate(user=self.employer)
        res = self.client.get('/api/applications/my/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # ── Job applicants ────────────────────────────────────────

    def test_employer_sees_applicants_for_own_job(self):
        self._make_application()
        self.client.force_authenticate(user=self.employer)
        res = self.client.get(f'/api/applications/job/{self.job.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_candidate_cannot_see_job_applicants(self):
        self.client.force_authenticate(user=self.candidate)
        res = self.client.get(f'/api/applications/job/{self.job.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # ── Status update ─────────────────────────────────────────

    def test_employer_can_update_application_status(self):
        app = self._make_application()
        self.client.force_authenticate(user=self.employer)
        res = self.client.patch(
            f'/api/applications/{app.id}/status/',
            {'status': 'shortlisted'}
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'shortlisted')

    def test_candidate_cannot_update_status(self):
        app = self._make_application()
        self.client.force_authenticate(user=self.candidate)
        res = self.client.patch(
            f'/api/applications/{app.id}/status/',
            {'status': 'hired'}
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # ── Withdraw ──────────────────────────────────────────────

    def test_candidate_can_withdraw_application(self):
        app = self._make_application()
        self.client.force_authenticate(user=self.candidate)
        res = self.client.delete(f'/api/applications/{app.id}/withdraw/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Application.objects.count(), 0)

    def test_candidate_cannot_withdraw_others_application(self):
        app = self._make_application(self.candidate2)
        self.client.force_authenticate(user=self.candidate)
        res = self.client.delete(f'/api/applications/{app.id}/withdraw/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)