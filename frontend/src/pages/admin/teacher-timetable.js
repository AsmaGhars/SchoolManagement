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

const TeacherTimetable = () => {
  const router = useRouter();
  const [timetable, setTimetable] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    teacher: "",
    course: "",
    day: "",
    startTime: "",
    endTime: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        await fetchTeachers();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchTeachers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(
        "http://localhost:5000/api/teachers/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTeachers(data);
    } catch (error) {
      console.error("Failed to fetch teachers:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTimetable = useCallback(async (teacherId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(
        `http://localhost:5000/api/timetables/get-teacher/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTimetable(data.timetable || []);
    } catch (error) {
      console.error("Failed to fetch timetable:", error.message);
    }
  }, []);
  
  const createTimetable = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/timetables/create-all-teachers",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (selectedTeacher) {
        fetchTimetable(selectedTeacher);
      }
    } catch (error) {
      console.error("Failed to create all timetables:", error.message);
    }
  };

  const deleteTimetable = async (teacherId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/timetables/delete-teacher/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTimetable([]);
    } catch (error) {
      console.error("Failed to delete timetable:", error.response ? error.response.data : error.message);
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

  const handleTeacherSelection = (teacherId) => {
    setSelectedTeacher(teacherId);
    fetchTimetable(teacherId);
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
      const courses = entry.courses || [];

      courses.forEach((course) => {
        const timeSlot = `${course.startTime}-${course.endTime}`;
        if (timetableGrid[day] && timetableGrid[day][timeSlot] !== undefined) {
          timetableGrid[day][timeSlot] = {
            subject: course.subName,
            course: course.className, 
            classroom: course.name,
          };
        }
      });
    });
  
    return timetableGrid;
  };
  
  const timetableGrid = transformTimetable();

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-gray-800 my-6 text-center">
          Teacher Timetable
        </h1>

        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading...</p>
        ) : (
          <div>
            <div className="mb-4">
              {teachers.length > 0 && (
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher._id}
                      className="flex items-center space-x-4 bg-gray-100 p-4 rounded-lg shadow-md"
                    >
                      <span className="text-lg font-semibold">{teacher.name}</span>
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300"
                        onClick={() => handleTeacherSelection(teacher._id)}
                      >
                        View Timetable
                      </button>
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300"
                        onClick={() => deleteTimetable(teacher._id)}
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

            {selectedTeacher && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Timetable for Teacher</h2>
                {Object.keys(timetableGrid).length === 0 || !Object.values(timetableGrid).some(day => Object.values(day).some(slot => slot !== null)) ? (
                  <p className="text-gray-600 text-center">No timetable entries found for this teacher.</p>
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
                      <tbody>
                        {days.map((day) => (
                          <tr key={day}>
                            <td className="py-3 px-6 text-gray-900 font-medium">{day}</td>
                            {timeSlots.map((slot) => (
                              <td
                                key={slot}
                                className="py-3 px-6 text-gray-700"
                              >
                                {timetableGrid[day][slot] ? (
                                  <div>
                                    <p><strong>Subject:</strong> {timetableGrid[day][slot].subject}</p>
                                    <p><strong>Course:</strong> {timetableGrid[day][slot].course}</p>
                                    <p><strong>Classroom:</strong> {timetableGrid[day][slot].classroom}</p>
                                  </div>
                                ) : (
                                  <p>No Entry</p>
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
          message="Are you sure you want to delete this timetable?"
        />
      </div>
    </Layout>
  );
};

export default TeacherTimetable;
