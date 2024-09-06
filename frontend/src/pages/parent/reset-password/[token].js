import { useRouter } from 'next/router';
import { useState } from 'react';
import axios from 'axios';
import "../../../app/globals.css";
const REACT_APP_API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const ResetPassword = () => {
  const router = useRouter();
  const { token } = router.query;
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        
      if (!token) {
        throw new Error('Reset token is missing');
      }
      await axios.post(`${REACT_APP_API_URL}/parents/reset-password/${token}`, { newPassword });
      setMessage('Password has been successfully reset.');
      router.push('/login'); 
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage('Error resetting password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password:
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset Password
          </button>
          {message && (
            <p className={`mt-4 text-center text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
