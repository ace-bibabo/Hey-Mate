from rest_framework import serializers
from drf_yasg import openapi
from .models_bak import Prompt, PromptGroup

# Define the request body and response body in the Swagger document
question_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'question': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Question for the chatbot',
            example='how are you'
        ),
    }
)
response_schema = openapi.Response(
    description="Chatbot response",
    examples={
        "application/json": {
            "answer": "I'm doing great, thank you!"
        }
    }
)

class PromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prompt
        fields = ['id', 'text', 'is_default', 'name', 'group']

class PromptGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromptGroup
        fields = ['group_id', 'group_name']