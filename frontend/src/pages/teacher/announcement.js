import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Teacher/Navbar";
import Layout from "@/components/Teacher/Layout";
import Modal from "@/components/Teacher/Modal";

const Announcements = () => {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchAnnouncements();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        "http://localhost:5000/api/announcements/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

   if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 h-[calc(100vh-120px)] scroll-hidden overflow-y-auto">
        <h2 className="text-3xl font-semibold mb-8 text-blue-800">
          Announcements 
        </h2>
        {loading ? (
          <p>Loading...</p>
        ) : announcements.length === 0 ? (
          <p>No announcements available.</p>
        ) : (
          <ul>
            {announcements.map((announcement) => (
              <li
                key={announcement._id}
                className="mb-4 p-4 border border-gray-200 rounded-lg flex flex-col"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {announcement.subject}
                </h3>
                <p className="text-gray-700 mb-4">{announcement.content}</p>
               
              </li>
            ))}
          </ul>
        )}
       
      </div>

      
    </Layout>
  );
};

export default Announcements;
