from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import exceptions

from django.contrib.auth.models import User

class UserLoginView(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        is_valid = serializer.is_valid()
        if not is_valid:
            raise exceptions.AuthenticationFailed(detail="Invalid credentials")
        user = serializer.validated_data['user']
        token = Token.objects.get(user=user)
        return Response({
            'username': user.username,
            'token': token.key,
            'id': user.pk
        })
