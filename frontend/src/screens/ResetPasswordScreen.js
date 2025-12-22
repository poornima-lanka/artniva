// frontend/src/screens/ResetPasswordScreen.js

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../pages/LoginPage.css'; 

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  // Get the token from the URL: /resetpassword/:token
  const { token } = useParams(); 

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // API call to your backend (PUT request with token in URL)
      const { data } = await axios.put(
        `http://localhost:5000/api/users/resetpassword/${token}`,
        { password, confirmPassword }
      );

      setMessage(data.message || 'Password reset successful. Redirecting to login...');
      setError(null);
      
      // Navigate to the login screen after a short delay
      setTimeout(() => {
        navigate('/login'); 
      }, 3000); 

    } catch (err) {
      const errorMessage = 
        err.response && err.response.data.message 
        ? err.response.data.message 
        : 'Invalid or expired token. Please request a new link.';

      setError(errorMessage);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Reusing the login-page and login-container structure for styling
    <div className="login-page">
      <div className="login-container">
        <h2>Reset Password</h2>
        
        {/* Using your existing message structure from LoginPage.jsx */}
        {error && <p className={`message error`}>{error}</p>}
        {message && <p className={`message success`}>{message}</p>}
        
        {loading && <p>Updating password...</p>}

        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type='password'
              id='password'
              placeholder='Enter new password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type='password'
              id='confirmPassword'
              placeholder='Confirm new password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type='submit' className='login-btn' disabled={loading || !password || !confirmPassword}>
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;