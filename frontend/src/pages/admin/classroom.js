import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Classrooms = () => {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [newClassroom, setNewClassroom] = useState({ name: "" });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingClassroom, setDeletingClassroom] = useState(null);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchClassrooms();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/classrooms/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setClassrooms(response.data);
    } catch (error) {
      console.error("Failed to fetch classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    setIsEditing(true);
  };

  const handleDelete = (classroom) => {
    setDeletingClassroom(classroom);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/classrooms/delete/${deletingClassroom._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassrooms(classrooms.filter((classroom) => classroom._id !== deletingClassroom._id));
    } catch (error) {
      console.error("Failed to delete classroom:", error);
    } finally {
      setIsModalVisible(false);
      setDeletingClassroom(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingClassroom(null);
  };

  const handleAddClass = () => {
    setIsAdding(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    if (isEditing && editingClassroom) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5000/api/classrooms/update/${editingClassroom._id}`,
          editingClassroom,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setClassrooms(classrooms.map((classroom) =>
          classroom._id === editingClassroom._id ? editingClassroom : classroom
        ));
        setIsEditing(false);
        setEditingClassroom(null);
      } catch (error) {
        console.error("Failed to update classroom:", error);
      }
    } else if (isAdding) {
      if (newClassroom.name.trim() === "") {
        alert("Classroom name cannot be empty!");
        return;
      }
  
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/api/classrooms/create",
          newClassroom,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setClassrooms([...classrooms, response.data]);
        fetchClassrooms();
        setIsAdding(false);
        setNewClassroom({ name: "" });
      } catch (error) {
        console.error("Failed to add classroom:", error);
      }
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingClassroom({
        ...editingClassroom,
        [name]: value,
      });
    } else if (isAdding) {
      setNewClassroom({
        ...newClassroom,
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
        <h2 className="text-3xl font-semibold mb-8 text-blue-800">Classroom List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : classrooms.length === 0 ? (
          <p>No classrooms available.</p>
        ) : (
          <ul>
            {classrooms.map((classroom) => (
              <li
                key={classroom._id}
                className="mb-4 p-4 border border-gray-200 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-semibold">{classroom.name}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(classroom)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(classroom)}
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
          onClick={handleAddClass}
          className="mt-8 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
        >
          Add Classroom
        </button>

        {(isEditing || isAdding) && (
          <form onSubmit={handleFormSubmit} className="mt-8">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Classroom Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={isEditing ? editingClassroom.name || "" : newClassroom.name || ""}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-3 mt-1"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors mr-4"
            >
              {isEditing ? "Save Changes" : "Add Classroom"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setIsAdding(false);
                setEditingClassroom(null);
                setNewClassroom({ name: "" });
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
        message={`Are you sure you want to delete classroom ${deletingClassroom?.name}?`}
      />
    </Layout>
  );
};

export default Classrooms;
