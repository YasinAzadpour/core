from django.contrib.auth import logout
from django.middleware import csrf
from django.shortcuts import redirect, render


def auth(request):
    if not request.user.is_authenticated:
        template_name = 'accounts/index.html'
        data = {
            'pagename': 'signIn' if 'sign-in' in request.path else 'signUp',
            'csrftoken': csrf.get_token(request),
        }
        return render(request,template_name,data)

    return redirect('/')


def logout_user(request):
    logout(request)
    return redirect('accounts:sign_in')
