import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const StudentList = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);

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
    } catch (error) {
      console.error("Failed to fetch students:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeStudent = async (studentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/students/delete/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents((prevStudents) =>
        prevStudents.filter((student) => student._id !== studentId)
      );
    } catch (error) {
      console.error("Failed to remove student:", error.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await removeStudent(deletingStudent._id);
    } catch (error) {
      console.error("Failed to delete student entry:", error);
    } finally {
      setIsModalVisible(false);
      setDeletingStudent(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingStudent(null);
  };

  const handleDownload = async (studentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/bulletins/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "blob", 
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `student_${studentId}_bulletin.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download bulletin:", error.message);
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-gray-800 my-6 text-center">
          Student List
        </h1>

        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading...</p>
        ) : (
          <div>
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td className="py-3 px-6 font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="py-3 px-6 text-gray-700">
                          {student.email}
                        </td>
                        <td className="py-3 px-6 flex space-x-2">
                          <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                            onClick={() => handleDownload(student._id)}
                          >
                            Download
                          </button>
                          <button
                            className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300"
                            onClick={() => {
                              setDeletingStudent(student);
                              setIsModalVisible(true);
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center">No students available.</p>
            )}
          </div>
        )}

        {isModalVisible && (
          <Modal
            title="Confirm Removal"
            message="Are you sure you want to remove this bulletin?"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    </Layout>
  );
};

export default StudentList;
