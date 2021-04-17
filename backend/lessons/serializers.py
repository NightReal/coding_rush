from rest_framework import serializers
from .models import (
    Code,
    Lesson,
)


class CodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Code
        fields = ('language', 'code')
        read_only_fields = fields


class LessonSerializer(serializers.ModelSerializer):
    codes = CodeSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ('id', 'title', 'topic', 'description', 'codes')
        read_only_fields = fields


class LessonListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ('id', 'title', 'topic')
        read_only_fields = fields
