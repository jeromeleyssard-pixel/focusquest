import React from 'react';
import ReactDOM from 'react-dom/client';
import './utils/i18n';
import 'jspsych/css/jspsych.css';
import './styles/globals.css';
import './styles/tokens.css';
import './styles/shell.css';
import './styles/junior-paradigms.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
