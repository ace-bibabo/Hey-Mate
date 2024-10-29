# System Architecture and Design

## Overview

This system provides a robust chatbot interface designed for **Admins** and **Users**. Admins configure prompts that guide the chatbot's responses, while Users interact with the chatbot to gain industry-specific insights. 

An advanced feature, **Retrieval-Augmented Generation (RAG)**, enables the chatbot to retrieve and generate answers based on user-uploaded documents, providing responses grounded in specific user-provided knowledge.

## System Roles and Responsibilities

- **Admin**: Configures and manages prompts through the admin interface to ensure that the chatbot provides relevant and accurate responses.
- **Users**: Queries the chatbot with industry-specific questions, uploads files or images for knowledge enrichment, and receives structured responses.

## System Architecture Diagram
<img width="648" alt="Screenshot 2024-10-29 at 3 22 40 pm" src="https://github.com/user-attachments/assets/5cd571bb-fef1-4d9d-a5d9-f7278d31b4e1">

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
   - **Embedding and Retrieval**: Uses LangChain to create embeddings of the extracted text and stores them in a vector database.
   - **Contextual Query Retrieval**: When a query is received, LangChain retrieves relevant information from the uploaded documents using similarity search and integrates it into the prompt.
   - This module allows the chatbot to generate answers that are based on specific knowledge provided by the user, improving accuracy and relevance.
  
<img width="786" alt="Screenshot 2024-10-29 at 3 20 56 pm" src="https://github.com/user-attachments/assets/0da1f0ed-74d1-4920-bcdc-481302fe0777">
<img width="798" alt="Screenshot 2024-10-29 at 3 21 40 pm" src="https://github.com/user-attachments/assets/c75eca32-d8e8-4d85-9173-f2fd3c823775">
<img width="540" alt="Screenshot 2024-10-29 at 3 22 23 pm" src="https://github.com/user-attachments/assets/3349ccd0-2e90-4370-bb40-85d56ca48133">


6. **LLM (Large Language Model)**:
   - The Prompt Engine sends API requests to OpenAI's LLM (GPT-4.0), which processes combined prompts and retrieved information from the RAG module.
   - The LLM generates responses using both the pre-configured prompts and user-specific data as context.

7. **Visualization Engine**:
   - Formats the response from the LLM to ensure compatibility with the front-end display.

8. **Chatbot Interface**:
   - Displays responses to the Users in a conversational format and supports interactions like file uploads and image processing.

### Workflow of Capability Components

1. **Prompt Setup by Admin**:
   - The Admin configures prompts through the admin interface, and these are stored in the Prompt Library.

2. **User Query with File Upload**:
   - Users submit queries and can upload files containing industry-specific information. The Prompt Engine and RAG module process these inputs.

3. **Processing and RAG-Enhanced Response Generation**:
   - The Prompt Engine retrieves relevant prompts and combines them with user-uploaded data.
   - The RAG module extracts and retrieves specific content from the uploaded files to enhance the context of the API request.
   - The enriched request is sent to the LLM, which generates a response based on both stored prompts and specific user knowledge.

4. **Response Delivery**:
   - The chatbot interface displays the response, enriched by the RAG module, providing the user with an answer that reflects the uploaded document's context.

## Technology Stack

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
  - **File Upload**: Allows Users to upload files (e.g., PDFs, images) as knowledge sources for RAG.
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

- **Prompt Engine**: Manages prompt retrieval, processing, and input-output handling.
- **RAG with LangChain**: Integrates LangChain’s document loader, embedding, and retrieval capabilities to enhance responses using user-uploaded documents.
- **LangChain Integration**: Handles prompt chaining and context retention, ensuring relevant responses based on past interactions.
- **Multi-Modal Input Processing**: Accepts and processes different types of inputs (text, files, images) to deliver tailored responses.
- **Adaptive System Prompting**: Default and system prompts define the chatbot’s behavior, guiding its responses based on query type.

## Limitations and Future Work

### Chat Page
- **Limitations**:
  - Does not support multiple file uploads simultaneously.
  - Lacks advanced text styling options (e.g., Markdown).
  - May have delays with large file uploads.

- **Future Enhancements**:
  - Add local file caching for improved file management.
  - Implement asynchronous file uploads to prevent blocking.
  - Introduce a more visually appealing interface.

### Admin Page
- **Limitations**:
  - No user authentication for accessing the admin interface.
  - Lacks prompt templates, making prompt setup time-consuming.

- **Future Enhancements**:
  - Add authentication to secure the admin interface.
  - Provide a template library to facilitate easier prompt setup.

### Back-End
- **Limitations**:
  - SQLite may not handle high-concurrency or large datasets efficiently in production.
  - Limited scalability in the current design.

- **Future Enhancements**:
  - Upgrade to PostgreSQL or MySQL for production.
  - Investigate microservices for improved scalability.

### Chatbot
- **Limitations**: Manual prompt updates are required for refinement.
- **Future Work**: Introduce adaptive learning to automatically improve prompt quality based on successful interactions.


---

## Timeline 

### File Upload Handling

- **Implement file upload functionality** in the chatbot interface, allowing PDF, DOCX, and TXT uploads.

- **Document Processing**: Use LangChain’s document loaders to extract text from uploaded documents. Add chunking to split long documents into smaller sections for more accurate retrieval.
Deliverables:

File upload functionality with document processing and chunking.

### FAISS Vector Store Integration and Disk Persistence

- **Embedding Creation and Storage**:Generate embeddings for document chunks using LangChain’s OpenAIEmbeddings and store them in a FAISS vector store.
- **Disk-Based Persistence**: Implement FAISS’s save_local and load_local methods to persist the FAISS index on disk, ensuring embeddings are saved across application restarts.
Deliverables:
- **Persistent FAISS** index saved to disk and loaded on startup.

### Retrieval and Contextual Response Generation

- **Contextual Retrieval Setup**: Set up similarity search within the FAISS vector store to retrieve relevant content based on user queries.

- **Prompt Conditioning for RAG**: Update prompt templates to conditionally include retrieved content, enhancing responses based on document-specific information.
Deliverables:
- Contextual retrieval pipeline integrated with the chatbot for RAG-enhanced responses.

### LLM Integration and Response Handling
- **LLM Integration**: Use LangChain’s ChatOpenAI model to send augmented prompts (with retrieved context) to the LLM.
- **Response Handling**: Display the LLM’s responses on the chatbot interface and ensure RAG-enhanced responses are formatted for easy readability.
Deliverables:
- Integrated LangChain API with prompt conditioning and response generation.
