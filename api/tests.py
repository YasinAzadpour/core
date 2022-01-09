from django.test import TransactionTestCase
from django.contrib.auth import get_user_model


User = get_user_model()

mainUser = {'username': 'main', 'password': 'Password', 'email': 'main@site.com'}
newUser = {'username': 'new', 'password': 'Password', 'email': 'new@site.com'}


class TestApi(TransactionTestCase):
    def setUp(self):
        User.objects.create_user(**mainUser)
        self.signup_api = '/api/accounts/sign-up'
        self.signin_api = '/api/accounts/sign-in'

    # testing signUp api in all cases
    def test_sign_up(self):
        self.client.logout()
        response = self.client.post(self.signup_api).json()
        about = f'signUp-test: no data sent\n{response}'
        self.assertEqual(response['result'], 'error', about)

        response = self.client.post(self.signup_api, newUser | {'username': '#username.'}).json()
        about = f'signUp-test: invalid username\n{response}'
        self.assertEqual(response['result'], 'error', about)

        response = self.client.post(self.signup_api, newUser | {'username': mainUser['username']}).json()
        about = f'signUp-test: exists username\n{response}'
        self.assertEqual(response['result'], 'error', about)

        response = self.client.post(self.signup_api, newUser | {'username': 'i'}).json()
        about = f'signUp-test: short username\n{response}'
        self.assertEqual(response['result'], 'error', about)

        response = self.client.post(self.signup_api, newUser | {'username': 10*'username'}).json()
        about = f'signUp-test: long username\n{response}'
        self.assertEqual(response['result'], 'error', about)

        response = self.client.post(self.signup_api, newUser | {'password': '0'}).json()
        about = f'signUp-test: short password\n{response}'
        self.assertEqual(response['result'], 'error', about)

        response = self.client.post(self.signup_api, newUser | {'email': 'invalid'}).json()
        about = f'signUp-test: invalid email\n{response}'
        self.assertEqual(response['result'], 'error', about)

        response = self.client.post(self.signup_api, newUser | {'email': mainUser['email']}).json()
        about = f'signUp-test: exists email\n{response}'
        self.assertEqual(response['result'], 'error', about)

        response = self.client.post(self.signup_api, newUser).json()
        about = f'signUp-test: All data did correct\n{response}'
        self.assertEqual(response['result'], 'ok', about)

        response = self.client.post(self.signup_api, newUser).json()
        about = f'signUp-test: user did logged in\n{response}'
        self.assertEqual(response['result'], 'error', about)

    # testing signIn api in all cases
    def test_sign_in(self):
        self.client.logout()
        response = self.client.post(self.signin_api).json()
        about = f'signIn-test: no data sent\n{response}'
        self.assertEqual(response['result'], 'error', about)

        response = self.client.post(self.signin_api, mainUser | {'password': 'incorrect'}).json()
        about = f'signIn-test: incorrect password\n{response}'
        self.assertEqual(response['result'], 'error', about)

        response = self.client.post(self.signin_api, mainUser | {'username': '#unavailable'}).json()
        about = f'signIn-test: unavailable username\n{response}'
        self.assertEqual(response['result'], 'error')

        response = self.client.post(self.signin_api, mainUser).json()
        about = f'signIn-test: all data is correct\n{response}'
        self.assertEqual(response['result'], 'ok', about)

        response = self.client.post(self.signin_api, mainUser).json()
        about = f'signIn-test: user did logged in\n{response}'
        self.assertEqual(response['result'], 'error', about)
