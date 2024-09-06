import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Student/Navbar";
import Layout from "@/components/Student/Layout";
import Modal from "@/components/Student/Modal";

const Account = () => {
  const router = useRouter();
  const [accountDetails, setAccountDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchAccountDetails();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchAccountDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }
      const response = await axios.get(
        "http://localhost:5000/api/students/student-details",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAccountDetails(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error("Failed to fetch account details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/students/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        fetchAccountDetails();
        setIsEditing(false);
      } else {
        console.error(
          "Failed to update account details:",
          response.data.message
        );
      }
    } catch (error) {
      if (error.response) {
        console.error("Server responded with:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error", error.message);
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-20 scroll-hidden overflow-y-auto">
        <h2 className="text-3xl font-semibold mb-20 text-blue-800">
          Account Details
        </h2>
        {accountDetails && !isEditing && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-lg font-medium">Name:</span>
              <span className="text-lg">{accountDetails.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-lg font-medium">Email:</span>
              <span className="text-lg">{accountDetails.email}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg font-medium">BirthDate:</span>
              <span className="text-lg">{accountDetails.birthDate}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg font-medium">Address:</span>
              <span className="text-lg">{accountDetails.address}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg font-medium">Phone:</span>
              <span className="text-lg">{accountDetails.phone}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg font-medium">Sex:</span>
              <span className="text-lg">{accountDetails.sex}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors mt-10"
            >
              Edit
            </button>
          </div>
        )}

        {isEditing && (
          <form onSubmit={handleFormSubmit} className="mt-2">
            <div className="flex justify-between mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="block w-3/4 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-800 focus:border-blue-900"
              />
            </div>

            <div className="flex justify-between mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="block w-3/4 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-800 focus:border-blue-900"
              />
            </div>
            <div className="flex justify-between mb-6">
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700"
              >
                BirthDate
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate || ""}
                onChange={handleInputChange}
                className="block w-3/4 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-800 focus:border-blue-900"
              />
            </div>

            <div className="flex justify-between mb-6">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                className="block w-3/4 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-800 focus:border-blue-900"
              />
            </div>
            <div className="flex justify-between mb-6">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <input
                type="number"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                className="block w-3/4 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-800 focus:border-blue-900"
              />
            </div>
            <div className="flex justify-between mb-6">
              <label
                htmlFor="sex"
                className="block text-sm font-medium text-gray-700"
              >
                Sex
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex || ""}
                onChange={handleInputChange}
                className="block w-3/4 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-800 focus:border-blue-900"
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors mr-4"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              type="button"
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default Account;
