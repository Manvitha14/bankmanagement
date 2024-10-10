import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import CreateAccount from './components/CreateAccount';
import AdminDashboard from './components/Admin';
import Login from './components/Login';
import LoanApplication from './components/LoanApplication'; // Import LoanApplication
import AccountDetails from './components/AccountDetails'; // Import UserDetails
import TransactionForm from './components/Transaction';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account-details" element={<AccountDetails />} />
        <Route path="/transaction" element={<TransactionForm />} />
        <Route path="/loan-application" element={<LoanApplication />} /> {/* Loan Application Route */}
      </Routes>
    </Router>
  );
}

export default App;
