# backend/jobs/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone

class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('full_time',  'Full Time'),
        ('part_time',  'Part Time'),
        ('contract',   'Contract'),
        ('internship', 'Internship'),
        ('remote',     'Remote'),
    )

    EXPERIENCE_CHOICES = (
        ('entry',  'Entry Level'),
        ('mid',    'Mid Level'),
        ('senior', 'Senior Level'),
    )

    employer    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jobs'
    )
    title       = models.CharField(max_length=200)
    description = models.TextField()
    location    = models.CharField(max_length=100)
    job_type    = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)
    experience  = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default='entry')
    salary_min  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    skills      = models.CharField(max_length=300, blank=True)
    is_active   = models.BooleanField(default=True)
    deadline    = models.DateField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.employer.company_name}"

    @property
    def is_expired(self):
        if self.deadline:
            return self.deadline < timezone.now().date()
        return False


class Bookmark(models.Model):
    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['candidate', 'job']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.candidate.full_name} bookmarked {self.job.title}"
    deadline = models.DateField(null=True, blank=True, help_text="Application deadline")