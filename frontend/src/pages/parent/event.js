import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Parent/Navbar";
import Layout from "@/components/Parent/Layout";
import Modal from "@/components/Parent/Modal";

const Events = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingEvent, setUpdatingEvent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        await fetchEvents();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get("http://localhost:5000/api/events/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Events</h1>
        {loading ? (
          <p>Loading events...</p>
        ) : (
          <>
            

          
            
            {events.length === 0 ? (
              <p>No events available</p>
            ) : (
              <table className="w-full border border-gray-200">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Title</th>
                    <th className="border px-4 py-2">Description</th>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td className="border px-4 py-2">{event.title}</td>
                      <td className="border px-4 py-2">{event.description}</td>
                      <td className="border px-4 py-2">{event.date}</td>
                      <td className="border px-4 py-2">{event.location}</td>
                     
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
     
    </Layout>
  );
};

export default Events;
