import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import "../app/globals.css";
require("dotenv").config();


const REACT_APP_API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('students'); 
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await axios.post(`${REACT_APP_API_URL}/${role}/forgot-password`, { email, role });
      setMessage('Password reset link sent to your email.');
    } catch (error) {
      console.error('Error in forgot password:', error);
      setError('Failed to send password reset link. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-12 px-4 mt-20">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">Forgot Password</h2>
          {message && <p className="text-green-500 text-center mb-4">{message}</p>}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
           <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
           <select
             id="role"
             value={role}
             onChange={(e) => setRole(e.target.value)}
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
           >
             <option value="admins">Headmaster</option>
             <option value="teachers">Teacher</option>
             <option value="students">Student</option>
             <option value="parents">Parent</option>
           </select>
         </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ForgotPassword;
