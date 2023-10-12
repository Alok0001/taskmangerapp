import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import './RegistrationPage.css';

const RegistrationPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });

  const [registrationMessage, setRegistrationMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    validateInput(name, value);
  };

  const validateInput = (name, value) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
  };

  const validateField = (name, value) => {
    if (value === '') {
      return 'This field is required';
    }
    if (name === 'username') {
      return value.length < 3 ? 'Username must be at least 3 characters' : '';
    }
    if (name === 'email') {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(value) ? '' : 'Invalid email address';
    }
    if (name === 'password') {
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      return passwordPattern.test(value)
        ? ''
        : 'Password must be at least 6 characters with one special character and one digit';
    }
    if (name === 'passwordConfirmation') {
      return value === formData.password ? '' : 'Passwords do not match';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await axios.post('http://127.0.0.1:5000/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        if (response.status === 201) {
          setRegistrationMessage(response.data.message);
          // Redirect to registration success page using navigate
          navigate('/registration-success'); // Use the navigate function
        } else {
          console.error('Registration failed');
        }
      } catch (error) {
        console.error('Registration failed', error);
      }
    }
  };

  const validateForm = () => {
    const { username, email, password, passwordConfirmation } = formData;
    const formErrors = {
      username: validateField('username', username),
      email: validateField('email', email),
      password: validateField('password', password),
      passwordConfirmation: validateField('passwordConfirmation', passwordConfirmation),
    };

    setErrors(formErrors);

    const isFormValid = Object.values(formErrors).every((error) => !error);

    return isFormValid;
  };

  const isFormValid = Object.values(errors).every((error) => !error);

  return (
    <section className="registration-page">
      <div className="registration-content">
        <div className="registration-form">
          <h1>Sign up</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>User Name</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
              <span className="error">{errors.username}</span>
            </div>
            <div className="form-group">
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <span className="error">{errors.email}</span>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <span className="error">{errors.password}</span>
            </div>
            <div className="form-group">
              <label>Repeat your password</label>
              <input
                type="password"
                name="passwordConfirmation"
                value={formData.passwordConfirmation}
                onChange={handleInputChange}
              />
              <span className="error">{errors.passwordConfirmation}</span>
            </div>
            <div className="form-button">
              {/* Use a button to trigger form submission */}
              <button
                type="submit"
                className={isFormValid ? 'btn-primary' : 'btn-secondary'}
                disabled={!isFormValid}
              >
                Register
              </button>
            </div>
          </form>
        </div>
        <div className="registration-image">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
            alt=""
          />
        </div>
      </div>
    </section>
  );
};

export default RegistrationPage;
