import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { warmupServer } from './api';
import { runWhenIdle } from './utils/mobilePerf';
import './index.css';

function applyPerformanceHints() {
  const root = document.documentElement;
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const narrow = window.matchMedia('(max-width: 1024px)').matches;
  if (coarse || narrow) root.classList.add('is-mobile-perf');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('is-mobile-perf');
  }
}

applyPerformanceHints();

if (document.documentElement.classList.contains('is-mobile-perf')) {
  runWhenIdle(() => warmupServer(), 10000);
} else {
  warmupServer();
}

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
