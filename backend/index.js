// index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com';

// Temporary directory for cloned repositories
const REPO_TEMP_DIR = path.join(__dirname, 'temp_repos');

// Ensure temp directory exists
if (!fs.existsSync(REPO_TEMP_DIR)) {
  fs.mkdirSync(REPO_TEMP_DIR, { recursive: true });
}

// Endpoint to fetch repository data from GitHub
app.get('/api/repo', async (req, res) => {
  const { repoUrl } = req.query; // e.g., "owner/repo"
  try {
    // Call GitHub API for repository details (public repos for now)
    const repoData = await axios.get(`${GITHUB_API_BASE}/repos/${repoUrl}`);
    res.json(repoData.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// Endpoint to clone repository and analyze its structure
app.post('/api/analyze', async (req, res) => {
  const { repoUrl } = req.body; // GitHub repo URL (https or git format)
  
  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }
  
  // Extract repo name from URL for directory naming
  const repoName = repoUrl.split('/').pop().replace('.git', '');
  const repoDir = path.join(REPO_TEMP_DIR, repoName);
  
  try {
    // Clone the repository if it doesn't exist locally
    if (!fs.existsSync(repoDir)) {
      res.status(202).json({ message: 'Starting repository analysis', status: 'cloning' });
      
      // Clone the repository
      await new Promise((resolve, reject) => {
        exec(`git clone ${repoUrl} ${repoDir}`, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stdout);
        });
      });
    }
    
    // Analyze repository structure
    const fileStructure = await analyzeRepoStructure(repoDir);
    
    // Generate visual representation data
    const visualData = generateVisualData(fileStructure, repoName);
    
    res.json({
      repoName,
      visualData,
      fileStructure
    });
    
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// Endpoint to get code for a specific file
app.get('/api/file', (req, res) => {
  const { repoName, filePath } = req.query;
  
  if (!repoName || !filePath) {
    return res.status(400).json({ error: 'Repository name and file path are required' });
  }
  
  const fullPath = path.join(REPO_TEMP_DIR, repoName, filePath);
  
  try {
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      res.json({ content: fileContent });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// Endpoint to summarize code
app.post('/api/summarize', (req, res) => {
  const { fileContent } = req.body;
  
  if (!fileContent) {
    return res.status(400).json({ error: 'File content is required' });
  }
  
  // Write fileContent to a temporary file
  const tempFile = path.join(__dirname, 'temp_code.txt');
  fs.writeFileSync(tempFile, fileContent);
  
  // Call the Python summarization script
  exec(`python3 ../summarizer/summarize.py ${tempFile}`, (error, stdout, stderr) => {
    // Clean up temporary file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    
    if (error) {
      return res.status(500).json({ error: stderr });
    }
    
    res.json({ summary: stdout });
  });
});

// Function to analyze repository structure
async function analyzeRepoStructure(repoDir) {
  const structure = { name: path.basename(repoDir), type: 'directory', children: [] };
  
  function processDirectory(dir, currentNode) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      // Skip node_modules, .git, etc.
      if (['.git', 'node_modules', '__pycache__'].includes(item)) {
        continue;
      }
      
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        const newNode = { name: item, type: 'directory', children: [] };
        currentNode.children.push(newNode);
        processDirectory(itemPath, newNode);
      } else {
        // For files, determine language type based on extension
        const ext = path.extname(item).toLowerCase();
        let language = 'unknown';
        
        if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) language = 'javascript';
        else if (['.py'].includes(ext)) language = 'python';
        else if (['.java'].includes(ext)) language = 'java';
        else if (['.html', '.htm'].includes(ext)) language = 'html';
        else if (['.css', '.scss', '.sass'].includes(ext)) language = 'css';
        else if (['.json'].includes(ext)) language = 'json';
        else if (['.md', '.markdown'].includes(ext)) language = 'markdown';
        
        currentNode.children.push({
          name: item,
          type: 'file',
          size: stats.size,
          language,
          path: itemPath.replace(repoDir + '/', '') // Relative path
        });
      }
    }
  }
  
  processDirectory(repoDir, structure);
  return structure;
}

// Function to generate visual data for the frontend
function generateVisualData(fileStructure, repoName) {
  const nodes = [];
  const links = [];
  
  // Add root node
  nodes.push({ id: 'root', label: repoName, summary: 'Repository root directory' });
  
  // Process the file structure to generate nodes and links
  function processNode(node, parentId) {
    if (node.type === 'directory' && node.children.length > 0) {
      // Add directory node if it has children
      const nodeId = `${parentId}-${node.name}`;
      nodes.push({ 
        id: nodeId, 
        label: node.name,
        summary: `Directory containing ${node.children.length} files/subdirectories`
      });
      links.push({ source: parentId, target: nodeId });
      
      // Process children
      node.children.forEach(child => processNode(child, nodeId));
    } 
    else if (node.type === 'file') {
      // Skip very small files that might be config/readme
      if (node.size < 100 && ['md', 'gitignore', 'env'].some(ext => node.name.includes(ext))) {
        return;
      }
      
      // Add file node
      const nodeId = `${parentId}-${node.name}`;
      nodes.push({ 
        id: nodeId, 
        label: node.name,
        language: node.language,
        path: node.path,
        summary: `${node.language.charAt(0).toUpperCase() + node.language.slice(1)} file (${(node.size / 1024).toFixed(1)} KB)`
      });
      links.push({ source: parentId, target: nodeId });
    }
  }
  
  // Process children of root
  fileStructure.children.forEach(child => processNode(child, 'root'));
  
  return { nodes, links };
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
