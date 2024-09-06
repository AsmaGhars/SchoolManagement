import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const timeSlots = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00"
]; 
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const StudentTimetable = () => {
  const router = useRouter();
  const [timetable, setTimetable] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    class: "",
    course: "",
    day: "",
    startTime: "",
    endTime: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [noTimetableMessage, setNoTimetableMessage] = useState("");

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        await fetchClasses();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

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
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTimetable = useCallback(async (classId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
  
      const { data } = await axios.get(
        `http://localhost:5000/api/timetables/get-class/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (data.timetable && data.timetable.length > 0) {
        setTimetable(data.timetable);
        setNoTimetableMessage(""); // Clear any previous message
      } else {
        setTimetable([]);
        setNoTimetableMessage("No timetable entries found for this class.");
      }
    } catch (error) {
      console.error("Failed to fetch timetable:", error.message);
    }
  }, []);
  
  const createTimetable = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/timetables/create-all-classes",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (selectedClass) {
        fetchTimetable(selectedClass);
      }
    } catch (error) {
      console.error("Failed to create all timetables:", error.message);
    }
  };

  const deleteTimetable = async (classId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/timetables/delete-class/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTimetable([]);
      setNoTimetableMessage("Timetable deleted successfully.");
    } catch (error) {
      console.error("Failed to delete timetable:", error.message);
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/timetables/${deletingEntry._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTimetable((prevTimetable) =>
        prevTimetable.filter((entry) => entry._id !== deletingEntry._id)
      );
      setNoTimetableMessage("Timetable entry deleted successfully.");
    } catch (error) {
      console.error("Failed to delete timetable entry:", error);
    } finally {
      setIsModalVisible(false);
      setDeletingEntry(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingEntry(null);
  };

  const handleClassSelection = (classId) => {
    setSelectedClass(classId);
    fetchTimetable(classId);
  };

  const transformTimetable = () => {
    const timetableGrid = days.reduce((acc, day) => {
      acc[day] = timeSlots.reduce((timeAcc, slot) => {
        timeAcc[slot] = null;
        return timeAcc;
      }, {});
      return acc;
    }, {});

    timetable.forEach((entry) => {
      const day = entry.day;
      const timeSlot = `${entry.startTime}-${entry.endTime}`;
      if (timetableGrid[day] && timetableGrid[day][timeSlot] !== undefined) {
        timetableGrid[day][timeSlot] = {
          subject: entry.subject,
          teacher: entry.teacher,
          classroom: entry.classroom,
        };
      }
    });

    return timetableGrid;
  };

  const timetableGrid = transformTimetable();

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-gray-800 my-6 text-center">
          Student Timetable
        </h1>

        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading...</p>
        ) : (
          <div>
            <div className="mb-4">
              {classes.length > 0 && (
                <div className="space-y-4">
                  {classes.map((classItem) => (
                    <div
                      key={classItem._id}
                      className="flex items-center space-x-4 bg-gray-100 p-4 rounded-lg shadow-md"
                    >
                      <span className="text-lg font-semibold">{classItem.className}</span>
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300"
                        onClick={() => handleClassSelection(classItem._id)}
                      >
                        View Timetable
                      </button>
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300"
                        onClick={() => deleteTimetable(classItem._id)}
                      >
                        Delete Timetable
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 mb-4"
              onClick={createTimetable}
            >
              Create Timetable
            </button>

            {selectedClass && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Timetable for Class</h2>
                {noTimetableMessage ? (
                  <p className="text-gray-600 text-center">{noTimetableMessage}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Day / Time
                          </th>
                          {timeSlots.map((slot) => (
                            <th
                              key={slot}
                              className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {slot}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {days.map((day) => (
                          <tr key={day}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">{day}</td>
                            {timeSlots.map((slot) => (
                              <td
                                key={slot}
                                className="py-4 px-6 text-sm text-gray-600"
                              >
                                {timetableGrid[day][slot] ? (
                                  <div>
                                    <p><strong>Subject:</strong> {timetableGrid[day][slot].subject}</p>
                                    <p><strong>Teacher:</strong> {timetableGrid[day][slot].teacher}</p>
                                    <p><strong>Classroom:</strong> {timetableGrid[day][slot].classroom}</p>
                                  </div>
                                ) : (
                                  "Free"
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <Modal
          isVisible={isModalVisible}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          message={`Are you sure you want to delete timetable?`}
        />
      </div>
    </Layout>
  );
};

export default StudentTimetable;
