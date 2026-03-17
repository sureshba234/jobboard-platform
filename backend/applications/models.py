# backend/applications/models.py

from django.db import models
from django.conf import settings
from jobs.models import Job


def resume_upload_path(instance, filename):
    """Saves resumes in organised folders: resumes/candidate_id/filename"""
    return f"resumes/candidate_{instance.candidate.id}/{filename}"


class Application(models.Model):
    STATUS_CHOICES = (
        ('applied',     'Applied'),
        ('reviewing',   'Reviewing'),
        ('shortlisted', 'Shortlisted'),
        ('rejected',    'Rejected'),
        ('hired',       'Hired'),
    )

    job          = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    candidate    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    resume       = models.FileField(upload_to=resume_upload_path)
    cover_letter = models.TextField(blank=True)
    status       = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='applied'
    )
    applied_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering        = ['-applied_at']
        unique_together = ['job', 'candidate']

    def __str__(self):
        return f"{self.candidate.full_name} -> {self.job.title}"