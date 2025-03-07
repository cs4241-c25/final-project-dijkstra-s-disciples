import React from "react";
import './index.css'
import App from "./App.jsx";

/**
* Root of react site 
*
* Imports Helmet provider for the page head
* And App which defines the content and navigation
*/
import ReactDOM from 'react-dom/client'; // for React 18

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
