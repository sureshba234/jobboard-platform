# backend/accounts/tests.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AuthTests(TestCase):

    def setUp(self):
        """Runs before every test — creates a fresh API client."""
        self.client = APIClient()

    # ── Registration ──────────────────────────────────────────

    def test_candidate_registration_success(self):
        res = self.client.post('/api/auth/register/', {
            'email':     'candidate@test.com',
            'full_name': 'Test Candidate',
            'role':      'candidate',
            'password':  'pass1234',
            'password2': 'pass1234',
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['role'], 'candidate')
        self.assertEqual(res.data['email'], 'candidate@test.com')

    def test_employer_registration_success(self):
        res = self.client.post('/api/auth/register/', {
            'email':        'employer@test.com',
            'full_name':    'Test Employer',
            'role':         'employer',
            'company_name': 'Test Corp',
            'password':     'pass1234',
            'password2':    'pass1234',
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['company_name'], 'Test Corp')

    def test_employer_registration_fails_without_company(self):
        res = self.client.post('/api/auth/register/', {
            'email':     'employer2@test.com',
            'full_name': 'Test Employer',
            'role':      'employer',
            'password':  'pass1234',
            'password2': 'pass1234',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_fails_with_mismatched_passwords(self):
        res = self.client.post('/api/auth/register/', {
            'email':     'test@test.com',
            'full_name': 'Test',
            'role':      'candidate',
            'password':  'pass1234',
            'password2': 'wrongpass',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_fails_with_duplicate_email(self):
        User.objects.create_user(
            email='dup@test.com', password='pass1234', full_name='Dup'
        )
        res = self.client.post('/api/auth/register/', {
            'email':     'dup@test.com',
            'full_name': 'Dup',
            'role':      'candidate',
            'password':  'pass1234',
            'password2': 'pass1234',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Login ─────────────────────────────────────────────────

    def test_login_success_returns_tokens(self):
        User.objects.create_user(
            email='login@test.com', password='pass1234', full_name='Login User'
        )
        res = self.client.post('/api/auth/login/', {
            'email':    'login@test.com',
            'password': 'pass1234',
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access',  res.data)
        self.assertIn('refresh', res.data)
        self.assertIn('user',    res.data)

    def test_login_fails_with_wrong_password(self):
        User.objects.create_user(
            email='test@test.com', password='pass1234', full_name='Test'
        )
        res = self.client.post('/api/auth/login/', {
            'email':    'test@test.com',
            'password': 'wrongpass',
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_fails_with_nonexistent_email(self):
        res = self.client.post('/api/auth/login/', {
            'email':    'nobody@test.com',
            'password': 'pass1234',
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Protected route ───────────────────────────────────────

    def test_me_endpoint_requires_auth(self):
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_endpoint_returns_user_when_authenticated(self):
        user = User.objects.create_user(
            email='me@test.com', password='pass1234', full_name='Me User'
        )
        self.client.force_authenticate(user=user)
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'me@test.com')