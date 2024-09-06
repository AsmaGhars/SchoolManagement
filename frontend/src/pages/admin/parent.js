import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Parents = () => {
  const router = useRouter();
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [newParent, setNewParent] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    relationship: "",
    sex: "",
    password: "",
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingParent, setDeletingParent] = useState(null);
  const [noParentsMessage, setNoParentsMessage] = useState(false);
  const [noStudentsMessage, setNoStudentsMessage] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        await fetchParents();
        await fetchStudents();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchParents = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(
        "http://localhost:5000/api/parents/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setParents(data);
      setNoParentsMessage(data.length === 0);
    } catch (error) {
      console.error("Failed to fetch parents:", error.message);
      setNoParentsMessage(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(
        "http://localhost:5000/api/students/free",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setStudents(data);
      setNoStudentsMessage(data.length === 0);
    } catch (error) {
      console.error("Failed to fetch students:", error.message);
      setNoStudentsMessage(true);
    }
  }, []);

  const handleDelete = (parent) => {
    setDeletingParent(parent);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/parents/delete/${deletingParent._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setParents((prevParents) => prevParents.filter((parent) => parent._id !== deletingParent._id));
    } catch (error) {
      console.error("Failed to delete parent:", error);
    } finally {
      fetchStudents();
      setIsModalVisible(false);
      setDeletingParent(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingParent(null);
  };

  const handleAddParent = () => {
    setIsAdding(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(newParent).some((field) => field.trim() === "")) {
      alert("All fields are required!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/parents/addparent",
        newParent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setParents((prevParents) => [...prevParents, data.parent]);
      setIsAdding(false);
      setNewParent({
        name: "",
        email: "",
        phone: "",
        address: "",
        relationship: "",
        sex: "",
        password: "",
      });
    } catch (error) {
      console.error("Failed to add parent:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewParent((prevParent) => ({
      ...prevParent,
      [name]: value,
    }));
  };

  const handleAssignChild = (parentId) => {
    setSelectedParentId(parentId);
    setIsAssigning(true);
    setSelectedStudents([]); 
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/parents/addchild/${selectedParentId}`,
        { studentIds: selectedStudents },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchStudents();
      setIsAssigning(false);
      setSelectedStudents([]);
    } catch (error) {
      console.error("Failed to assign students:", error);
    }
  };

  const handleStudentChange = (e) => {
    const { value, checked } = e.target;
    setSelectedStudents((prevSelected) =>
      checked ? [...prevSelected, value] : prevSelected.filter((id) => id !== value)
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 h-[calc(100vh-120px)] scroll-hidden overflow-y-auto">
        <h2 className="text-3xl font-semibold text-blue-800 mb-10">Parents List</h2>
        {loading ? (
          <p className="text-center text-blue-600">Loading...</p>
        ) : noParentsMessage ? (
          <p className="text-center text-gray-600">No parents available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parents.map((parent) => (
              <div key={parent._id} className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                <h3 className="text-xl text-blue-900 font-semibold mb-2">{parent.name}</h3>
                <p className="mb-2"><strong>Email:</strong> {parent.email}</p>
                <p className="mb-2"><strong>Phone:</strong> {parent.phone}</p>
                <p className="mb-2"><strong>Address:</strong> {parent.address}</p>
                <p className="mb-2"><strong>Relationship:</strong> {parent.relationship}</p>
                <p className="mb-2"><strong>Sex:</strong> {parent.sex}</p>

                <div className="flex gap-2 mt-4">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    onClick={() => handleDelete(parent)}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    onClick={() => handleAssignChild(parent._id)}
                  >
                    Assign Children
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          className="bg-blue-900 text-white px-4 py-2 rounded mt-8 hover:bg-blue-800 transition"
          onClick={handleAddParent}
        >
          Add Parent
        </button>
        <Modal
          isVisible={isModalVisible}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          title="Confirm Delete"
          message="Are you sure you want to delete this parent?"
        />
        {isAdding && (
          <form onSubmit={handleFormSubmit} className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">Add New Parent</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newParent.name}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg w-full py-2 px-4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newParent.email}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg w-full py-2 px-4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={newParent.phone}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg w-full py-2 px-4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={newParent.address}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg w-full py-2 px-4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Relationship</label>
                <select
                  name="relationship"
                  value={newParent.relationship}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg w-full py-2 px-4"
                  required
                >
                  <option value="">Select</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Sex</label>
                <select
                  name="sex"
                  value={newParent.sex}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg w-full py-2 px-4"
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={newParent.password}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg w-full py-2 px-4"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-900 text-white px-4 py-2 rounded mt-4 hover:bg-blue-800 transition"
            >
              Add Parent
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-4 hover:bg-gray-600 transition"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
          </form>
        )}
        {isAssigning && (
          <form onSubmit={handleAssignSubmit} className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">Assign Students to Parent</h3>
            {noStudentsMessage ? (
              <p className="text-center text-gray-600">No students available to assign.</p>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student._id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={student._id}
                      checked={selectedStudents.includes(student._id)}
                      onChange={handleStudentChange}
                      className="mr-2"
                    />
                    <label className="text-gray-700">{student.name}</label>
                  </div>
                ))}
                <button
                  type="submit"
                  className="bg-blue-900 text-white px-4 py-2 rounded mt-4 hover:bg-blue-800 transition"
                >
                  Assign
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-4 hover:bg-gray-600 transition"
                  onClick={() => setIsAssigning(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </Layout>
  );
};

export default Parents;
