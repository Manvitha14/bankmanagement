import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AccountDetails = () => {
  const location = useLocation();
  const [accountDetails, setAccountDetails] = useState(null);

  useEffect(() => {
    if (location.state && location.state.accountDetails) {
      setAccountDetails(location.state.accountDetails);
    } else {
      // Handle the case where account details are not passed correctly
      console.error('No account details found.');
    }
  }, [location.state]);

  return (
    <div>
      <h2>Account Details</h2>
      {accountDetails ? (
        <div>
          <p><b>Name:</b> {accountDetails.name.stringValue}</p>
          <p><b>Email:</b> {accountDetails.email.stringValue}</p>
          <p><b>Phone:</b> {accountDetails.phone.stringValue}</p>
          <p><b>AccountNumber:</b> {accountDetails.accountNumber.integerValue}</p>
          <p><b>Balance:</b> {accountDetails.balance.integerValue}</p>
          <p><b>Transfer Limit:</b> {accountDetails.transferlimit.integerValue}</p>
          <p><b>IFSC:</b> {accountDetails.IFSC.stringValue}</p>
        </div>
      ) : (
        <p>Loading account details...</p>
      )}
    </div>
  );
};

export default AccountDetails;
