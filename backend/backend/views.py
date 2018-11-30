from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response

from django.contrib.auth.models import User

class UserLoginView(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid()
        user = serializer.validated_data['user']
        token = Token.objects.get(user=user)
        return Response({
            'username': user.username,
            'token': token.key,
            'id': user.pk
        })
