import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import loanImage from '../images/personal loan.jpg';
import accountImage from '../images/accounts.png';
import investmentImage from '../images/investments.jpg';
import creditCardImage from '../images/credit-card.jpg';
import bankLogo from '../images/banklogo.jpg';
import transactionImage from '../images/transcation.png';

const Home = () => {
  const [userName, setUserName] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserName(parsedUser.name);
    } else {
      // Show signup prompt if no user is logged in
      setShowSignupPrompt(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUserName(null);
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/create-account');
  };

  const handleLoanClick = () => {
    navigate('/loan-application'); 
  };

  const handleAccountsClick = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      setStatusMessage('User details not found. Please log in.');
      return;
    }
    try {
      const requestBody = {
        structuredQuery: {
          where: {
            fieldFilter: {
              field: { fieldPath: 'email' },
              op: 'EQUAL',
              value: { stringValue: user.email },
            },
          },
          from: [{ collectionId: 'customers' }],
        },
      };

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

        // Redirect to account details page
        navigate('/account-details', { state: { accountDetails: userAccount } });
      } else {
        setStatusMessage('No account details found for this user.');
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
      setStatusMessage('An error occurred while fetching account details.');
    }
  };

  return (
    <div className="home-container">
      <div className="header">
        <img src={bankLogo} alt="Bank Logo" className="logo" />
        {userName ? (
          <div className="user-info">
            <span>Welcome, {userName}!</span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="options">
            <button className="button" onClick={() => navigate('/login')}>Login</button>
            {showSignupPrompt && (
              <p>
                Don't have an account? <Link to="/create-account">Sign up</Link>
              </p>
            )}
          </div>
        )}
      </div>

      <h1>Welcome to Bank Management</h1>

      {/* Services Section */}
      <div className="services">
        <h2>Our Services</h2>
        <div className="service-options">
          <div className="service" onClick={handleLoanClick}>
            <img src={loanImage} alt="Loans" className="service-image" />
            <div className="service-name"><b>Loans</b></div>
          </div>
          <div className="service" onClick={handleAccountsClick}>
            <img src={accountImage} alt="Accounts" className="service-image" />
            <div className="service-name"><b>Accounts</b></div>
          </div>
          <div className="service">
            <img src={investmentImage} alt="Investments" className="service-image" />
            <div className="service-name"><b>Investments</b></div>
          </div>
          <div className="service">
            <img src={creditCardImage} alt="Credit Cards" className="service-image" />
            <div className="service-name"><b>Credit Cards</b></div>
          </div>
          <div className="service" onClick={() => navigate('/transaction')}>
            <img src={transactionImage} alt="Transaction" className="service-image" />
            <div className="service-name"><b>Money Transfer</b></div>
          </div>
        </div>
      </div>

      {/* Status message */}
      {statusMessage && <p>{statusMessage}</p>}

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Bank Management. All rights reserved.</p>
          <div className="contact-info">
            <p><b>Customer Support:</b> 1-800-123-4567</p>
            <p><b>Email:</b> support@bankmanagement.com</p>
            <p><b>Contact Us:</b> 123 Bank St, Financial City, FC 12345</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
