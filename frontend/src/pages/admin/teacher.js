import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Teachers = () => {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    password: "",
    teachSubject: "",
    sex: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [noTeachersMessage, setNoTeachersMessage] = useState(false);

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

  const fetchSubjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(
        "http://localhost:5000/api/subjects/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error.message);
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
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
      setNoTeachersMessage(false); 
      fetchSubjects();
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchSubjects]);

  const fetchTeachersBySubject = useCallback(async (subjectId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/teachers/by-subject?subject=${subjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTeachers(data);
      setNoTeachersMessage(data.length === 0); 
    } catch (error) {
      console.error("Failed to fetch teachers by subject:", error);
      setNoTeachersMessage(true); 
    }
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchTeachersBySubject(selectedSubject);
    } else {
      fetchTeachers();
    }
  }, [selectedSubject, fetchTeachersBySubject, fetchTeachers]);

  const handleDelete = (teacher) => {
    setDeletingTeacher(teacher);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/teachers/delete/${deletingTeacher._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher._id !== deletingTeacher._id));
    } catch (error) {
      console.error("Failed to delete teacher:", error);
    } finally {
      setIsModalVisible(false);
      setDeletingTeacher(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingTeacher(null);
  };

  const handleAddTeacher = () => {
    setIsAdding(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(newTeacher).some((field) => field.trim() === "")) {
      alert("All fields are required!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/teachers/addteacher",
        newTeacher,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      setTeachers((prevTeachers) => [...prevTeachers, data.teacher]);
      setIsAdding(false);
      setNewTeacher({
        name: "",
        email: "",
        password: "",
        teachSubject: "",
        sex: "",
      });
    } catch (error) {
      console.error("Failed to add teacher:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher((prevTeacher) => ({
      ...prevTeacher,
      [name]: value,
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 h-[calc(100vh-120px)] scroll-hidden overflow-auto">
        <h2 className="text-3xl font-semibold text-blue-800 mb-10">Teachers List</h2>
        <div className="mb-4">
          <label htmlFor="subject" className="block mb-2 text-lg font-semibold">Filter by Subject</label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="block p-2 border rounded bg-white"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.subName}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : noTeachersMessage ? (
          <p>No teacher for this subject.</p>
        ) : teachers.length === 0 ? (
          <p>No teachers available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div key={teacher._id} className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                <h3 className="text-xl text-blue-900 font-semibold mb-2">{teacher.name}</h3>
                <p className="mb-2"><strong>Email:<br/></strong> {teacher.email}</p>
                <p className="mb-4"><strong>Sex:<br/></strong> {teacher.sex}</p>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => handleDelete(teacher)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          className="bg-blue-900 text-white px-4 py-2 rounded mt-8"
          onClick={handleAddTeacher}
        >
          Add Teacher
        </button>
        <Modal
          isVisible={isModalVisible}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          message={`Are you sure you want to delete teacher ${deletingTeacher?.name}?`}
        />
        {isAdding && (
          <form onSubmit={handleFormSubmit} className="mt-8">
            <input
              type="text"
              name="name"
              value={newTeacher.name}
              onChange={handleInputChange}
              placeholder="Name"
              required
              className="block mb-4 p-2 border rounded"
            />
            <input
              type="email"
              name="email"
              value={newTeacher.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="block mb-4 p-2 border rounded"
            />
            <input
              type="password"
              name="password"
              value={newTeacher.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="block mb-4 p-2 border rounded"
            />
            <select
              name="teachSubject"
              value={newTeacher.teachSubject}
              onChange={handleInputChange}
              required
              className="block mb-4 p-2 border rounded"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.subName}
                </option>
              ))}
            </select>
            <select
              name="sex"
              value={newTeacher.sex}
              onChange={handleInputChange}
              required
              className="block mb-4 p-2 border rounded"
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button
              type="submit"
              className="bg-blue-900 text-white px-4 py-2 rounded"
            >
              Add Teacher
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="ml-4 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default Teachers;
