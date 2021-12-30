from django.contrib.auth.models import AbstractUser
from django.core import validators
from django.db import models
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _


@deconstructible
class MyUsernameValidator(validators.RegexValidator):
    regex = r'^(?!.*\.\.)(?!.*\.$)[^\W][a-z0-9_.]{2,29}$'
    message = _('Enter a valid username!')
    flags = 0


class User(AbstractUser):

    username_validator = MyUsernameValidator()

    username = models.CharField(unique=True,max_length=30,validators=[username_validator])
    name = models.CharField(blank=True,max_length=50)
    category = models.CharField(blank=True,max_length=30)
    bio = models.TextField(blank=True,max_length=150,default="Hi there!")
    email = models.EmailField(unique=True)
    header = models.ImageField(blank=True)
    profile = models.ImageField(blank=True)
    first_name = last_name = None  # use name instead of first_name and last_name

