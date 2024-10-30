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
        you are a EA-Assist bot aims to help enterprise architects to perform
        modelling on enterprise elements. It may range from
        definitions to customized entity mappings based on generic industry standards and should also
        be capable of performing entity extraction from unstructured documents.
        """
        systemMsgDefault = {"type": "text", "text": f"{defaultPrompt}"}
        systemMsgs.append(systemMsgDefault)

        if upload_file is None:
            # prompt from rules
            prompt_rules = f"""
            Based on the user's input, here are some conversational rules to follow:
                1. If the user's question involves creating a Capability Map but does not provide details on the number of levels needed or the number of capabilities required for each level, politely inquire about these specifics to ensure comprehensive support. Always prioritize the user's immediate questions and needs. Use follow-up questions judiciously to enhance clarity and avoid overwhelming the user with requests for information.
                2. If the user's question involves generating a Capability Map, please generate the corresponding JSON and CSV content based on the user's request. A question involves a Capability Map if it includes phrases like "Capability Map," "capability map," "generate a capability map," "give a capability map," or any similar variations. And return the output in the following format:
                ```JSON
                {{
                    "Level 1": {{
                        "Capability 1": "Description",
                        "Capability 2": "Description",
                        "Capability 3": "Description",
                        "Capability 4": "Description",
                        "Capability 5": "Description"
                    }},
                    "Level 2": {{
                        "Capability 1": "Description",
                        "Capability 2": "Description",
                        "Capability 3": "Description",
                        "Capability 4": "Description",
                        "Capability 5": "Description"
                    }}
                }}
                ```,
                ```csv
                Level,Capability,Description
                Level 1,Capability 1,Description
                Level 1,Capability 2,Description
                Level 1,Capability 3,Description
                Level 1,Capability 4,Description
                Level 1,Capability 5,Description
                Level 2,Capability 1,Description
                Level 2,Capability 2,Description
                Level 2,Capability 3,Description
                Level 2,Capability 4,Description
                Level 2,Capability 5,Description
                ```.
                The user's request is: {question}
            """
            # system prompt
            systemMsgs.append({"type": "text", "text": f"{prompt_rules}"})

            # prompt from db
            url = "http://localhost:8000/api/prompts/default/"
            headers = {
                'accept': 'application/json',
                'X-CSRFToken': 'CJXX8NrHT3MadHMw7DkQGlzqHbYlBrwURqMhqvT08axpSFEhufdu2WUHxQbOWdf4'
            }
            response = requests.get(url, headers=headers)
            prompt_content = response.json()

            user_prompt = ""
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
                     you are a bot to convert different diagrams to a BPMN 2.0 XML format by following these instructions:

1. Create a BPMN 2.0 XML format that includes graphical information for all process elements. Ensure not to omit any parts.
2. Emphasize that the output must include layout and positional details for each element. The graphical information (positions and sizes of elements) must be included for completeness
3. Include <bpmndi:BPMNShape> elements for each BPMN element to define its graphical representation.
4. Include <bpmndi:BPMNEdge> elements for each connection to ensure arrows are properly connected between elements.
5. Detail each connection between the elements, showing how each element interacts within the process.
6. Ensure all BPMN elements have the bpmn: namespace prefix in the generated XML.
7. When presenting XML content, format it using triple backticks and label it as XML, like this
                      ```xml
                        xml content
                        ```
                        
 For example:
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  id="Definitions_1">
    <bpmn:process id="CarRentalProcess" isExecutable="true">
        <bpmn:startEvent id="StartEvent_1" name="Car rental customer starts request">
            <bpmn:outgoing>Flow_1</bpmn:outgoing>
        </bpmn:startEvent>
        <bpmn:task id="Task_1" name="Create order for vendor">
            <bpmn:incoming>Flow_1</bpmn:incoming>
            <bpmn:outgoing>Flow_2</bpmn:outgoing>
        </bpmn:task>
        <bpmn:task id="Task_2" name="Check car inventory">
            <bpmn:incoming>Flow_2</bpmn:incoming>
            <bpmn:outgoing>Flow_3</bpmn:outgoing>
        </bpmn:task>
        <bpmn:task id="Task_3" name="Notify customer of availability">
            <bpmn:incoming>Flow_3</bpmn:incoming>
            <bpmn:outgoing>Flow_4</bpmn:outgoing>
        </bpmn:task>
        <bpmn:task id="Task_4" name="Make reservation">
            <bpmn:incoming>Flow_4</bpmn:incoming>
            <bpmn:outgoing>Flow_5</bpmn:outgoing>
        </bpmn:task>
        <bpmn:task id="Task_4_1" name="Process customer reservation and payment information">
            <bpmn:incoming>Flow_5</bpmn:incoming>
            <bpmn:outgoing>Flow_6</bpmn:outgoing>
        </bpmn:task>
        <bpmn:task id="Task_4_2" name="Confirm rental and payment information">
            <bpmn:incoming>Flow_6</bpmn:incoming>
            <bpmn:outgoing>Flow_7</bpmn:outgoing>
        </bpmn:task>
        <bpmn:endEvent id="EndEvent_1" name="Reservation confirmed">
            <bpmn:incoming>Flow_7</bpmn:incoming>
        </bpmn:endEvent>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>
        <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Task_2"/>
        <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_2" targetRef="Task_3"/>
        <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_3" targetRef="Task_4"/>
        <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_4" targetRef="Task_4_1"/>
        <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_4_1" targetRef="Task_4_2"/>
        <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_4_2" targetRef="EndEvent_1"/>
    </bpmn:process>
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="CarRentalProcess">
            <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
                <dc:Bounds x="100" y="100" width="36" height="36"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
                <dc:Bounds x="200" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_2_di" bpmnElement="Task_2">
                <dc:Bounds x="350" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_3_di" bpmnElement="Task_3">
                <dc:Bounds x="500" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_4_di" bpmnElement="Task_4">
                <dc:Bounds x="650" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_4_1_di" bpmnElement="Task_4_1">
                <dc:Bounds x="800" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_4_2_di" bpmnElement="Task_4_2">
                <dc:Bounds x="950" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
                <dc:Bounds x="1100" y="100" width="36" height="36"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
                <di:waypoint x="136" y="118"/>
                <di:waypoint x="200" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
                <di:waypoint x="300" y="140"/>
                <di:waypoint x="350" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
                <di:waypoint x="450" y="140"/>
                <di:waypoint x="500" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
                <di:waypoint x="600" y="140"/>
                <di:waypoint x="650" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
                <di:waypoint x="750" y="140"/>
                <di:waypoint x="800" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
                <di:waypoint x="900" y="140"/>
                <di:waypoint x="950" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
                <di:waypoint x="1050" y="140"/>
                <di:waypoint x="1100" y="140"/>
            </bpmndi:BPMNEdge>
        </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
</bpmn:definitions>

This example includes both <bpmndi:BPMNShape> and <bpmndi:BPMNEdge> elements with precise coordinates and dimensions to ensure proper graphical representation.
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
