import { useState, useEffect } from "react";
import axios from "axios";
import "../../app/globals.css";
import { useRouter } from "next/router";
import Navbar from "@/components/Parent/Navbar";
import Layout from "@/components/Parent/Layout";

const Notifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchNotifications();
      } else {
        router.push("/login");
      }
    };
    checkAuthentication();
  }, [router]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/notifications/user",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );      
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 h-[calc(100vh-120px)] scroll-hidden overflow-y-auto">
        <h2 className="text-3xl font-semibold mb-8 text-blue-800">
          Notifications List
        </h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li key={notification._id} className="mb-4 p-4 border rounded-md shadow-sm">
                <h3 className="text-xl font-semibold text-blue-600">{notification.title}</h3>
                <p className="text-gray-700">{notification.message}</p>
                <span className="block text-sm text-gray-500 mt-2">
                  {new Date(notification.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
