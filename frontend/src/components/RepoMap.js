import React, { useState, useEffect, useRef } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import { Button, Text, Paper, Group, Tabs, Modal, Stepper, Card, Badge, Title, Select, Box, ScrollArea, Accordion, Drawer } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowLeft, IconArrowRight, IconRoute, IconArchive, IconCode, IconFileDescription, IconBrandGithub } from '@tabler/icons-react';
import './RepoMap.css';

const RepoMap = ({ repo, onBack, backFn }) => {
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [storyboardActive, setStoryboardActive] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  
  // Reference for network visualization (used in detailed view)
  const networkRef = useRef(null);
  
  useEffect(() => {
    // Mock data - in real implementation, this would come from backend analysis
    const mockScenarios = [
      {
        id: 'auth-flow',
        name: 'Authentication Flow',
        description: 'How users log in and are authenticated throughout the application',
        panels: [
          {
            id: 'auth-entry',
            title: 'Authentication Entry Point',
            description: 'Users begin the authentication process via the login form component',
            fileHighlight: 'src/components/Login.js',
            codeSnippet: 'function LoginForm() {\n  const [username, setUsername] = useState("");\n  // ...\n}',
            explanation: 'The login form collects user credentials and dispatches an authentication request to the backend API.',
            connections: ['auth-middleware']
          },
          {
            id: 'auth-middleware',
            title: 'Auth Middleware',
            description: 'Authentication middleware validates tokens and manages sessions',
            fileHighlight: 'src/middleware/auth.js',
            codeSnippet: 'function authenticateToken(req, res, next) {\n  const token = req.headers.authorization;\n  // ...\n}',
            explanation: 'The auth middleware intercepts requests, extracts and validates JWT tokens, and attaches the user context to the request object.',
            connections: ['auth-service', 'user-model']
          },
          {
            id: 'auth-service',
            title: 'Authentication Service',
            description: 'Core service that handles login, register, and token management',
            fileHighlight: 'src/services/authService.js',
            codeSnippet: 'async function login(username, password) {\n  // Validate credentials\n  const user = await User.findOne({ username });\n  // ...\n}',
            explanation: 'The auth service contains business logic for user authentication, including password hashing, token generation, and verification.',
            connections: ['user-model']
          },
          {
            id: 'user-model',
            title: 'User Model',
            description: 'Database schema and methods for user data',
            fileHighlight: 'src/models/User.js',
            codeSnippet: 'const userSchema = new Schema({\n  username: { type: String, required: true },\n  password: { type: String, required: true },\n  // ...\n});',
            explanation: 'The User model defines the database structure for user accounts and includes methods for password validation.',
            connections: []
          }
        ]
      },
      {
        id: 'data-flow',
        name: 'Data Processing Pipeline',
        description: 'How data moves through the system from input to storage',
        panels: [
          {
            id: 'data-input',
            title: 'Data Input Components',
            description: 'UI components that collect data from users',
            fileHighlight: 'src/components/DataForm.js',
            codeSnippet: 'function DataInputForm() {\n  // Form implementation\n}',
            explanation: 'Forms and input components that collect raw data from users or external sources.',
            connections: ['data-validation']
          },
          {
            id: 'data-validation',
            title: 'Data Validation',
            description: 'Validates and sanitizes input data',
            fileHighlight: 'src/utils/validators.js',
            codeSnippet: 'function validateData(data) {\n  // Validation logic\n}',
            explanation: 'Validation utilities ensure data meets required formats and constraints before processing.',
            connections: ['data-processing']
          },
          {
            id: 'data-processing',
            title: 'Data Processing',
            description: 'Business logic that transforms raw data',
            fileHighlight: 'src/services/dataService.js',
            codeSnippet: 'function processData(rawData) {\n  // Transformation logic\n}',
            explanation: 'Core business logic that transforms validated data into the required format for storage or output.',
            connections: ['data-storage']
          },
          {
            id: 'data-storage',
            title: 'Data Storage',
            description: 'Persistence layer for processed data',
            fileHighlight: 'src/models/Data.js',
            codeSnippet: 'const dataSchema = new Schema({\n  // Schema definition\n});',
            explanation: 'Database models and storage methods for persisting the processed data.',
            connections: []
          }
        ]
      },
      {
        id: 'api-flow',
        name: 'API Request Handling',
        description: 'How API requests are processed from client to response',
        panels: [
          {
            id: 'api-route',
            title: 'API Route Definition',
            description: 'Endpoint definitions and route handlers',
            fileHighlight: 'src/routes/api.js',
            codeSnippet: 'router.get("/items", authMiddleware, itemController.getAll);',
            explanation: 'API routes define the HTTP endpoints, middleware chain, and controller methods for each request type.',
            connections: ['api-controller']
          },
          {
            id: 'api-controller',
            title: 'API Controller',
            description: 'Request handling and response formatting',
            fileHighlight: 'src/controllers/itemController.js',
            codeSnippet: 'async function getAll(req, res) {\n  try {\n    const items = await itemService.findAll();\n    return res.json(items);\n  } catch (err) {\n    return res.status(500).json({ error: err.message });\n  }\n}',
            explanation: 'Controllers handle the HTTP specifics, parameter extraction, and response formatting.',
            connections: ['api-service']
          },
          {
            id: 'api-service',
            title: 'API Service',
            description: 'Business logic and data operations',
            fileHighlight: 'src/services/itemService.js',
            codeSnippet: 'async function findAll() {\n  return await Item.find({});\n}',
            explanation: 'Service layer contains business logic and database operations, isolated from HTTP concerns.',
            connections: ['api-model']
          },
          {
            id: 'api-model',
            title: 'API Data Model',
            description: 'Database schema and data access methods',
            fileHighlight: 'src/models/Item.js',
            codeSnippet: 'const itemSchema = new Schema({\n  name: String,\n  description: String,\n  // ...\n});',
            explanation: 'Data models define the structure of entities and provide methods for database interactions.',
            connections: []
          }
        ]
      }
    ];
    
    setScenarios(mockScenarios);
    setLoading(false);
  }, [repo]);
  
  // Start storyboard flow for a selected scenario
  const startStoryboard = (scenarioId) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    setSelectedScenario(scenario);
    setStoryboardActive(true);
    setCurrentPanel(0);
  };
  
  // Navigate through storyboard panels
  const nextPanel = () => {
    if (selectedScenario && currentPanel < selectedScenario.panels.length - 1) {
      setCurrentPanel(currentPanel + 1);
    }
  };
  
  const prevPanel = () => {
    if (currentPanel > 0) {
      setCurrentPanel(currentPanel - 1);
    }
  };
  
  // End storyboard and return to scenario selection
  const endStoryboard = () => {
    setStoryboardActive(false);
    setSelectedScenario(null);
    setCurrentPanel(0);
  };
  
  // Open file explorer for a specific file
  const exploreFile = (filePath) => {
    // In a real implementation, this would fetch file content from the backend
    setSelectedFile({
      path: filePath,
      content: `// This is a mock content for ${filePath}\n// In a real implementation, this would be the actual file content`,
      summary: "This file is part of the scenario flow and contains important logic for the application."
    });
    setExplorerOpen(true);
  };
  
  // Start the guided tour
  const startTour = () => {
    setTourModalOpen(true);
  };
  
  // Render the repository visualization components
  return (
    <div className="repo-map-container">
      {/* Header with repo information */}
      <div className="repo-header">
        <div className="repo-title">
          <IconBrandGithub size={24} />
          <Title order={2}>{repo.split('/').pop()}</Title>
        </div>
        <Button onClick={startTour} leftIcon={<IconRoute size={16} />}>
          Start Guided Tour
        </Button>
      </div>
      
      {/* Scenario Selection View */}
      <AnimatePresence mode="wait">
        {!storyboardActive && (
          <motion.div
            key="scenario-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="scenario-container"
          >
            <Text className="section-title">Choose a Scenario to Explore</Text>
            <div className="scenarios-grid">
              {scenarios.map((scenario) => (
                <Card 
                  key={scenario.id}
                  className="scenario-card"
                  onClick={() => startStoryboard(scenario.id)}
                >
                  <div className="scenario-icon">
                    {scenario.id === 'auth-flow' && <IconArchive size={32} />}
                    {scenario.id === 'data-flow' && <IconFileDescription size={32} />}
                    {scenario.id === 'api-flow' && <IconCode size={32} />}
                  </div>
                  <Title order={3}>{scenario.name}</Title>
                  <Text className="scenario-description">{scenario.description}</Text>
                  <Badge color="blue">{scenario.panels.length} steps</Badge>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Storyboard View */}
        {storyboardActive && selectedScenario && (
          <motion.div
            key="storyboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="storyboard-container"
          >
            <div className="storyboard-header">
              <Button 
                variant="subtle" 
                leftIcon={<IconArrowLeft size={16} />}
                onClick={endStoryboard}
              >
                Back to Scenarios
              </Button>
              <Title order={3}>{selectedScenario.name}</Title>
              <Text color="dimmed">
                Step {currentPanel + 1} of {selectedScenario.panels.length}
              </Text>
            </div>
            
            <div className="storyboard-content">
              {/* Flow Diagram */}
              <div className="flow-diagram">
                <Stepper active={currentPanel} orientation="vertical" size="sm">
                  {selectedScenario.panels.map((panel, index) => (
                    <Stepper.Step 
                      key={panel.id}
                      label={panel.title}
                      description={panel.description}
                      onClick={() => setCurrentPanel(index)}
                    />
                  ))}
                </Stepper>
              </div>
              
              {/* Panel Content */}
              <div className="panel-content">
                {selectedScenario.panels[currentPanel] && (
                  <Card className="panel-card">
                    <Title order={3}>
                      {selectedScenario.panels[currentPanel].title}
                    </Title>
                    <Text className="panel-description">
                      {selectedScenario.panels[currentPanel].description}
                    </Text>
                    
                    <div className="file-highlight">
                      <Text weight={500}>Key File:</Text>
                      <Badge 
                        size="lg" 
                        onClick={() => exploreFile(selectedScenario.panels[currentPanel].fileHighlight)}
                        className="file-badge"
                      >
                        {selectedScenario.panels[currentPanel].fileHighlight}
                      </Badge>
                    </div>
                    
                    <div className="code-snippet">
                      <Text weight={500}>Code Snippet:</Text>
                      <pre>{selectedScenario.panels[currentPanel].codeSnippet}</pre>
                    </div>
                    
                    <Text className="panel-explanation">
                      <strong>Explanation:</strong> {selectedScenario.panels[currentPanel].explanation}
                    </Text>
                  </Card>
                )}
              </div>
            </div>
            
            <div className="storyboard-controls">
              <Button 
                variant="light" 
                leftIcon={<IconArrowLeft size={16} />}
                onClick={prevPanel}
                disabled={currentPanel === 0}
              >
                Previous Step
              </Button>
              <Button 
                rightIcon={<IconArrowRight size={16} />}
                onClick={nextPanel}
                disabled={currentPanel === selectedScenario.panels.length - 1}
              >
                Next Step
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* File Explorer Drawer */}
      <Drawer
        opened={explorerOpen}
        onClose={() => setExplorerOpen(false)}
        title={selectedFile?.path || 'File Explorer'}
        padding="xl"
        size="xl"
        position="right"
      >
        {selectedFile && (
          <div className="file-explorer">
            <Text weight={500} mb={10}>File Summary:</Text>
            <Text mb={20}>{selectedFile.summary}</Text>
            
            <Text weight={500} mb={10}>File Content:</Text>
            <ScrollArea style={{ height: 400 }}>
              <pre className="file-content">{selectedFile.content}</pre>
            </ScrollArea>
          </div>
        )}
      </Drawer>
      
      {/* Tour Introduction Modal */}
      <Modal
        opened={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        title="Repository Tour Guide"
        size="lg"
      >
        <div className="tour-intro">
          <Text size="lg" mb={20}>
            Welcome to the interactive repository tour! This guide will help you explore this codebase through different scenarios and flows.
          </Text>
          
          <Title order={4} mb={10}>How to use this tour:</Title>
          <ol>
            <li>
              <Text mb={10}>
                <strong>Select a Scenario</strong> - Choose from different flows like Authentication, Data Processing, or API Handling.
              </Text>
            </li>
            <li>
              <Text mb={10}>
                <strong>Navigate the Storyboard</strong> - Each scenario is presented as a series of steps showing key files and code snippets.
              </Text>
            </li>
            <li>
              <Text mb={10}>
                <strong>Explore Files</strong> - Click on file names to see their full contents and explanations.
              </Text>
            </li>
          </ol>
          
          <Button 
            fullWidth 
            mt={20} 
            onClick={() => setTourModalOpen(false)}
          >
            Got it! Let's start exploring
          </Button>
        </div>
      </Modal>
      
      {/* Back Button */}
      <Button
        leftIcon={<IconArrowLeft size={18} />}
        onClick={backFn || onBack}
        className="back-button"
        variant="subtle"
        color="gray"
      >
        Back to Repository Selection
      </Button>
    </div>
  );
};

export default RepoMap;
