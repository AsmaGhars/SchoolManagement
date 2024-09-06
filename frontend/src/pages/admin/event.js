import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

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

  const handleDelete = (event) => {
    setDeletingEvent(event);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/events/remove/${deletingEvent._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== deletingEvent._id));
    } catch (error) {
      console.error("Failed to delete event:", error);
    } finally {
      setIsModalVisible(false);
      setDeletingEvent(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingEvent(null);
  };

  const handleChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post("http://localhost:5000/api/events/create", newEvent, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setEvents([data.event, ...events]);
      setIsAdding(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        location: "",
      });
    } catch (error) {
      console.error("Failed to create event:", error.message);
    }
  };

  const handleUpdate = (event) => {
    setUpdatingEvent(event);
    setIsUpdating(true);
  };

  const handleUpdateChange = (e) => {
    setUpdatingEvent({ ...updatingEvent, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/events/update/${updatingEvent._id}`, updatingEvent, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === updatingEvent._id ? updatingEvent : event
        )
      );
      setIsUpdating(false);
      setUpdatingEvent(null);
    } catch (error) {
      console.error("Failed to update event:", error.message);
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Event Management</h1>
        {loading ? (
          <p>Loading events...</p>
        ) : (
          <>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
              onClick={() => setIsAdding(!isAdding)}
            >
              {isAdding ? "Cancel" : "Add New Event"}
            </button>

            {isAdding && (
              <form onSubmit={handleSubmit} className="mb-4">
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newEvent.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newEvent.description}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2" htmlFor="date">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newEvent.date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2" htmlFor="location">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newEvent.location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                >
                  Save Event
                </button>
              </form>
            )}

            {isUpdating && (
              <form onSubmit={handleUpdateSubmit} className="mb-4">
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={updatingEvent.title}
                    onChange={handleUpdateChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={updatingEvent.description}
                    onChange={handleUpdateChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2" htmlFor="date">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={updatingEvent.date}
                    onChange={handleUpdateChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2" htmlFor="location">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={updatingEvent.location}
                    onChange={handleUpdateChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                >
                  Update Event
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded mt-2 ml-2"
                  onClick={() => {
                    setIsUpdating(false);
                    setUpdatingEvent(null);
                  }}
                >
                  Cancel
                </button>
              </form>
            )}

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
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td className="border px-4 py-2">{event.title}</td>
                      <td className="border px-4 py-2">{event.description}</td>
                      <td className="border px-4 py-2">{event.date}</td>
                      <td className="border px-4 py-2">{event.location}</td>
                      <td className="border px-4 py-2">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                          onClick={() => handleUpdate(event)}
                        >
                          Update
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => handleDelete(event)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
      {isModalVisible && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete {deletingEvent?.title}?</p>
              <div className="flex justify-between mt-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </Layout>
  );
};

export default Events;
