from django.urls import path
from .views import *


app_name = 'api' 

urlpatterns = [
    path('accounts/sign-in', sign_in, name='api_sign_in'),
    path('accounts/sign-up', sign_up, name='api_sign_up'),
    path('accounts/search', search, name='api_serach_users'),
    path('accounts/edit', edit_profile, name='api_edit_profile'),
    path('chat/messages/<user_id>', get_private_chat, name='api_get_private_chat'),
]
