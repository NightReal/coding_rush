from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.

class CodingrushAccount(AbstractUser):
    avatar = models.ImageField(upload_to='avatars', null=True)
    is_activated = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} - {self.email} - {self.first_name} {self.last_name}"
