import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const root = document.getElementById('root');
if (!root) {
  document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif">Error: #root not found. Run from client folder: npm run dev</p>';
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
