import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "@/components/Parent/Navbar";
import Footer from "@/components/Footer";
import Layout from "@/components/Parent/Layout";

import "../../app/globals.css";

const REACT_APP_API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ChangePassword = () => {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "auto";
        };
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);
  if (!isAuthenticated) {
    return null;
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${REACT_APP_API_URL}/parents/change-password`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("Password changed successfully.");
      setTimeout(() => {
        router.push("/parent/dashboard"); 
      }, 220); 
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Failed to change password. Please try again.");
    }
  };

  return (
    <Layout>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-12 px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg -mt-40">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
            Change Password
          </h2>
          {message && (
            <p className="text-green-500 text-center mb-4">{message}</p>
          )}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="oldPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Old Password
              </label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your old password"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your new password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Change Password
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </Layout>
  );
};

export default ChangePassword;
