import React, { useEffect, useState } from 'react'; 
import { Container, Typography, Button, CircularProgress, Grid, Paper } from '@mui/material';
import { API_URLS } from './firebase'; // Ensure this path is correct
import emailjs from 'emailjs-com'; // Import EmailJS

const AdminDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [loanApplications, setLoanApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true); 
    try {
      const response = await fetch(API_URLS.adminCollection);
      const data = await response.json();
      
      if (data.documents) {
        setAccounts(data.documents); 
      } else {
        console.error("No documents found in admin collection response.");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanApplications = async () => {
    try {
      const response = await fetch(API_URLS.loanCollection); // Make sure this URL is correct
      const data = await response.json();

      console.log("Loan applications data:", data); // Log the response data

      if (data.documents) {
        setLoanApplications(data.documents); 
      } else {
        console.error("No loan applications found in the response.");
      }
    } catch (error) {
      console.error("Error fetching loan applications:", error);
    }
  };

  const sendEmailNotification = (email, subject, message) => {
    const templateParams = {
      to_email: email,
      subject: subject,
      message: message,
    };

    emailjs.send('service_hnjqsgr', 'template_wln2i23', templateParams, 'g3q8AfaoOb0a_e90T')
      .then((response) => {
        console.log('Email sent successfully', response.status, response.text);
      })
      .catch((error) => {
        console.error('Error sending email:', error);
      });
  };

  const handleApproval = async (documentPath) => {
    const accountId = documentPath.split('/').pop(); // Get the Firestore document ID
    try {
      const accountResponse = await fetch(`${API_URLS.adminCollection}/${accountId}`);
      if (!accountResponse.ok) {
        console.error('Error fetching account data:', accountResponse.statusText);
        return;
      }

      const accountData = await accountResponse.json();
      
      // Copy account data to the customer collection
      const newAccountData = {
        fields: {
          ...accountData.fields,
          status: { stringValue: 'Approved' }, // Update the status
        },
      };

      // Save to customer collection
      await fetch(API_URLS.customerCollection, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccountData),
      });

      // Optionally delete the original account from the admin collection
      await fetch(`${API_URLS.adminCollection}/${accountId}`, {
        method: 'DELETE',
      });

      console.log('Account approved and moved to customer collection successfully');
      
      // Send notification email
      const email = accountData.fields?.email?.stringValue; // Get the email address
      sendEmailNotification(email, 'Account Approval', 'Your account has been approved.');

      fetchAccounts(); // Refresh the accounts
    } catch (error) {
      console.error('Error approving account:', error);
    }
  };

  const handleHold = async (documentPath) => {
    const accountId = documentPath.split('/').pop(); // Get the Firestore document ID
    try {
      const accountResponse = await fetch(`${API_URLS.adminCollection}/${accountId}`);
      if (!accountResponse.ok) {
        console.error('Error fetching account data:', accountResponse.statusText);
        return;
      }

      const accountData = await accountResponse.json();
      const updatedAccountData = {
        fields: {
          ...accountData.fields,
          status: { stringValue: 'On Hold' }, // Update the status
        },
      };

      await fetch(`${API_URLS.adminCollection}/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAccountData),
      });

      console.log('Account put on hold successfully');
      
      // Send notification email
      const email = accountData.fields?.email?.stringValue; // Get the email address
      sendEmailNotification(email, 'Account Status Update', 'Your account is currently on hold.');

      fetchAccounts(); // Refresh the accounts
    } catch (error) {
      console.error('Error putting account on hold:', error);
    }
  };

  const handleReject = async (documentPath) => {
    const accountId = documentPath.split('/').pop(); // Get the Firestore document ID
    try {
      const accountResponse = await fetch(`${API_URLS.adminCollection}/${accountId}`);
      if (!accountResponse.ok) {
        console.error('Error fetching account data:', accountResponse.statusText);
        return;
      }

      const accountData = await accountResponse.json();
      const updatedAccountData = {
        fields: {
          ...accountData.fields,
          status: { stringValue: 'Rejected' }, // Update the status
        },
      };

      await fetch(`${API_URLS.adminCollection}/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAccountData),
      });

      console.log('Account rejected successfully');
      
      // Send notification email
      const email = accountData.fields?.email?.stringValue; // Get the email address
      sendEmailNotification(email, 'Account Status Update', 'Your account has been rejected.');

      fetchAccounts(); // Refresh the accounts
    } catch (error) {
      console.error('Error rejecting account:', error);
    }
  };

  const handleLoanApproval = async (documentPath) => {
    const loanId = documentPath.split('/').pop(); // Get the Firestore document ID

    try {
      const loanResponse = await fetch(`${API_URLS.loanCollection}/${loanId}`);
      if (!loanResponse.ok) {
        console.error('Error fetching loan data:', loanResponse.statusText);
        return;
      }
      
      const loanData = await loanResponse.json();
      const updatedLoanData = {
        fields: {
          ...loanData.fields,
          status: { stringValue: 'Approved' }, // Update the status
        },
      };

      await fetch(`${API_URLS.loanCollection}/${loanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedLoanData),
      });

      console.log('Loan approved successfully');
      
      // Send notification email
      const email = loanData.fields?.email?.stringValue; // Get the email address
      sendEmailNotification(email, 'Loan Approval', 'Your loan application has been approved.');

      fetchLoanApplications(); // Refresh the loan applications
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleLoanHold = async (documentPath) => {
    const loanId = documentPath.split('/').pop(); // Get the Firestore document ID

    try {
      const loanResponse = await fetch(`${API_URLS.loanCollection}/${loanId}`);
      if (!loanResponse.ok) {
        console.error('Error fetching loan data:', loanResponse.statusText);
        return;
      }
      
      const loanData = await loanResponse.json();
      const updatedLoanData = {
        fields: {
          ...loanData.fields,
          status: { stringValue: 'On Hold' }, // Update the status
        },
      };

      await fetch(`${API_URLS.loanCollection}/${loanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedLoanData),
      });

      console.log('Loan put on hold successfully');
      
      // Send notification email
      const email = loanData.fields?.email?.stringValue; // Get the email address
      sendEmailNotification(email, 'Loan Status Update', 'Your loan application is currently on hold.');

      fetchLoanApplications(); // Refresh the loan applications
    } catch (error) {
      console.error('Error putting loan on hold:', error);
    }
  };

  const handleLoanReject = async (documentPath) => {
    const loanId = documentPath.split('/').pop(); // Get the Firestore document ID

    try {
      const loanResponse = await fetch(`${API_URLS.loanCollection}/${loanId}`);
      if (!loanResponse.ok) {
        console.error('Error fetching loan data:', loanResponse.statusText);
        return;
      }
      
      const loanData = await loanResponse.json();
      const updatedLoanData = {
        fields: {
          ...loanData.fields,
          status: { stringValue: 'Rejected' }, // Update the status
        },
      };

      await fetch(`${API_URLS.loanCollection}/${loanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedLoanData),
      });

      console.log('Loan rejected successfully');
      
      // Send notification email
      const email = loanData.fields?.email?.stringValue; // Get the email address
      sendEmailNotification(email, 'Loan Status Update', 'Your loan application has been rejected.');

      fetchLoanApplications(); // Refresh the loan applications
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchLoanApplications();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="h6">Accounts</Typography>
      <Grid container spacing={2}>
        {accounts.map((account) => (
          <Grid item xs={12} sm={6} md={4} key={account.name}>
            <Paper elevation={2}>
              <Typography variant="h6">{account.fields.name.stringValue}</Typography>
              <Typography variant="body1">Email: {account.fields.email.stringValue}</Typography>
              <Typography variant="body1">Status: {account.fields.status.stringValue}</Typography>
              <Button onClick={() => handleApproval(account.name)}>Approve</Button>
              <Button onClick={() => handleHold(account.name)}>Hold</Button>
              <Button onClick={() => handleReject(account.name)}>Reject</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6">Loan Applications</Typography>
      <Grid container spacing={2}>
        {loanApplications.map((loan) => (
          <Grid item xs={12} sm={6} md={4} key={loan.name}>
            <Paper elevation={2}>
              <Typography variant="h6">{loan.fields.name.stringValue}</Typography>
              <Typography variant="body1">Email: {loan.fields.email.stringValue}</Typography>
              <Typography variant="body1">Status: {loan.fields.status.stringValue}</Typography>
              <Button onClick={() => handleLoanApproval(loan.name)}>Approve</Button>
              <Button onClick={() => handleLoanHold(loan.name)}>Hold</Button>
              <Button onClick={() => handleLoanReject(loan.name)}>Reject</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
