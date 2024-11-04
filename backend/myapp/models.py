# Import standard library modules
import os
import base64
from io import BytesIO
from enum import Enum

# Import third-party libraries
import requests
import pdfplumber
from dotenv import load_dotenv

import logging

# Import Django modules
from django.db import models

# Import LangChain related modules
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.chat_message_histories import ChatMessageHistory

# Load environment variables
load_dotenv()
api_host = os.getenv("API_HOST", "http://localhost")
api_port = os.getenv("API_PORT", "8000")

class FileType(Enum):
    FILE = 'FILE'
    IMAGE = 'IMAGE'
    UNKNOWN = 'UNKNOWN'

class ChatBot:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ChatBot, cls).__new__(cls)
            cls._instance.initialize_bot()
        return cls._instance

    def initialize_bot(self):
        self.chatmodel = ChatOpenAI(
            model="gpt-4-turbo",
            temperature=0,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        self.chat_history = ChatMessageHistory()
        print("chat bot initialized")

    def answer(self, question, upload_file=None):
        content = self.chain(question, upload_file)
        return content

    # def chain(self, question, image_path="logical_dataflow.png"):
    def chain(self, question, upload_file=None):
        llm = self.chatmodel
        systemMsgs = []
        defaultPrompt = """
        you are a data dict bot aims to help users to answers the data relevant qs in cybersecurity.
        """
        systemMsgDefault = {"type": "text", "text": f"{defaultPrompt}"}
        systemMsgs.append(systemMsgDefault)

        if upload_file is None:
            # prompt from rules
            prompt_rules = f"""
            Based on the user's input, here are some conversational rules to follow:
                1. 
                The user's request is: {question}
            """
            # system prompt
            systemMsgs.append({"type": "text", "text": f"{prompt_rules}"})

            # prompt from db
            url = f"{api_host}:{api_port}/api/prompts/default/"
            headers = {
                'accept': 'application/json',
                'X-CSRFToken': 'CJXX8NrHT3MadHMw7DkQGlzqHbYlBrwURqMhqvT08axpSFEhufdu2WUHxQbOWdf4'
            }
            response = requests.get(url, headers=headers)
            prompt_content = response.json()

            user_prompt = []

            if isinstance(prompt_content, list):
                for prompt in prompt_content:
                    user_prompt.append(prompt.get('text', ''))
            else:
                user_prompt.append(prompt_content.get('text', ''))

            user_prompt_str = ', '.join(user_prompt)
            systemMsgs.append({"type": "text", "text": f"{user_prompt_str}"})

            systemMsg = SystemMessage(content=systemMsgs)

            huamanMsg = HumanMessage(
                content=[
                    {"type": "text", "text": f"{question}"},
                ],
            )

        else:
            human_content_list = []
            human_content_list.append({"type": "text", "text": f"{question}"})

            file_result = self.process_uploaded_file(upload_file)
            file_content = file_result['content']
            if file_result['type'] == FileType.FILE.value:
                human_content_list.append({"type": "text", "text": f"{file_content}"})
            if file_result['type'] == FileType.IMAGE.value:
                human_content_list.append({"type": "image_url", "image_url": {"url": f"data:image/png;base64,{file_content}"}},)
            
            systemMsg = SystemMessage(
                content=[
                    {"type": "text",
                    "text": """
                     you are a bot to help users to get a better understanding of its data, try to answer by following these instructions:
                    1. 
                    """}
                ]
            )
            huamanMsg = HumanMessage(content=human_content_list)
            print(huamanMsg)

        self.chat_history.messages.extend([huamanMsg, systemMsg])

        response = llm.invoke(self.chat_history.messages)
        print("Initial Res =>", response)
        self.chat_history.add_ai_message(response)
        return response.content
    
    def process_uploaded_file(self, upload_file):
        file_type_ext = upload_file.name.split(".")[-1].lower()
        if file_type_ext == 'txt':
            file_type = FileType.FILE
            file_content = upload_file.read().decode('utf-8')
            content = file_content

        elif file_type_ext == 'pdf':
            file_type = FileType.FILE
            file_content = upload_file.read()
            file_like_object = BytesIO(file_content)
            
            text = ""
            with pdfplumber.open(file_like_object) as pdf:
                for page in pdf.pages:
                    text += page.extract_text()       
            content = text
    
        elif file_type_ext in ['jpg', 'jpeg', 'png']:
            file_type = FileType.IMAGE
            base64_image = base64.b64encode(upload_file.read()).decode('utf-8')
            content = base64_image
        
        else:
            file_type = FileType.UNKNOWN
            content = "Unsupported file type"

        return {"type": file_type.value, "content": content}

class Prompt(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.TextField()
    name = models.TextField(default="test")
    is_default = models.IntegerField(default=0)  # 添加默认值
    group = models.IntegerField()

    def __str__(self):
        return self.name


class PromptGroup(models.Model):
    group_id = models.AutoField(primary_key=True)
    group_name = models.CharField(max_length=255)
