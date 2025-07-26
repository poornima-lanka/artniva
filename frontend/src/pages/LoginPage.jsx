// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // <--- Import useUser hook
import './LoginPage.css'; // Assuming you have a CSS file for styling this page

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // For success/error messages
  const [loading, setLoading] = useState(false); // For loading state

  const navigate = useNavigate();
  const { userInfo, login } = useUser(); // <--- Use the context hook to get userInfo and login function

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) { // Check userInfo from context
      navigate('/'); // Redirect to home page if user is already logged in
    }
  }, [userInfo, navigate]); // Add userInfo to dependency array

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setLoading(true); // Set loading state

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If response.ok is false, it's an HTTP error (e.g., 401, 400, 500)
        // Your backend should send a 'message' field in the error response
        throw new Error(data.message || 'Login failed');
      }

      // If response is OK, use the login function from context
      login(data); // data will contain user info and token from backend
      setMessage('Login successful!');
      setLoading(false);
      navigate('/'); // Redirect to home page after successful login

      // Removed window.location.reload() as context updates should handle re-renders

    } catch (error) {
      setLoading(false);
      setMessage(error.message || 'Network error. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Sign In to Artniva</h2>
        {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
        {loading && <p>Loading...</p>}

        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging In...' : 'Sign In'}
          </button>
        </form>

        <div className="register-link">
          New Customer? <span onClick={() => navigate('/register')}>Register</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;