### Autogen Chat Demo

Created this Autogen Chat Demo as part of a larger project but felt it deserved to be shared publicly. This demo showcases the integration of GPT-4 with a React-based frontend and a Python backend, providing a foundation for building advanced conversational AI applications.

### OpenAI API Key Setup

To use GPT-4 or other OpenAI models, you need to set up an OpenAI API key. Follow these steps:

1. Obtain your API key from [OpenAI](https://platform.openai.com/).
2. Set the API key as an environment variable:
   - On macOS/Linux:
     ```bash
     export OPENAI_API_KEY=your_api_key_here
     ```
   - On Windows (Command Prompt):
     ```cmd
     set OPENAI_API_KEY=your_api_key_here
     ```
   - On Windows (PowerShell):
     ```powershell
     $env:OPENAI_API_KEY="your_api_key_here"
     ```
3. Replace `your_api_key_here` with your actual API key.

Ensure this environment variable is set before running any scripts that require GPT-4 or OpenAI API access.

## Setting Up Python Environment

To ensure a clean and isolated Python environment, it's recommended to use a virtual environment and install the required dependencies from the `requirements.txt` file. Follow these steps:

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Once done, you can deactivate the virtual environment by running:
   ```bash
   deactivate
   ```

## Frontend UI

This branch contains frontend UI code written with React.js. The React-based interface provides an interactive and user-friendly experience, enabling seamless interaction with various features of the application.

### Running the React App

To run the React app locally, follow these steps:

1. Ensure you have [Node.js](https://nodejs.org/) installed on your system.
2. Navigate to the project directory:
   ```bash
   cd path/to/your/project/frontend-ui
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173` to view the app.

### To Run Everything (Do it in this order)

# for flask upload api run

```bash
   python media_api.py
```

# for autogen/socket run

```bash
   python autogen/main.py
```

# for frontend run

```bash
   cd frontend-ui
   npm run dev
```
