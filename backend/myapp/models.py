# Import standard library modules
import os
import base64
from io import BytesIO
from enum import Enum
import csv

# Import third-party libraries
import requests
import pdfplumber
from dotenv import load_dotenv

import logging

# Import Django modules
from django.db import models

# Import LangChain related modules
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.schema import Document
from langchain.chains import RetrievalQA

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
        systemMsgList = []
        systemMsgList.extend([self.set_default_prompt(), self.set_system_prompt(), self.set_admin_prompt()])
        systemMsgs = SystemMessage(content=systemMsgList)

        humanMsgList = []
        humanMsgList.extend([self.set_human_msg(question)])
        humanMsgs = HumanMessage(content=humanMsgList)

        # humanMsgs.extend(multi_modal_questions())

        if upload_file:
            file_result = self.process_upload_files(upload_file)
            file_content = file_result['content']
            return self.update_knowledge_base(file_content)
            # multiModalInputs = self.multi_modal_questions(file_content)

        self.chat_history.messages.extend([humanMsgs, systemMsgs])

        try:
            response = self.search_from_knowledge_base(self.chat_history.messages)
            if response is not None:
                print("Local Database Res =>")
                self.chat_history.add_ai_message(response)
                return response

        except Exception as e:
            print("An error occurred while searching from the knowledge base:", e)
            response = None

        if response is None:
            response = llm.invoke(self.chat_history.messages)
            print("ChatGPT Res =>")
            self.chat_history.add_ai_message(response)
            return response.content

    def set_default_prompt(self):
        defaultPrompt = """
                you are a data dict bot aims to help users to answers the data relevant qs in cybersecurity.
                """

        return {"type": "text", "text": f"{defaultPrompt}"}

    def set_system_prompt(self):
        # prompt from rules
        system_prompt_str = f"""
                        Based on the user's input, here are some conversational rules to follow:
                            1. The user's request
                            2. output passe need to follow
                        """
        return {"type": "text", "text": f"{system_prompt_str}"}

    def conn_prompt_db(self):
        url = f"{api_host}:{api_port}/api/prompts/default/"
        headers = {
            'accept': 'application/json',
            'X-CSRFToken': 'CJXX8NrHT3MadHMw7DkQGlzqHbYlBrwURqMhqvT08axpSFEhufdu2WUHxQbOWdf4'
        }
        return url, headers

    def set_admin_prompt(self):
        # prompt from db
        url, headers = self.conn_prompt_db()
        response = requests.get(url, headers=headers)
        prompt_content = response.json()

        # print('prompt_content: {}'.format(prompt_content))

        admin_set_prompt = []

        if isinstance(prompt_content, list):
            for prompt in prompt_content:
                admin_set_prompt.append(prompt.get('text', ''))
        else:
            admin_set_prompt.append(prompt_content.get('text', ''))

        admin_prompt_str = ', '.join(admin_set_prompt)
        return {"type": "text", "text": f"{admin_prompt_str}"}

    def set_human_msg(self, question):
        return {"type": "text", "text": f"{question}"}

    def multi_modal_questions(self, upload_file):
        file_result = self.upload_file(upload_file)
        multi_modal_questions = []
        file_content = file_result['content']
        if file_result['type'] == FileType.FILE.value:
            multi_modal_questions.append({"type": "text", "text": f"{file_content}"})
        if file_result['type'] == FileType.IMAGE.value:
            multi_modal_questions.append(
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{file_content}"}}, )

        return multi_modal_questions

    def process_upload_files(self, upload_file):
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

        elif file_type_ext == 'csv':
            file_type = FileType.FILE
            csv_content = upload_file.read().decode('utf-8').splitlines()
            reader = csv.reader(csv_content)
            content = "\n".join([", ".join(row) for row in reader])
        else:
            file_type = FileType.UNKNOWN
            content = "Unsupported file type"

        return {"type": file_type.value, "content": content}

    def update_knowledge_base(self, content):
        # documents = [Document(page_content=content)]
        embeddings = OpenAIEmbeddings()
        index_path = "faiss_index"

        try:
            # Attempt to load the existing FAISS index
            vector_store = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
            # vector_store.add_documents(documents)
        except (FileNotFoundError, RuntimeError):
            # Create a new FAISS index if loading fails
            print(f"FAISS index not found at {index_path}. Creating a new index.")
            # vector_store = FAISS.from_documents(documents, embeddings)
            vector_store = FAISS.from_texts([content], embeddings)

        # Ensure the directory exists before saving
        os.makedirs(index_path, exist_ok=True)
        vector_store.save_local(index_path)

        return "Uploaded to local knowledge base successfully"

    def extract_text_from_chat_history(self, chat_history):
        """
        Extract all text content from ChatMessageHistory or a list of messages.
        """
        extracted_texts = []

        # Check if input is a ChatMessageHistory instance
        if hasattr(chat_history, 'messages'):
            messages = chat_history.messages
        elif isinstance(chat_history, list):  # Handle direct list input
            messages = chat_history
        else:
            raise ValueError("Invalid input: Expected ChatMessageHistory or list of messages.")

        # Extract text from each message
        for message in messages:
            if isinstance(message, (HumanMessage, AIMessage, SystemMessage)):
                if isinstance(message.content, list):
                    # Extract 'text' field from each dictionary in content
                    for item in message.content:
                        if isinstance(item, dict) and 'text' in item:
                            extracted_texts.append(item['text'])
                elif isinstance(message.content, str):
                    # Directly append if content is a string
                    extracted_texts.append(message.content)

        return '\n'.join(extracted_texts)

    def search_from_knowledge_base(self, question):
        embeddings = OpenAIEmbeddings()
        index_path = "faiss_index"

        try:
            vector_store = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
            print("FAISS index loaded successfully.")
        except (FileNotFoundError, RuntimeError):
            raise ValueError("FAISS index is missing or corrupted. Please build the index first.")

        if vector_store.index.ntotal == 0:
            return None
            # raise ValueError("FAISS index is empty. Ensure you have added documents to the index.")

        retriever = vector_store.as_retriever()

        if not isinstance(question, str):
            question = self.extract_text_from_chat_history(question)
            # raise ValueError("Input question must be a string.")

        qa_chain = RetrievalQA.from_chain_type(
            llm=self.chatmodel,
            chain_type="stuff",
            retriever=retriever
        )

        answer = qa_chain.run(question)
        return answer


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
