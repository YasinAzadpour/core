import json

import numpy as np
from accounts.forms import UpdateUser
from django.contrib.auth import get_user_model, login
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.validators import validators
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.http.response import JsonResponse
from django.middleware import csrf
from django.views.decorators.http import require_POST
from PIL import Image


User = get_user_model()


@require_POST
def sign_in(request):
    try:
        assert not request.user.is_authenticated
        username = request.POST['username']
        password = request.POST['password']

        this_user = User.objects.get(username=username)

        if this_user.check_password(password):
            login(request, this_user)
            return JsonResponse({'result': 'ok'})

        return JsonResponse({'result': 'error', 'password': 'Username and password do not match!'})

    except ObjectDoesNotExist:
        return JsonResponse({'result': 'error', 'username': 'This username does not exist!'})

    except:
        return JsonResponse({'result': 'error'})


@require_POST
def sign_up(request):
    try:
        assert not request.user.is_authenticated
        username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']

        try:
            User.username_validator(username)
            validate_password(password)
            validators.validate_email(email)

            this_user = User.objects.create_user(username=username, password=password, email=email, name=username)
            login(request, this_user)
            return JsonResponse({'result': 'ok', 'csrfmiddlewaretoken': csrf.get_token(request)})

        except ValidationError as e:
            e = list(e)
            response = {'result': 'error'}
            if 'email' in e[0]:
                response['email'] = e[0]
            elif 'password' in e[0]:
                response['password'] = e[0]
            else:
                response['username'] = 'Username is unavailable!'

            return JsonResponse(response)

        except IntegrityError as e:
            e = str(e)
            response = {'result': 'error'}

            if 'email' in e:
                response['email'] = 'This email already exists!'
            else:
                response['username'] = 'This username already exists!'

            return JsonResponse(response)

    except:
        return JsonResponse({'result': 'error'})


@require_POST
def edit_profile(request):
    if request.user.is_authenticated:
        user = request.user
        
        postData = {}
        for key,value in request.POST.items():
            postData[key] = value[0] if type(value) == list else value

        request.POST = postData
        userData = User.objects.filter(pk=user.pk).values()[0] | request.POST

        form = UpdateUser(userData, request.FILES, instance=user)

        if form.is_valid():
            form.save()
            profile = request.FILES.get('profile')
            header = request.FILES.get('header')
            if profile:
                profile = Image.open(profile)
                profile = np.array(profile)
                user.crop_profile(profile)

            if header:
                header = Image.open(header)
                header = np.array(header)
                user.crop_header(header)

            return JsonResponse({'result': 'ok'})

        data = json.loads(form.errors.as_json())
        for key, value in data.items():
            data[key] = value[0]['message']

        data['result'] = 'error'
        return JsonResponse(data)

    return JsonResponse({'result': 'error'})


@require_POST
def search(request):
    try:
        text = request.POST['text']        
        result  = User.search(text)
        assert result
        return JsonResponse({'result': 'ok','data': result[:50]})

    except:
        return JsonResponse({'result': 'error'})

