import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Ensure you have axios installed
import { API_URLS } from './firebase'; // Import your API URLs

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    aadhar: null,
    pan: null,
    initialBalance: '',
    agreeTerms: false,
  });

  const [customerCounter, setCustomerCounter] = useState(0); // To fetch the latest customer ID
  const [accountCounter, setAccountCounter] = useState(0); // To generate unique account numbers

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the latest customer and account counters from Firestore
    const fetchCounters = async () => {
      try {
        // Fetch the account counter (you might have a separate collection for this)
        const accountResponse = await axios.get(API_URLS.accountCollection);
        const latestAccount = accountResponse.data.documents.length;
        setAccountCounter(latestAccount + 1); // Set to next account number
      } catch (error) {
        console.error('Error fetching counters:', error);
      }
    };

    fetchCounters();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    setFormData({ ...formData, [name]: e.target.files[0] });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, agreeTerms: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.address || !formData.aadhar || !formData.pan || !formData.initialBalance) {
      alert('Please fill in all fields.');
      return;
    }

    if (!formData.agreeTerms) {
      alert('Please agree to the terms and conditions.');
      return;
    }

    // Create the body for the API request to store in the Admin collection
    const adminBody = {
      fields: {
        name: { stringValue: formData.name },
        email: { stringValue: formData.email },
        phone: { stringValue: formData.phone },
        password: { stringValue: formData.password }, // Ensure password is included
        address: { stringValue: formData.address }, // Ensure address is included
        aadhar: { stringValue: formData.aadhar.name },
        pan: { stringValue: formData.pan.name },
        status: { stringValue: 'pending' }, // Set status to pending
        balance: { integerValue: parseInt(formData.initialBalance) }, // Use user-defined balance
        accountNumber: { integerValue: accountCounter }, // Generate unique account number
        transferlimit: { integerValue: 500000 }, // Set default transfer limit
        IFSC: { stringValue: 'Manvi2003' }, // Set IFSC code
      },
    };

    try {
      // Create account in the Admin collection (pending approval)
      const adminResponse = await axios.post(API_URLS.adminCollection, adminBody);
      console.log('Account created in Admin collection with pending status:', adminResponse.data);

      // Redirect to a confirmation page or admin dashboard after submission
      alert('Account created successfully and is pending admin approval.');
      navigate('/admin-dashboard'); // Redirect to Admin Dashboard
    } catch (error) {
      console.error('Error creating account in Admin collection:', error);
      alert('Error creating account: ' + error.response?.data?.error?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleInputChange} />
        <input type="email" name="email" placeholder="Email" onChange={handleInputChange} />
        <input type="text" name="phone" placeholder="Phone" onChange={handleInputChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleInputChange} />
        <textarea name="address" placeholder="Address" onChange={handleInputChange}></textarea>
        <input type="file" name="aadhar" onChange={handleFileChange} />
        <input type="file" name="pan" onChange={handleFileChange} />
        <input 
          type="number" 
          name="initialBalance" 
          placeholder="Initial Balance" 
          value={formData.initialBalance} 
          onChange={handleInputChange} 
        />
        <div>
          <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleCheckboxChange} />
          <label htmlFor="agreeTerms">I agree to the terms and conditions</label>
        </div>
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default CreateAccount;
