import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Inscriptions = () => {
  const router = useRouter();
  const [inscriptions, setInscriptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newInscription, setNewInscription] = useState({
    student: "",
    class: "",
    academicYear: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingInscription, setDeletingInscription] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        await fetchInscriptions();
        await fetchStudents();
        await fetchClasses();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchInscriptions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(
        "http://localhost:5000/api/inscriptions/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setInscriptions(data);
    } catch (error) {
      console.error("Failed to fetch inscriptions:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
    } catch (error) {
      console.error("Failed to fetch students:", error.message);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(
        "http://localhost:5000/api/classes/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error.message);
    }
  }, []);

  const handleDelete = (inscription) => {
    setDeletingInscription(inscription);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/inscriptions/remove/${deletingInscription._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInscriptions((prevInscriptions) =>
        prevInscriptions.filter(
          (inscription) => inscription._id !== deletingInscription._id
        )
      );
    } catch (error) {
      console.error("Failed to delete inscription:", error);
    } finally {
      setIsModalVisible(false);
      setDeletingInscription(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingInscription(null);
  };

  const handleAddInscription = () => {
    setIsAdding(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(newInscription).some((field) => field.trim() === "")) {
      alert("All fields are required!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/inscriptions/create",
        newInscription,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setInscriptions((prevInscriptions) => [...prevInscriptions, data]);
      setIsAdding(false);
      fetchInscriptions();
      setNewInscription({
        student: "",
        class: "",
        academicYear: "",
      });
    } catch (error) {
      console.error("Failed to create inscription:", error);
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-6 ">
        <h1 className="text-4xl font-extrabold text-gray-800 my-6 text-center">
          Inscriptions
        </h1>

        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading...</p>
        ) : (
          <div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition duration-300 mb-4"
              onClick={handleAddInscription}
            >
              Add Inscription
            </button>
            {inscriptions.length === 0 ? (
              <p className="text-gray-600 text-center">
                No inscriptions found.
              </p>
            ) : (
              <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Year
                    </th>
                    <th className="py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inscriptions.map((inscription) => (
                    <tr key={inscription._id} className="border-b">
                      <td className="py-3 px-6">{inscription.student.name}</td>
                      <td className="py-3 px-6">{inscription.class.className}</td>
                      <td className="py-3 px-6">{inscription.academicYear}</td>
                      <td className="py-3 px-6">
                        <button
                          className="text-red-600 hover:text-red-800 font-semibold"
                          onClick={() => handleDelete(inscription)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {isAdding && (
          <form
            onSubmit={handleFormSubmit}
            className="my-6 bg-gray-50 p-4 rounded-lg shadow-md"
          >
            <div className="form-group mb-4">
              <label
                htmlFor="student"
                className="block text-gray-700 font-semibold mb-2"
              >
                Student
              </label>
              <select
                id="student"
                value={newInscription.student}
                onChange={(e) =>
                  setNewInscription({
                    ...newInscription,
                    student: e.target.value,
                  })
                }
                className="form-control block w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group mb-4">
              <label
                htmlFor="class"
                className="block text-gray-700 font-semibold mb-2"
              >
                Class
              </label>
              <select
                id="class"
                value={newInscription.class}
                onChange={(e) =>
                  setNewInscription({
                    ...newInscription,
                    class: e.target.value,
                  })
                }
                className="form-control block w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Class</option>
                {classes.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.className}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group mb-4">
              <label
                htmlFor="academicYear"
                className="block text-gray-700 font-semibold mb-2"
              >
                Academic Year
              </label>
              <input
                id="academicYear"
                type="text"
                value={newInscription.academicYear}
                onChange={(e) =>
                  setNewInscription({
                    ...newInscription,
                    academicYear: e.target.value,
                  })
                }
                className="form-control block w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="form-group">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 transition duration-300"
              >
                Save Inscription
              </button>
            </div>
          </form>
        )}

        {isModalVisible && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete inscription?</p>
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
      </div>
    </Layout>
  );
};

export default Inscriptions;
