from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from .models import Employee


class UserSerializer(serializers.ModelSerializer):
    employee_id = serializers.SerializerMethodField()

    class Meta:
        from django.contrib.auth import get_user_model
        model = get_user_model()
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'role', 'employee_id')

    def get_employee_id(self, obj):
        try:
            return obj.employee_profile.id
        except Exception:
            return None


class MeView(APIView):
    """GET /api/accounts/me/ — returns current user info including role."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
