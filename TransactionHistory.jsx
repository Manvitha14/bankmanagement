import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { API_URLS } from './firebase'; // Ensure this path is correct

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(API_URLS.transactionCollection); // Adjust this URL
      const data = await response.json();

      if (data.documents) {
        setTransactions(data.documents);
      } else {
        console.error("No transactions found.");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Container>
      <Typography variant="h5">Transaction History</Typography>
      {transactions.map((transaction) => (
        <Paper key={transaction.name} style={{ padding: '16px', marginBottom: '20px' }}>
          <Typography>Recipient: {transaction.fields?.recipientEmail?.stringValue || "N/A"}</Typography>
          <Typography>Amount: {transaction.fields?.amount?.stringValue || "N/A"}</Typography>
          <Typography>Date: {transaction.fields?.date?.stringValue || "N/A"}</Typography>
        </Paper>
      ))}
    </Container>
  );
};

export default TransactionHistory;



 

