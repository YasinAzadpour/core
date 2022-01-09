import os

import cv2
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core import files, validators
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
    bio = models.TextField(blank=True,max_length=150,default='Hi there!')
    email = models.EmailField(unique=True)
    header = models.ImageField(blank=True)
    profile = models.ImageField(blank=True)
    first_name = last_name = None  # use name instead of first_name and last_name


    def crop_profile(self, img, ColorConversionCode=cv2.COLOR_BGR2RGB):
        '''
        output-size : 400*400
        output-path : users/<self.pk>/<self.pk>-profile.png 
        '''
        try:
            imageY, imageX = img.shape[0], img.shape[1]

            maxSize = imageX if imageX < imageY else imageY
            x = 0 if imageY < imageX else int(imageY/2-(maxSize/2))
            y = 0 if imageX < imageY else int(imageX/2-(maxSize/2))

            img = img[x:x+maxSize, y:y+maxSize]
            img = cv2.cvtColor(img, ColorConversionCode)

            img = cv2.resize(img, settings.USER_PROFILE_IMAGE_SIZE)

            path = f'{settings.USER_DATA_PATH}/{self.pk}/'
            if not os.path.exists(path):
                os.mkdir(path)
            path += f'{self.pk}-profile.png'

            self.profile.delete()
            cv2.imwrite(path, img)

            self.profile = files.File(open(path, 'rb')).name.replace('web/media/', '')
            self.save()
            return True

        except:
            return False

    def crop_header(self, img, ColorConversionCode=cv2.COLOR_BGR2RGB):
        '''
        output-size : 1500*500
        output-path : users/<self.pk>/<self.pk>-header.png 
        '''
        try:
            imageY, imageX = img.shape[0], img.shape[1]

            width = imageX
            height = int(width/3)
            x = 0
            y = int((imageY/2)-(height/2))

            img = img[y:y+height, x:x+width]
            img = cv2.cvtColor(img, ColorConversionCode)
            img = cv2.resize(img, settings.USER_HEADER_IMAGE_SIZE)

            path = f'{settings.USER_DATA_PATH}/{self.pk}/'
            if not os.path.exists(path):
                os.mkdir(path)
            path += f'{self.pk}-header.png'

            self.header.delete()
            cv2.imwrite(path, img)

            self.header = files.File(open(path, 'rb')).name.replace('web/media/', '')
            self.save()
            return True

        except:
            return False
