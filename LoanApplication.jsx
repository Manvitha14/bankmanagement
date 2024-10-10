import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoanApplication = () => {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [aadharFile, setAadharFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  // Handle Aadhar file upload
  const handleFileChange = (e) => {
    setAadharFile(e.target.files[0]);
  };

  // Handle loan application submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !reason || !aadharFile) {
      setStatusMessage('Please fill out all fields and upload the Aadhar file.');
      return;
    }

    setStatusMessage('Submitting application...');

    try {
      // Retrieve the current user token
      const currentUser = localStorage.getItem('user');
      if (!currentUser) {
        setStatusMessage('You need to be logged in to submit the loan application.');
        return;
      }

      const { email } = JSON.parse(currentUser);

      // Loan application data
      const loanData = {
        fields: {
          name: { stringValue: name },
          reason: { stringValue: reason },
          email: { stringValue: email },
          status: { stringValue: 'Pending' },
        },
      };

      // Submit the loan data to Firestore collection
      const response = await fetch(
        'https://firestore.googleapis.com/v1/projects/bankmanagement-25d7e/databases/(default)/documents/loans',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loanData),
        }
      );

      if (response.ok) {
        setStatusMessage('Application submitted successfully!');
        navigate('/admin-dashboard');
      } else {
        setStatusMessage('Error submitting application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting loan application:', error);
      setStatusMessage('Error submitting application. Please try again.');
    }
  };

  return (
    <div className="loan-application">
      <h1>Loan Application Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Reason for Loan:</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Aadhar Card File:</label>
          <input type="file" onChange={handleFileChange} required />
        </div>
        <button type="submit">Submit Application</button>
      </form>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};

export default LoanApplication;
