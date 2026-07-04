import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { warmupServer } from './api';
import { runWhenIdle, isPhoneViewport } from './utils/mobilePerf';
import './index.css';

function applyPerformanceHints() {
  const root = document.documentElement;
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const narrow = window.matchMedia('(max-width: 767px)').matches;
  const tablet = window.matchMedia('(max-width: 1024px)').matches;
  const laptop = window.matchMedia('(max-width: 1280px)').matches;
  if (isPhoneViewport()) root.classList.add('is-phone');
  if (narrow || coarse || laptop) root.classList.add('is-mobile-perf');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('is-mobile-perf', 'is-reduced-motion');
  }
  return root.classList.contains('is-mobile-perf');
}

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

applyPerformanceHints();
if (!import.meta.env.DEV) {
  runWhenIdle(() => warmupServer(), 1800);
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
