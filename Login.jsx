import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState(''); // State to store status messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setStatusMessage('Please enter your email and password.');
      return;
    }

    setStatusMessage('Logging in...');

    try {
      // Prepare the request body for querying by email
      const requestBody = {
        structuredQuery: {
          where: {
            fieldFilter: {
              field: { fieldPath: 'email' },
              op: 'EQUAL',
              value: { stringValue: email },
            },
          },
          from: [{ collectionId: 'customers' }],
        },
      };

      // Fetch the user document based on the email
      const response = await fetch(
        'https://firestore.googleapis.com/v1/projects/bankmanagement-25d7e/databases/(default)/documents:runQuery',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (data && data.length > 0 && data[0].document) {
        const userAccount = data[0].document.fields;

        // Check if the provided password matches the one in Firestore
        if (userAccount.password.stringValue === password) {
          if (userAccount.status.stringValue === 'Approved') {
            localStorage.setItem('user', JSON.stringify({
              name: userAccount.name.stringValue,
              email: userAccount.email.stringValue,
            }));

            alert('Login successful!');
            setStatusMessage('Login successful! Redirecting...');
            setTimeout(() => {
              navigate('/home');
            }, 1500);
          } else {
            setStatusMessage('Your account is not approved yet. Please wait for approval.');
          }
        } else {
          setStatusMessage('Incorrect password. Please try again.');
        }
      } else {
        setStatusMessage('Your account does not exist. Please contact support.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setStatusMessage('An error occurred during login. Please try again.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};

export default Login;
