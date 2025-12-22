// frontend/src/screens/ForgotPasswordScreen.js

import React, { useState } from 'react';
import axios from 'axios';
// Assuming you use the same CSS as your login page for structure
import '../pages/LoginPage.css'; 

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // For success message
  const [error, setError] = useState(null);     // For error message

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // The endpoint is /api/users/forgotpassword
      const { data } = await axios.post(
         'http://localhost:5000/api/users/forgotpassword',
        { email }
      );

      // Backend sends a message regardless of whether the email exists (for security)
      setMessage(data.message || 'If an account exists, a reset link has been sent to your email.');
      setError(null);
      
    } catch (err) {
      const errorMessage = 
        err.response && err.response.data.message 
        ? err.response.data.message 
        : 'An error occurred. Please check your network and try again.';

      setError(errorMessage);
      setMessage(null);
    } finally {
      setLoading(false);
      setEmail(''); // Clear the email input after submission
    }
  };

  return (
    // Reusing the login-page and login-container structure for styling
    <div className="login-page">
      <div className="login-container">
        <h2>Forgot Password</h2>
        
        {/* Using your existing message structure from LoginPage.jsx */}
        {error && <p className={`message error`}>{error}</p>}
        {message && <p className={`message success`}>{message}</p>}
        
        {loading && <p>Sending link...</p>}

        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type='email'
              id='email'
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type='submit' className='login-btn' disabled={loading || !email}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;