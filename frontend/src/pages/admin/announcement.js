import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Announcements = () => {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    subject: "",
    content: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);

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

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsEditing(true);
  };

  const handleDelete = (announcement) => {
    setDeletingAnnouncement(announcement);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/announcements/remove/${deletingAnnouncement._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAnnouncements(
        announcements.filter(
          (announcement) => announcement._id !== deletingAnnouncement._id
        )
      );
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    } finally {
      setIsModalVisible(false);
      setDeletingAnnouncement(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingAnnouncement(null);
  };

  const handleAddAnnouncement = () => {
    setIsAdding(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isEditing && editingAnnouncement) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5000/api/announcements/update/${editingAnnouncement._id}`,
          editingAnnouncement,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setAnnouncements(
          announcements.map((announcement) =>
            announcement._id === editingAnnouncement._id
              ? editingAnnouncement
              : announcement
          )
        );
        setIsEditing(false);
        setEditingAnnouncement(null);
      } catch (error) {
        console.error("Failed to update announcement:", error);
      }
    } else if (isAdding) {
      if (
        newAnnouncement.subject.trim() === "" ||
        newAnnouncement.content.trim() === ""
      ) {
        alert("Subject and content cannot be empty!");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/api/announcements/create",
          newAnnouncement,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setAnnouncements([...announcements, response.data]);
        fetchAnnouncements();
        setIsAdding(false);
        setNewAnnouncement({ subject: "", content: "" });
      } catch (error) {
        console.error("Failed to add announcement:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingAnnouncement({
        ...editingAnnouncement,
        [name]: value,
      });
    } else if (isAdding) {
      setNewAnnouncement({
        ...newAnnouncement,
        [name]: value,
      });
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
          Announcements List
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
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={handleAddAnnouncement}
          className="mt-8 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
        >
          Add Announcement
        </button>

        {(isEditing || isAdding) && (
          <form onSubmit={handleFormSubmit} className="mt-8">
            <div className="mb-4">
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={
                  isEditing
                    ? editingAnnouncement.subject || ""
                    : newAnnouncement.subject || ""
                }
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-3 mt-1"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={
                  isEditing
                    ? editingAnnouncement.content || ""
                    : newAnnouncement.content || ""
                }
                onChange={handleInputChange}
                rows="4"
                className="block w-full border border-gray-300 rounded-md shadow-sm p-3 mt-1"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors mr-4"
            >
              {isEditing ? "Save Changes" : "Add Announcement"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setIsAdding(false);
                setEditingAnnouncement(null);
                setNewAnnouncement({ subject: "", content: "" });
              }}
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
        message={`Are you sure you want to delete announcement?`}
      />
    </Layout>
  );
};

export default Announcements;
