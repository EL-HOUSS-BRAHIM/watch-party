from django.test import TestCase

from apps.authentication.models import EmailVerification, User
from apps.authentication.serializers import UserRegistrationSerializer


class UserRegistrationSerializerTests(TestCase):
    """Tests for the user registration serializer."""

    def test_user_registration_serializer_creates_user(self):
        serializer = UserRegistrationSerializer(
            data={
                'email': 'newuser@example.com',
                'password': 'StrongPass123!',
                'confirm_password': 'StrongPass123!',
                'first_name': 'New',
                'last_name': 'User',
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertIsInstance(user, User)
        self.assertEqual(user.email, 'newuser@example.com')
        self.assertTrue(user.check_password('StrongPass123!'))

    def test_user_registration_serializer_password_mismatch_error(self):
        serializer = UserRegistrationSerializer(
            data={
                'email': 'mismatch@example.com',
                'password': 'Password123!',
                'confirm_password': 'Password321!',
                'first_name': 'Mismatch',
                'last_name': 'User',
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_user_registration_creates_email_verification_token(self):
        serializer = UserRegistrationSerializer(
            data={
                'email': 'verifyme@example.com',
                'password': 'VerifyPass123!',
                'confirm_password': 'VerifyPass123!',
                'first_name': 'Verify',
                'last_name': 'Me',
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        tokens = EmailVerification.objects.filter(user=user)
        self.assertEqual(tokens.count(), 1)
        token = tokens.first()
        self.assertFalse(token.is_used)
        self.assertTrue(token.token)
