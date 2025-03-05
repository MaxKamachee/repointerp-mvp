# RepoInterp

RepoInterp transforms any GitHub repository into an immersive, visual experience. Instead of traditional text-based documentation, users embark on a guided journey through the codebase. Each file, module, and component is represented by a visual node or "landmark" on an interactive map of the repository.

## Features

- **Visual Repository Map:** A dynamic, interactive diagram displaying the full repository structure (directories, files, modules) as interconnected nodes.

- **AI-Generated Summaries & Analysis:** Each node is paired with an AI-generated summary that explains the purpose, functionality, and key elements of the code it represents.

- **Guided Journey Experience:** The tool presents the repository as a journey, starting with an overview "map" and then leading the user through a narrative that explains how the different parts of the codebase interconnect.

- **Manual Annotation and Collaboration:** Users can add their own annotations or corrections directly into the visual journey.

## Project Structure

### Frontend

React application with components for visualization and user interface.

- `src/App.js` - Main application component
- `components/RepoMap.js` - Interactive repository visualization

### Backend

Express.js server with API endpoints for repository management and code analysis.

- `index.js` - Server setup and API endpoints
- `temp_repos/` - Directory for temporarily cloned repositories

### Summarizer

Python module for code summarization using OpenAI API.

- `summarize.py` - Script for generating code summaries
- `.env` - Environment variables for API keys

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Python (v3.6+)
- Git

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
pip install -r requirements.txt
npm start
```

### Summarizer Setup

```bash
cd summarizer
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Configure OpenAI API Key

Edit the `.env` file in the summarizer directory to add your OpenAI API key:

```
YOUR_API_KEY=your_openai_api_key_here
```

## Usage

1. Start the backend and frontend servers
2. Enter a GitHub repository URL in the input field
3. Click "Start Journey" to begin the analysis
4. Explore the visual map of the repository
5. Click on any node to view its details and summary
6. Use the guided tour feature to follow a curated path through the repository

## Future Enhancements

- Advanced dependency visualization
- Integration with more code analysis tools
- Support for private repositories with authentication
- Collaborative annotations with real-time updates
- Export and sharing features for guides

## License

MIT
