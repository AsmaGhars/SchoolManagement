import React, { useState } from 'react';
import Link from 'next/link';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import "../app/globals.css";
import axios from 'axios';  
import Navbar from '@/components/Navbar';
require("dotenv").config();
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [fees, setFees] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${REACT_APP_API_URL}/admins/signup`, { name, email, password, schoolName, fees });
      console.log(`${REACT_APP_API_URL}/admins/signup`);
      
      const { message } = response.data;
      console.log('Signup successful:', message);
      setSuccess('Signup successful!');
      setName('');
      setEmail('');
      setPassword('');
      setSchoolName('');
      setFees('');
    } catch (error) {
      console.error('Error during signup:', error);
      setError('Signup failed. Please check your details and try again.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-12 px-4 mt-40">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">Sign Up</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">School Name</label>
              <input
                type="text"
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your school name"
                required
              />
            </div>
            <div>
              <label htmlFor="fees" className="block text-sm font-medium text-gray-700">Fees</label>
              <input
                type="number"
                id="fees"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter the fees amount"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-800 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Signup;
