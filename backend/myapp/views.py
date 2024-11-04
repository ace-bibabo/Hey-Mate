import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from .models_bak import ChatBot, Prompt, PromptGroup
from .serializers import PromptSerializer, PromptGroupSerializer, question_schema, response_schema

class ChatAPIView(APIView):
    bot = ChatBot()  # Singleton instance

    @swagger_auto_schema(
        operation_id="chat_with_bot",
        operation_summary="Chat with the bot",
        operation_description="Send a question to the bot and receive an answer",
        request_body=question_schema,
        responses={200: response_schema}
    )
    def post(self, request, *args, **kwargs):
        """Process POST request, return chatbot reply"""
        question = request.data.get('question')
        upload_file = request.FILES.get('image')
        if not question:
            if not upload_file:
                return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                question = "This is a task to convert different diagrams to a BPMN 2.0 XML format."

        print("user initial question", question)
        feedback = self.bot.answer(question, upload_file)
        feedback_lower = feedback.lower()
        type = "capabilityMap" if "```json" in feedback_lower else "image" if "```xml" in feedback_lower else "text"

        response_data = {
            "answer": feedback,
            "type": type
        }
        print(response_data)

        return Response({"answer": response_data}, status=status.HTTP_200_OK)

class PromptListCreateAPIView(APIView):
    @swagger_auto_schema(
        operation_id="list_prompts",
        operation_summary="List prompts",
        operation_description="Retrieve a list of all prompts.",
        responses={200: PromptSerializer(many=True), 500: "Internal Server Error"}
    )
    def get(self, request, *args, **kwargs):
        try:
            prompts = Prompt.objects.all()
            serializer = PromptSerializer(prompts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_id="create_prompt",
        operation_summary="Create a new prompt",
        operation_description="Create a new prompt with the provided text.",
        request_body=PromptSerializer,
        responses={200: PromptSerializer, 500: "Internal Server Error"}
    )
    def post(self, request, *args, **kwargs):
        serializer = PromptSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PromptDetailAPIView(APIView):
    @swagger_auto_schema(
        operation_id="retrieve_prompt",
        operation_summary="Retrieve a prompt",
        operation_description="Retrieve a prompt by its ID.",
        responses={200: PromptSerializer, 500: "Internal Server Error"}
    )
    def get(self, request, id, *args, **kwargs):
        try:
            prompt = Prompt.objects.get(pk=id)
            serializer = PromptSerializer(prompt)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Prompt.DoesNotExist:
            return Response({"error": "Prompt not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_id="update_prompt",
        operation_summary="Update a prompt",
        operation_description="Update the text of a prompt by its ID.",
        request_body=PromptSerializer,
        responses={200: PromptSerializer, 500: "Internal Server Error"}
    )
    def put(self, request, id, *args, **kwargs):
        try:
            prompt = Prompt.objects.get(pk=id)
            serializer = PromptSerializer(prompt, data=request.data)
            if serializer.is_valid():
                try:
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Prompt.DoesNotExist:
            return Response({"error": "Prompt not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_id="delete_prompt",
        operation_summary="Delete a prompt",
        operation_description="Delete a prompt by its ID.",
        responses={200: "No Content", 500: "Internal Server Error"}
    )
    def delete(self, request, id, *args, **kwargs):
        try:
            prompt = Prompt.objects.get(pk=id)
            prompt.delete()
            return Response(status=status.HTTP_200_OK)
        except Prompt.DoesNotExist:
            return Response({"error": "Prompt not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DefaultPromptAPIView(APIView):
    @swagger_auto_schema(
        operation_id="get_default_prompts",
        operation_summary="Retrieve the default prompts",
        operation_description="Retrieve the prompts marked as is_default=True.",
        responses={200: PromptSerializer(many=True), 500: "Internal Server Error"}
    )
    def get(self, request, *args, **kwargs):
        try:
            prompts = Prompt.objects.filter(is_default=True)
            serializer = PromptSerializer(prompts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PromptGroupListCreateAPIView(APIView):
    @swagger_auto_schema(
        operation_id="list_prompt_groups",
        operation_summary="List all prompt groups",
        operation_description="Retrieve a list of all prompt groups.",
        responses={200: PromptGroupSerializer(many=True), 500: "Internal Server Error"}
    )
    def get(self, request, *args, **kwargs):
        try:
            groups = PromptGroup.objects.all()
            serializer = PromptGroupSerializer(groups, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_id="create_prompt_group",
        operation_summary="Create a new prompt group",
        operation_description="Create a new prompt group with the provided name.",
        request_body=PromptGroupSerializer,
        responses={200: PromptGroupSerializer, 500: "Internal Server Error"}
    )
    def post(self, request, *args, **kwargs):
        serializer = PromptGroupSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PromptGroupDetailAPIView(APIView):
    @swagger_auto_schema(
        operation_id="retrieve_prompt_group",
        operation_summary="Retrieve a prompt group",
        operation_description="Retrieve a prompt group by its ID.",
        responses={200: PromptGroupSerializer, 500: "Internal Server Error"}
    )
    def get(self, request, id, *args, **kwargs):
        try:
            group = PromptGroup.objects.get(pk=id)
            serializer = PromptGroupSerializer(group)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PromptGroup.DoesNotExist:
            return Response({"error": "Prompt group not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_id="update_prompt_group",
        operation_summary="Update a prompt group",
        operation_description="Update the name of a prompt group by its ID.",
        request_body=PromptGroupSerializer,
        responses={200: PromptGroupSerializer, 500: "Internal Server Error"}
    )
    def put(self, request, id, *args, **kwargs):
        try:
            group = PromptGroup.objects.get(pk=id)
            serializer = PromptGroupSerializer(group, data=request.data)
            if serializer.is_valid():
                try:
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except PromptGroup.DoesNotExist:
            return Response({"error": "Prompt group not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_id="delete_prompt_group",
        operation_summary="Delete a prompt group",
        operation_description="Delete a prompt group by its ID.",
        responses={200: "No Content", 500: "Internal Server Error"}
    )
    def delete(self, request, id, *args, **kwargs):
        try:
            group = PromptGroup.objects.get(pk=id)
            group.delete()
            return Response(status=status.HTTP_200_OK)
        except PromptGroup.DoesNotExist:
            return Response({"error": "Prompt group not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PromptByGroupAPIView(APIView):
    @swagger_auto_schema(
        operation_id="list_prompts_by_group",
        operation_summary="List all prompts by group",
        operation_description="Retrieve all prompts for a given group ID.",
        responses={200: PromptSerializer(many=True), 500: "Internal Server Error"}
    )
    def get(self, request, group_id, *args, **kwargs):
        try:
            prompts = Prompt.objects.filter(group=group_id)
            serializer = PromptSerializer(prompts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)