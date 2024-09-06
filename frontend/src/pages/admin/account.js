import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal"; 

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
        "http://localhost:5000/api/admins/details",
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

 

  if (!isAuthenticated) {
    return null;
  }

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
        "http://localhost:5000/api/admins/update",
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

  const handleDeleteAccount = () => {
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        "http://localhost:5000/api/admins/delete",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        window.location.href = "/login";
      } else {
        console.error("Failed to delete account:", response.data.message);
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
    setIsModalVisible(false); 
  };

  const cancelDelete = () => {
    setIsModalVisible(false); 
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-20">
        <h2 className="text-3xl font-semibold mb-20 text-blue-800">Account Details</h2>
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
            <div className="flex justify-between mb-2">
              <span className="text-lg font-medium">School Name:</span>
              <span className="text-lg">{accountDetails.schoolName}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg font-medium">Fees:</span>
              <span className="text-lg">{accountDetails.fees}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors mt-10"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-4"
            >
              Delete Account
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
                htmlFor="schoolName"
                className="block text-sm font-medium text-gray-700"
              >
                School Name
              </label>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                value={formData.schoolName || ""}
                onChange={handleInputChange}
                className="block w-3/4 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-800 focus:border-blue-900"
              />
            </div>

            <div className="flex justify-between mb-6">
              <label
                htmlFor="fees"
                className="block text-sm font-medium text-gray-700"
              >
                Fees
              </label>
              <input
                type="number"
                id="fees"
                name="fees"
                value={formData.fees || ""}
                onChange={handleInputChange}
                className="block w-3/4 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-800 focus:border-blue-900"
              />
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

      <Modal
        isVisible={isModalVisible}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        message={`Are you sure you want to delete your account?`}
      />
    </Layout>
  );
};

export default Account;
