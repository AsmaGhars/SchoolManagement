import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Subjects = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubject, setNewSubject] = useState({
    subName: "",
    coefficient: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [subjectsWithNoTeachers, setSubjectsWithNoTeachers] = useState([]);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchSubjects();
        fetchSubjectsWithNoTeachers(); // Fetch subjects with no teachers
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/subjects/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSubjects(response.data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsWithNoTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/subjects/free",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSubjectsWithNoTeachers(response.data);
    } catch (error) {
      console.error("Failed to fetch subjects with no teachers:", error);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setIsEditing(true);
  };

  const handleDelete = (subject) => {
    setDeletingSubject(subject);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/subjects/delete/${deletingSubject._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubjects(
        subjects.filter((subject) => subject._id !== deletingSubject._id)
      );
    } catch (error) {
      console.error("Failed to delete subject:", error);
    } finally {
      
      setIsModalVisible(false);
      setDeletingSubject(null);
     
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingSubject(null);
  };

  const handleAddSubject = () => {
    setIsAdding(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isEditing && editingSubject) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5000/api/subjects/update/${editingSubject._id}`,
          editingSubject,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setSubjects(
          subjects.map((subject) =>
            subject._id === editingSubject._id ? editingSubject : subject
          )
        );
        setIsEditing(false);
        setEditingSubject(null);
      } catch (error) {
        console.error("Failed to update subject:", error);
      }
    } else if (isAdding) {
      if (newSubject.subName.trim() === "" || !newSubject.coefficient) {
        alert("Subject name and coefficient are required!");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/api/subjects/create",
          newSubject,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setSubjects([...subjects, response.data]);
        fetchSubjects();
        fetchSubjectsWithNoTeachers();
        setIsAdding(false);

        setNewSubject({ subName: "", coefficient: "" });
      } catch (error) {
        console.error("Failed to add subject:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingSubject({
        ...editingSubject,
        [name]: value,
      });
    } else if (isAdding) {
      setNewSubject({
        ...newSubject,
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
          Subject List
        </h2>
        {loading ? (
          <p>Loading...</p>
        ) : subjects.length === 0 ? (
          <p>No subjects available.</p>
        ) : (
          <ul>
            {subjects.map((subject) => (
              <li
                key={subject._id}
                className="mb-4 p-4 border border-gray-200 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-semibold">{subject.subName}</h3>
                  <p className="text-gray-600">
                    Coefficient: {subject.coefficient}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subject)}
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
          onClick={handleAddSubject}
          className="mt-8 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
        >
          Add Subject
        </button>

        {(isEditing || isAdding) && (
          <form onSubmit={handleFormSubmit} className="mt-8">
            <div className="mb-4">
              <label
                htmlFor="subName"
                className="block text-sm font-medium text-gray-700"
              >
                Subject Name
              </label>
              <input
                type="text"
                id="subName"
                name="subName"
                value={
                  isEditing
                    ? editingSubject.subName || ""
                    : newSubject.subName || ""
                }
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-3 mt-1"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="coefficient"
                className="block text-sm font-medium text-gray-700"
              >
                Coefficient
              </label>
              <input
                type="number"
                id="coefficient"
                name="coefficient"
                value={
                  isEditing
                    ? editingSubject.coefficient || ""
                    : newSubject.coefficient || ""
                }
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-3 mt-1"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              {isEditing ? "Update" : "Add"} Subject
            </button>
            <button
              type="button"
              onClick={() =>
                isEditing ? setIsEditing(false) : setIsAdding(false)
              }
              className="ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        <Modal
          isVisible={isModalVisible}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          message={`Are you sure you want to delete subject ${deletingSubject?.subName}?`}
        />

        <h3 className="text-2xl font-semibold mt-8 mb-8 text-blue-800">
          Subjects with No Teachers Assigned
        </h3>
        {subjectsWithNoTeachers.length === 0 ? (
          <p>No subjects without teachers assigned.</p>
        ) : (
          <ul>
            {subjectsWithNoTeachers.map((subject) => (
              <li
                key={subject._id}
                className="mb-4 p-4 border border-gray-200 rounded-lg"
              >
                <h3 className="text-xl font-semibold">{subject.subName}</h3>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Subjects;
