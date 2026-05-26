from django.db import models


class Course(models.Model):
    skill = models.CharField(max_length=255)
    course_name = models.CharField(max_length=255)
    provider = models.CharField(max_length=255, blank=True, null=True)
    course_link = models.URLField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.skill} - {self.course_name}"
