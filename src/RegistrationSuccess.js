import React from 'react';
import { Link } from 'react-router-dom';
import './RegistrationSuccess.css'; 

const RegistrationSuccess = () => {
  return (
    <div className="registration-success-container">
      <div className="registration-success">
        <h1>Registration Successful</h1>
        <p>Welcome to our community! You are now a registered member.</p>
        <p>Get ready to explore all the features and benefits of our website.</p>
        <p>
          <Link to="/login" className="login-link">Click here to log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
