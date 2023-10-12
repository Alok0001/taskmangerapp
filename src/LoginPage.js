import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        setLoginMessage(response.data.message);
        // Save the access token to local storage
        localStorage.setItem('access_token', response.data.access_token);
        // Redirect to the dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      setLoginMessage('Invalid username or password');
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-center h-100">
        <div className="card">
          <div className="card-header">
            <h3> Task-Manager</h3>
            <h3>Sign In</h3>
            <div className="d-flex justify-content-end social_icon">
              <span><i className="fab fa-facebook-square"></i></span>
              <span><i className="fab fa-google-plus-square"></i></span>
              <span><i className="fab fa-twitter-square"></i></span>
            </div>
          </div>
          <div className="card-body">
            <form>
              <div className="input-group form-group">
                <div className="input-group-prepend">
                  <span className="input-group-text"><i className="fas fa-user"></i></span>
                </div>
                <input type="text" className="form-control" placeholder="Username" name="username" value={username} onChange={handleInputChange} />
              </div>
              <div className="input-group form-group">
                <div className="input-group-prepend">
                  <span className="input-group-text"><i className="fas fa-key"></i></span>
                </div>
                <input type="password" className="form-control" placeholder="Password" name="password" value={password} onChange={handleInputChange} />
              </div>
              <div className="row align-items-center remember">
                <input type="checkbox" /> Remember Me
              </div>
              <div className="form-group">
                <input type="button" value="Login" className="btn float-right login_btn" onClick={handleLogin} />
              </div>
            </form>
          </div>
          <div className="card-footer">
            <div className="d-flex justify-content-center links">
              Don't have an account? <Link to="/register" className="signup-link">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
      {loginMessage && <p className="login-message text-center">{loginMessage}</p>}
    </div>
  );
};

export default LoginPage;
