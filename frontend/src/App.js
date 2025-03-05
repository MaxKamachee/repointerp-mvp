import React, { useState } from 'react';
import { MantineProvider, createTheme, Text, Button, TextInput, Container, Title, Center, Paper, Group, Loader, Box, Alert } from '@mantine/core';
import { IconBrandGithub, IconArrowRight, IconInfoCircle } from '@tabler/icons-react';
import RepoMap from './components/RepoMap';
import './App.css';

const theme = createTheme({
  colorScheme: 'dark',
  primaryColor: 'blue',
  primaryShade: 6,
  black: '#0a1929',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#1e293b',
      '#0f172a',
      '#0a1929',
      '#050914'
    ],
  },
  components: {
    Button: {
      defaultProps: {
        variant: 'filled',
      },
    },
  },
});

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [repoSelected, setRepoSelected] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [error, setError] = useState(null);
  const [customImport, setCustomImport] = useState(false);
  const [importData, setImportData] = useState(null);

  // Handle repository URL submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL');
      return;
    }
    
    setError(null);
    setLoadingRepo(true);
    
    // For MVP, we'll mock the API call
    try {
      // In a real implementation, this would be a call to your backend API
      // Mock a delay for demonstration purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRepoSelected(true);
      setShowMap(true);
      setLoadingRepo(false);
    } catch (err) {
      setError('Failed to fetch repository data. Please check the URL and try again.');
      setLoadingRepo(false);
    }
  };

  // Handle back navigation from repo visualization
  const handleBack = () => {
    setRepoUrl('');
    setRepoSelected(false);
    setShowMap(false);
    setCustomImport(false);
    setImportData(null);
  };

  // Handle file import
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setImportData(data);
        setCustomImport(true);
        setRepoSelected(true);
        setShowMap(true);
      } catch (err) {
        setError('Failed to parse the imported file. Please ensure it\'s a valid JSON file.');
      }
    };
    reader.onerror = () => {
      setError('Error reading the file. Please try again.');
    };
    reader.readAsText(file);
  };

  // Toggle import option
  const toggleImportOption = () => {
    setCustomImport(!customImport);
  };

  return (
    <MantineProvider theme={theme}>
      <div className="app-container">
        {!repoSelected ? (
          <Container size="md" className="landing-container">
            <Paper className="landing-paper" radius="md" p="xl" withBorder>
              <Title className="app-title" order={1}>
                <span className="highlight">Repo</span>Interp
              </Title>
              <Text className="app-subtitle" size="lg" mb="xl">
                Interactive guided journeys through your codebase
              </Text>
              
              <form onSubmit={handleSubmit}>
                <TextInput
                  placeholder="Enter GitHub repository URL (e.g. https://github.com/username/repo)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  icon={<IconBrandGithub size={18} />}
                  size="md"
                  radius="md"
                  className="repo-input"
                  disabled={loadingRepo}
                />
                
                <Group position="center" mt="xl" spacing="md">
                  <Button 
                    type="submit" 
                    size="md" 
                    rightIcon={<IconArrowRight size={18} />}
                    loading={loadingRepo}
                    disabled={customImport}
                  >
                    {loadingRepo ? 'Analyzing Repository...' : 'Explore Repository'}
                  </Button>

                  <Button 
                    variant="outline" 
                    size="md"
                    onClick={toggleImportOption}
                  >
                    {customImport ? 'Use GitHub URL' : 'Import Custom Data'}
                  </Button>
                </Group>

                {customImport && (
                  <Box mt="md">
                    <Text size="sm" mb="xs">Import repository data from a file:</Text>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleFileImport} 
                      className="file-input"
                    />
                    <Text size="xs" color="dimmed" mt="xs">
                      Upload a JSON file with repository structure and summaries
                    </Text>
                  </Box>
                )}
                
                {error && (
                  <Alert icon={<IconInfoCircle size={18} />} color="red" mt="md">
                    {error}
                  </Alert>
                )}
              </form>
              
              <Text size="sm" color="dimmed" mt="xl" className="landing-footer">
                RepoInterp transforms complex codebases into interactive guided journeys.
                <br />
                Understand repositories faster with AI-generated insights and visual navigation.
              </Text>
            </Paper>
          </Container>
        ) : (
          <div className="repo-visualization-container">
            <Button
              variant="subtle"
              leftIcon={<IconArrowRight size={16} />}
              onClick={handleBack}
              className="back-button"
              color="gray"
            >
              Back to Home
            </Button>
            <RepoMap 
              repo={repoUrl} 
              onBack={handleBack} 
              backFn={handleBack}
              customData={importData}
            />
          </div>
        )}
      </div>
    </MantineProvider>
  );
}

export default App;
