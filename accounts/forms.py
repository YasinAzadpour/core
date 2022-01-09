from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserChangeForm


User = get_user_model()


class UpdateUser(UserChangeForm):
    class Meta:
        model = User
        fields = ['username', 'name', 'category', 'bio', 'email', 'header', 'profile']
