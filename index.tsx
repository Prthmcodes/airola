
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Variable fonts, weight axis only. Each stylesheet lists Latin, Latin-ext and Vietnamese faces by
// unicode-range, so browsers only download the Latin file for this site's text.
import '@fontsource-variable/fraunces/index.css';
import '@fontsource-variable/inter/index.css';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
