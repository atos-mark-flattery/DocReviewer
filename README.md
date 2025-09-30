
# DocReviewer

DocReviewer is a full-stack AI-powered document review platform. It allows users to upload, classify, and manage documents (PDF, DOCX, PPTX, XLSX, TXT), and chat with an AI assistant that answers questions using only the uploaded document context. The system uses Azure Blob Storage, Azure Cognitive Search, and OpenAI (Azure) for retrieval-augmented generation (RAG).

## Features

- Upload and classify documents (supports PDF, DOCX, PPTX, XLSX, TXT)
- Store and index documents in Azure Blob Storage and Azure Cognitive Search
- Chat with an AI assistant that only uses your document context (no web search)
- Compare and query by document classification
- Remove documents and manage your document set

## Project Structure

- `RAGFrameworkFastAPI.py` — FastAPI backend (document upload, search, chat, Azure integration)
- `frontend/` — React frontend (user interface, chat, document management)

## Prerequisites

- Python 3.11+
- Node.js 16+
- Azure account with Blob Storage, Cognitive Search, and OpenAI resources
- (Optional) Azure App Service/Static Web Apps for deployment

## Backend Setup (FastAPI)

1. Install dependencies:
	```bash
	pip install -r requirements.txt
	```
2. Set environment variables in a `.env` file:
	- `CONTRACT_SEARCH_KEY` (Azure Search key)
	- `CONTRACT_ANALYSIS_APIKYEY` (Azure OpenAI key)
	- `CONTRACT_DOCINTELL_KEY` (Azure Document Intelligence key)
3. Start the backend:
	```bash
	uvicorn RAGFrameworkFastAPI:app --reload
	```
4. The API will be available at `http://localhost:8000`

## Frontend Setup (React)

1. Go to the frontend directory:
	```bash
	cd frontend
	```
2. Install dependencies:
	```bash
	npm install
	```
3. Start the frontend:
	```bash
	npm start
	```
4. The app will be available at `http://localhost:3000`

## Development Notes

- For local development, set the API URL in `frontend/src/App.js` to `http://localhost:8000`.
- For production, set the API URL to your deployed backend endpoint.
- Ensure CORS settings in FastAPI allow your frontend origin.
- Add `__pycache__/` and `*.pyc` to `.gitignore` to avoid committing Python cache files.

## Deployment

### Azure App Service (Backend)
1. Deploy the FastAPI app using Azure App Service (Python runtime).
2. Set environment variables in the Azure portal.

### Azure Static Web Apps or App Service (Frontend)
1. Build the frontend:
	```bash
	npm run build
	```
2. Deploy the `build/` folder to Azure Static Web Apps or App Service.

## License

This project is for internal/prototype use. Add your license here if open-sourcing.
