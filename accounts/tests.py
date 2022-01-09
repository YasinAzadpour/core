from django.contrib.auth import get_user_model
from django.test import TestCase

User = get_user_model()

mainUser = {'username': 'main', 'password': 'Password', 'email': 'main@site.com'}


class TestAuthPages(TestCase):
    def setUp(self):
        User.objects.create_user(**mainUser)
        self.signup_page = '/accounts/sign-up'
        self.signin_page = '/accounts/sign-in'
        self.logout_page = '/accounts/log-out'

    def test_auth(self):
        response = self.client.get(self.signin_page)
        about = 'signIn-page-test'
        self.assertEqual(response.status_code, 200, about)

        response = self.client.get(self.signup_page)
        about = 'signUp-page-test'
        self.assertEqual(response.status_code, 200, about)

        self.client.login(**mainUser)

        response = self.client.get(self.signin_page)
        about = 'signIn-page-test(after sign-in)'
        self.assertEqual(response.status_code, 302, about)

        response = self.client.get(self.signup_page)
        about = 'signUp-page-test(after sign-in)'
        self.assertEqual(response.status_code, 302, about)

        response = self.client.get(self.logout_page)
        about = 'log-out-page-test'
        self.assertEqual(response.status_code, 302, about)
