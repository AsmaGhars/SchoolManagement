import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Courses = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    classId: "",
    subjectId: "",
    classroomId: "",
    day: "",
    startTime: "",
    endTime: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(null);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchCourses();
        fetchSubjects();
        fetchClasses();
        fetchClassrooms();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/courses/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/classes/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setClasses(response.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

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
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setIsEditing(true);
  };

  const handleDelete = (course) => {
    setDeletingCourse(course);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/courses/delete/${deletingCourse._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(courses.filter((course) => course._id !== deletingCourse._id));
    } catch (error) {
      console.error("Failed to delete course:", error);
    } finally {
      setIsModalVisible(false);
      setDeletingCourse(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingCourse(null);
  };

  const handleAddCourse = () => {
    setIsAdding(true);
    fetchCourses();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isEditing && editingCourse) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5000/api/courses/update/${editingCourse._id}`,
          editingCourse,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setCourses(courses.map((course) =>
          course._id === editingCourse._id ? editingCourse : course
        ));
        setIsEditing(false);
        setEditingCourse(null);
      } catch (error) {
        console.error("Failed to update course:", error);
      }
    } else if (isAdding) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/api/courses/create",
          newCourse,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setCourses([...courses, response.data]);
        fetchCourses();
        setIsAdding(false);
        setNewCourse({
          classId: "",
          subjectId: "",
          classroomId: "",
          day: "",
          startTime: "",
          endTime: "",
        });
      } catch (error) {
        console.error("Failed to add course:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingCourse({
        ...editingCourse,
        [name]: value,
      });
    } else if (isAdding) {
      setNewCourse({
        ...newCourse,
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
        <h2 className="text-3xl font-semibold mb-8 text-blue-800">Course List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          <ul>
            {courses.map((course) => (
              <li
                key={course._id}
                className="mb-4 p-4 border border-gray-200 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-gray-500">Subject: {course.subjectId}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(course)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course)}
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
          onClick={handleAddCourse}
          className="mt-8 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
        >
          Add Course
        </button>

        {(isEditing || isAdding) && (
          <form onSubmit={handleFormSubmit} className="mt-8">
            <div className="mb-4">
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                Class
              </label>
              <select
                id="classId"
                name="classId"
                value={isEditing ? editingCourse.classId || "" : newCourse.classId || ""}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <select
                id="subjectId"
                name="subjectId"
                value={isEditing ? editingCourse.subjectId || "" : newCourse.subjectId || ""}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.subName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="classroomId" className="block text-sm font-medium text-gray-700">
                Classroom
              </label>
              <select
                id="classroomId"
                name="classroomId"
                value={isEditing ? editingCourse.classroomId || "" : newCourse.classroomId || ""}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select Classroom</option>
                {classrooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                Day
              </label>
              <select
                id="day"
                name="day"
                value={isEditing ? editingCourse.day || "" : newCourse.day || ""}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={isEditing ? editingCourse.startTime || "" : newCourse.startTime || ""}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={isEditing ? editingCourse.endTime || "" : newCourse.endTime || ""}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
              >
                {isEditing ? "Save Changes" : "Add Course"}
              </button>
            </div>
          </form>
        )}
      </div>

      {isModalVisible && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete ${deletingCourse.name}?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </Layout>
  );
};

export default Courses;
