# backend/accounts/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = [
            'email', 'full_name', 'role',
            'company_name', 'password', 'password2'
        ]

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        if data.get('role') == 'employer' and not data.get('company_name'):
            raise serializers.ValidationError(
                "Employers must provide a company name."
            )
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = [
            'id', 'email', 'full_name',
            'role', 'company_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id':           self.user.id,
            'email':        self.user.email,
            'full_name':    self.user.full_name,
            'role':         self.user.role,
            'company_name': self.user.company_name,
        }
        return data