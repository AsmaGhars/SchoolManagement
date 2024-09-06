import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Students = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    birthDate: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    sex: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [noStudentsMessage, setNoStudentsMessage] = useState(false);
  const [parentInfo, setParentInfo] = useState(null);
  const [isParentModalVisible, setIsParentModalVisible] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        await fetchStudents();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchStudents = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(
        "http://localhost:5000/api/students/list",
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
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParentInfo = async (studentId) => {
    console.log(`Fetching parent info for student ID: ${studentId}`);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/students/getparent/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Fetched parent info:", data);

      if (data && data.parent) {
        setParentInfo(data.parent);
      } else {
        console.error("Unexpected data format:", data);
      }

      setIsParentModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch parent info:", {
        message: error.message,
        response: error.response?.data,
        request: error.request,
      });
    }
  };

  const handleDelete = (student) => {
    setDeletingStudent(student);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/students/delete/${deletingStudent._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents((prevStudents) =>
        prevStudents.filter((student) => student._id !== deletingStudent._id)
      );
    } catch (error) {
      console.error("Failed to delete student:", error);
    } finally {
      setIsModalVisible(false);
      setDeletingStudent(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingStudent(null);
  };

  const handleAddStudent = () => {
    setIsAdding(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(newStudent).some((field) => field.trim() === "")) {
      alert("All fields are required!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/students/addstudent",
        newStudent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setStudents((prevStudents) => [...prevStudents, data.student]);
      setIsAdding(false);
      setNewStudent({
        name: "",
        birthDate: "",
        address: "",
        phone: "",
        email: "",
        password: "",
        sex: "",
      });
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prevStudent) => ({
      ...prevStudent,
      [name]: value,
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 h-[calc(100vh-120px)] scroll-hidden overflow-y-auto">
        <h2 className="text-3xl font-semibold text-blue-800 mb-10">
          Students List
        </h2>
        {loading ? (
          <p>Loading...</p>
        ) : noStudentsMessage ? (
          <p>No students available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student._id}
                className="bg-white border border-gray-200 rounded-lg shadow-lg p-6"
              >
                <h3 className="text-xl text-blue-900 font-semibold mb-2">
                  {student.name}
                </h3>
                <p className="mb-2">
                  <strong>
                    Email:
                    <br />
                  </strong>{" "}
                  {student.email}
                </p>
                <p className="mb-4">
                  <strong>
                    Sex:
                    <br />
                  </strong>{" "}
                  {student.sex}
                </p>
                <p className="mb-2">
                  <strong>
                    Address:
                    <br />
                  </strong>{" "}
                  {student.address}
                </p>
                <p className="mb-2">
                  <strong>
                    Phone:
                    <br />
                  </strong>{" "}
                  {student.phone}
                </p>
                <p className="mb-2">
                  <strong>
                    BirthDate:
                    <br />
                  </strong>{" "}
                  {student.birthDate}
                </p>

                <button
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => handleDelete(student)}
                >
                  Delete
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => fetchParentInfo(student._id)}
                >
                  Parent
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className="bg-blue-900 text-white px-4 py-2 rounded mt-8"
          onClick={handleAddStudent}
        >
          Add Student
        </button>
        <Modal
          isVisible={isModalVisible}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          message={`Are you sure you want to delete student ${deletingStudent?.name}?`}
        />
        {isAdding && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Add New Student</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">BirthDate</label>
                <input
                  type="date"
                  name="birthDate"
                  value={newStudent.birthDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={newStudent.address}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={newStudent.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={newStudent.password}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Sex</label>
                <select
                  name="sex"
                  value={newStudent.sex}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add Student
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded ml-4"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {isModalVisible && (
          <Modal
            title="Confirm Delete"
            onClose={() => setIsModalVisible(false)}
            onConfirm={confirmDelete}
          >
            <p>Are you sure you want to delete this student?</p>
          </Modal>
        )}

        {isParentModalVisible && parentInfo && (
          <Modal
            isVisible={isParentModalVisible}
            onClose={() => setIsParentModalVisible(false)}
          >
            <h2 className="text-2xl font-semibold mb-4">Parent Information</h2>
            <p>
              <strong>Name:</strong> {parentInfo.name}
            </p>
            <p>
              <strong>Email:</strong> {parentInfo.email}
            </p>
            <p>
              <strong>Phone:</strong> {parentInfo.phone}
            </p>
            <p>
              <strong>Address:</strong> {parentInfo.address}
            </p>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default Students;
