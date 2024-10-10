import React, { useState } from 'react';

const Transaction = () => {
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [senderDetails, setSenderDetails] = useState(null);
  const [receiverDetails, setReceiverDetails] = useState(null);

  const firestoreUrl = 'https://firestore.googleapis.com/v1/projects/bankmanagement-25d7e/databases/(default)/documents/customers';

  // Fetch customer details from Firestore based on phone number
  const fetchCustomerDetails = async (phoneNumber) => {
    const customerUrl = `${firestoreUrl}/${phoneNumber}`;

    try {
      const response = await fetch(customerUrl);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching customer details:', errorData);
        throw new Error('Failed to fetch customer details.');
      }

      const customer = await response.json();
      console.log('Fetched customer details:', customer);
      return customer;
    } catch (error) {
      console.error('Error fetching customer details:', error.message);
      throw error;
    }
  };

  // Update customer balance in Firestore
  const updateCustomerBalance = async (phoneNumber, newBalance) => {
    const customerUrl = `${firestoreUrl}/${phoneNumber}`;

    const updateData = {
      fields: {
        balance: { integerValue: newBalance.toString() }
      }
    };

    try {
      const response = await fetch(customerUrl + '?updateMask.fieldPaths=balance', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating balance:', errorData);
        throw new Error('Failed to update customer balance.');
      }

      const updatedCustomer = await response.json();
      console.log('Updated customer details:', updatedCustomer);
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating balance:', error.message);
      throw error;
    }
  };

  // Handle transaction between sender and receiver
  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      // Fetch details for both sender and receiver
      const senderData = await fetchCustomerDetails(senderPhone);
      const receiverData = await fetchCustomerDetails(receiverPhone);

      const senderBalance = parseInt(senderData.fields.balance.integerValue);
      const receiverBalance = parseInt(receiverData.fields.balance.integerValue);
      const transferAmount = parseInt(amount);

      if (senderBalance < transferAmount) {
        setTransactionStatus('Insufficient balance in sender account');
        return;
      }

      // Calculate new balances
      const newSenderBalance = senderBalance - transferAmount;
      const newReceiverBalance = receiverBalance + transferAmount;

      // Update balances in Firestore
      const updatedSender = await updateCustomerBalance(senderPhone, newSenderBalance);
      const updatedReceiver = await updateCustomerBalance(receiverPhone, newReceiverBalance);

      // Set updated details to display
      setSenderDetails(updatedSender.fields);
      setReceiverDetails(updatedReceiver.fields);

      setTransactionStatus('Transaction successful');
    } catch (error) {
      setTransactionStatus('Transaction failed: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Money Transfer</h2>
      <form onSubmit={handleTransaction}>
        <div>
          <label>Sender Phone Number:</label>
          <input
            type="text"
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Receiver Phone Number:</label>
          <input
            type="text"
            value={receiverPhone}
            onChange={(e) => setReceiverPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      {transactionStatus && <p>{transactionStatus}</p>}

      {senderDetails && (
        <div>
          <h3>Sender Details After Transaction:</h3>
          <p>Name: {senderDetails.name.stringValue}</p>
          <p>Phone: {senderDetails.phone.stringValue}</p>
          <p>Balance: {senderDetails.balance.integerValue}</p>
          <p>Address: {senderDetails.address.stringValue}</p>
          <p>Aadhar: {senderDetails.aadhar.stringValue}</p>
          <p>PAN: {senderDetails.pan.stringValue}</p>
        </div>
      )}

      {receiverDetails && (
        <div>
          <h3>Receiver Details After Transaction:</h3>
          <p>Name: {receiverDetails.name.stringValue}</p>
          <p>Phone: {receiverDetails.phone.stringValue}</p>
          <p>Balance: {receiverDetails.balance.integerValue}</p>
          <p>Address: {receiverDetails.address.stringValue}</p>
          <p>Aadhar: {receiverDetails.aadhar.stringValue}</p>
          <p>PAN: {receiverDetails.pan.stringValue}</p>
        </div>
      )}
    </div>
  );
};

export default Transaction;
