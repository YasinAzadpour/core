from django.contrib.auth.decorators import login_required
from django.middleware import csrf
from django.shortcuts import render


@login_required(login_url='/accounts/sign-in')
def main(request):
    template_name = 'main/index.html'
    data = {'csrftoken': csrf.get_token(request)}
    return render(request,template_name,data)

