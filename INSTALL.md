### Installation Manual

**1. Environment Configuration**

This project is Dockerized. Please follow these steps to configure and deploy the application:

**Environment Variable Configuration**:

1. **Create the `.env` File**:
   Create a `.env` file in the project root directory to hold your environment variables. You can use the `.env.example` file as a reference to configure your environment variables.

   ```text
   OPENAI_API_KEY=your_openai_api_key
   HOST=your_localhost
   API_HOST=http://your_localhost
   API_PORT=8000
   CORS_ALLOWED_ORIGIN=http://your_localhost:3000
   REACT_APP_API_BASE_URL=http://your_localhost:8000/api
   ```

   Replace `your_openai_api_key` with your actual OpenAI API key. **Note**: Ensure that the `.env` file is not committed to version control. You can add `.env` to your `.gitignore` file to prevent it from being committed.

   **Steps**:
   - Copy the `.env.example` file to create a `.env` file:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file to include your actual API key:
     ```text
     OPENAI_API_KEY=your_openai_api_key
     ```

**2. Local Deployment Steps**

1. **Install Docker**:
   First, ensure that Docker is installed on your machine. If not, download and install Docker from [Docker's official website](https://www.docker.com/products/docker-desktop).

2. **Navigate to the Project Directory**:
   Open a terminal and navigate to the project root directory:
   ```bash
   cd path/to/your/project
   ```

3. **Build and Start the Application**:
   Run the following command to build and start the Docker containers:
   ```bash
   docker-compose up --build
   ```

4. **Access the Application**:
   Once the application is running, you can access it via the following URLs:
   - **Chatbot Interface**: Open a web browser and go to [http://localhost:3000/chat](http://localhost:3000/chat)
   - **Admin Interface**: Open a web browser and go to [http://localhost:3000/admin](http://localhost:3000/admin)
