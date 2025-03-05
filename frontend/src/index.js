import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create a custom theme
const theme = createTheme({
  colorScheme: 'dark',
  primaryColor: 'blue',
  fontFamily: 'Roboto, sans-serif',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#1e293b',  // Darker but still visible background
      '#141f2d',  // Paper background
      '#0c1520',  // Input background
      '#0a1929',  // Main background
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'md',
        p: 'md',
        radius: 'md',
      },
    },
    TextInput: {
      styles: {
        input: {
          '&:focus': {
            borderColor: '#3b82f6'
          }
        },
      }
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
