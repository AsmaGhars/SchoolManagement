import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "../components/Footer";
import "../app/globals.css";
import axios from "axios";
import Navbar from "@/components/Navbar";
require("dotenv").config();
const REACT_APP_API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("students");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        `${REACT_APP_API_URL}/${role.toLowerCase()}/login`,
        { email, password }
      );

      if (response.status === 200) {
        const { token } = response.data;
        console.log("Login successful:", token);

        localStorage.setItem("token", token);

        setTimeout(() => {
          if (role === "admins") {
            router.push("/admin-dashboard");
          } else if (role === "teachers") {
            router.push("/teacher-dashboard");
          } else if (role === "students") {
            router.push("/student-dashboard");
          } else if (role === "parents") {
            router.push("/parent-dashboard");
          }
        }, 100);
      } else {
        console.error("Login failed:", response.data.message);
        setError("Login failed. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-12 px-4 mt-20">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
            Login
          </h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
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
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            You want to create a virtual School?{" "}
            <Link href="/signup" className="text-blue-800 hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="mt-4 text-center text-sm text-gray-600">
            <Link
              href="/forgot-password"
              className="text-blue-800 hover:underline"
            >
              Forgot Password?
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Login;
