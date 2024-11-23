# System Architecture and Design

## Overview

This application provides a chatbot interface designed for **Admins** and **Users**. Admins configure prompts that guide the chatbot's responses, while Users interact with the chatbot to gain specific insights based on the local knowledge base.

An advanced feature, **Retrieval-Augmented Generation (RAG)**, enables the chatbot to retrieve and generate answers based on user-uploaded documents, providing responses grounded in specific knowledge.

## System Roles and Responsibilities

- **Admin**: Configures and manages prompts through the admin interface to ensure that the chatbot provides relevant and accurate responses.
- **Users**: Queries the chatbot with industry-specific questions, uploads files or images for knowledge enrichment, and receives structured responses.

## System Architecture Diagram

### Components and Interactions

1. **Admin Interface**:
   - Admins configure prompts through the admin terminal, which are stored in a dedicated SQLite database (Prompt Library).

2. **Prompt Library**:
   - A SQLite database holding all configured prompts, accessible only to the backend server for efficient prompt retrieval and updates.

3. **Prompt Engine**:
   - Retrieves relevant prompts from the Prompt Library based on user queries.
   - Processes user-uploaded files and images, combining this input with stored prompts to create an API request for the chatbot.

4. **Retrieval-Augmented Generation (RAG) Module using LangChain**:
   - Implements RAG to leverage user-uploaded documents as contextual knowledge sources.
   - **Document Ingestion**: Supports various file formats (e.g., PDF, DOCX, TXT) and extracts relevant knowledge from these documents using LangChain’s document loader.
   - **Embedding and Retrieval**: Uses LangChain to create embeddings of the extracted text and stores them in a FAISS vector database.
   - **Disk-Based Persistence**: FAISS’s save_local and load_local methods ensure that embeddings are saved across application restarts.
   - **Contextual Query Retrieval**: When a query is received, LangChain retrieves relevant information from the uploaded documents using similarity search and integrates it into the prompt.
   - This module allows the chatbot to generate answers that are based on specific knowledge provided by the user, improving accuracy and relevance.

6. **LLM (Large Language Model)**:
   - The Prompt Engine sends API requests to OpenAI's LLM (GPT-4.0), which processes combined prompts and retrieved information from the RAG module.
   - The LLM generates responses using both the pre-configured prompts and user-specific data as context.

7. **Visualization Engine**:
   - Formats the response from the LLM to ensure compatibility with the front-end display.

8. **Chatbot Interface**:
   - Displays responses to the Users in a conversational format and supports interactions like file uploads and image processing.

### Workflow of Capability Components

<img width="915" alt="Screenshot 2024-11-23 at 2 31 30 pm" src="https://github.com/user-attachments/assets/35f2c09e-ff87-4e04-abb2-ba3cf8a5ba1c">



1. **Prompt Setup by Admin**:
   - The Admin configures prompts through the admin interface, and these are stored in the Prompt Library.

2. **User Query with File Upload**:
   - Users submit queries and can upload files containing industry-specific information. The Prompt Engine and RAG module process these inputs.

3. **Processing and RAG-Enhanced Response Generation**:
   - The Prompt Engine retrieves relevant prompts and combines them with user-uploaded data.
   - The RAG module extracts and retrieves specific content from the uploaded files to enhance the context of the API request.
   - Generated embeddings for document chunks are stored in a FAISS vector store for similarity-based retrieval.
   - The enriched request is sent to the LLM, which generates a response based on both stored prompts and specific user knowledge.

4. **Response Delivery**:
   - The chatbot interface displays the response, enriched by the RAG module, providing the user with an answer that reflects the uploaded document's context.

## Technology Stack

<img width="306" alt="Screenshot 2024-11-23 at 2 33 53 pm" src="https://github.com/user-attachments/assets/2cdfc152-d35e-4485-a96b-911f064fc4d6">

### Front-End
- **React JS**: Used for building dynamic user interfaces with a component-based structure for reusability.
- **PrimeReact**: A React component library providing pre-built, styled components to streamline UI development.
- **DOMPurify**: Used for sanitizing inputs and preventing XSS attacks, ensuring secure rendering of text content.

### Back-End
- **Django**: Serves as the primary framework, offering ORM, authentication, form processing, and other web application capabilities.
- **Django REST Framework (DRF)**: Facilitates API development, enabling efficient communication between front-end and back-end.
- **SQLite**: A lightweight database for prompt storage during development, with an option to scale to PostgreSQL or MySQL for production.
- **Swagger**: Provides interactive API documentation, allowing easy API testing and debugging.
- **LangChain**: Integrates with OpenAI for prompt handling and context management, and also supports RAG by enabling document ingestion, embedding, and retrieval.
- **OpenAI (GPT-4)**: A language model that processes complex queries, generating responses based on configured prompts and user-specific data.

### DevOps
- **Docker**: Containerizes the application for consistency across different environments, simplifying deployment and scaling.
- **Git**: Manages source code version control, supporting team collaboration and maintaining code integrity.

## User Interface Design

### Chat Page
- **Key Features**:
  - **Text Interaction**: Supports direct text conversation with the chatbot.
  - **File Upload**: Allows Users to upload files (e.g., PDFs, DOCX, TXT) as knowledge sources for RAG.
  - **RAG-Enhanced Responses**: Generates answers based on both configured prompts and user-provided documents.

- **Enhanced UX Features**:
  - **Auto-Scroll**: Automatically scrolls to the latest response.
  - **Chat History Storage**: Retains chat history in local storage for reference.
  - **Upload Indicators**: Displays a loading indicator during processing and notifies users of unsupported file types.

### Admin Page

- **Primary Functions**:
  - **Prompt Configuration**: Admins can view, edit, and set default prompts to guide the chatbot’s behavior.
  - **Prompt Management**: Allows efficient management of prompt content to improve chatbot responses.
  - **Authentication (Future Work)**: Plans to add identity verification for secure access to the admin interface.

## Key Back-End Features

- **Modular Architecture**: The backend uses a modular design, enabling independent development and maintenance of functional components.
- **Efficient Data Management**: Optimized for handling diverse data types and relationships, with indexing for improved query performance.
- **Stable API Services**: DRF enables stable API interfaces, supporting reliable communication between the front-end and back-end.

## Chatbot Capabilities

<img width="627" alt="Screenshot 2024-11-23 at 2 33 02 pm" src="https://github.com/user-attachments/assets/500df321-4c6e-41f1-9277-9ce1e06406c5">

- **Prompt Engine**: Manages prompt retrieval, processing, and input-output handling.
- **RAG with LangChain**: Integrates LangChain’s document loader, embedding, and retrieval capabilities to enhance responses using user-uploaded documents.
- **LangChain Integration**: Handles prompt chaining and context retention, ensuring relevant responses based on past interactions.
- **Multi-Modal Input Processing**: Accepts and processes different types of inputs (text, files, images) to deliver tailored responses.
- **Adaptive System Prompting**: Default and system prompts define the chatbot’s behavior, guiding its responses based on query type.
- **Contextual Retrieval Setup**: Configured similarity search within the FAISS vector store to retrieve relevant content based on user queries.
