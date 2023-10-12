import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import RegistrationPage from './RegistrationPage';
import RegistrationSuccess from './RegistrationSuccess'; // Import the RegistrationSuccess component

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} /> {/* Add this route */}
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
