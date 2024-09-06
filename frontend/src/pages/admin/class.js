import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Classes = () => {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [newClass, setNewClass] = useState({ className: "" });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingClass, setDeletingClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [isSubjectModalVisible, setIsSubjectModalVisible] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchClasses();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchClassById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/classes/details/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSelectedClass(response.data);
    } catch (error) {
      console.error("Failed to fetch class:", error);
    }
  };

  const handleEdit = (classData) => {
    setEditingClass(classData);
    setIsEditing(true);
  };

  const handleDelete = (classData) => {
    setDeletingClass(classData);
    setIsModalVisible(true);
  };

  const handleTeacherChange = (e) => {
    setSelectedTeacher(e.target.value);
  };

  useEffect(() => {
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

    fetchSubjects();
  }, []);

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/classes/delete/${deletingClass._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClasses(
        classes.filter((classData) => classData._id !== deletingClass._id)
      );
    } catch (error) {
      console.error("Failed to delete class:", error);
    } finally {
      setIsModalVisible(false);
      setDeletingClass(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingClass(null);
  };

  const handleAddClass = () => {
    setIsAdding(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isEditing && editingClass) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5000/api/classes/update/${editingClass._id}`,
          editingClass,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setClasses(
          classes.map((classData) =>
            classData._id === editingClass._id ? editingClass : classData
          )
        );
        setIsEditing(false);
        setEditingClass(null);
      } catch (error) {
        console.error("Failed to update class:", error);
      }
    } else if (isAdding) {
      if (newClass.className.trim() === "") {
        alert("Class name cannot be empty!");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/api/classes/create",
          newClass,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setClasses([...classes, response.data]);
        fetchClasses();
        setIsAdding(false);
        setNewClass({ className: "" });
      } catch (error) {
        console.error("Failed to add class:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingClass({
        ...editingClass,
        [name]: value,
      });
    } else if (isAdding) {
      setNewClass({
        ...newClass,
        [name]: value,
      });
    }
  };

  const handleAddSubjectClick = async () => {
    setIsSubjectModalVisible(true);
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

      const subjectsWithTeachers = await Promise.all(
        response.data.map(async (subject) => {
          const teacherResponse = await axios.get(
            `http://localhost:5000/api/teachers/by-subject`,
            {
              headers: {
                params: { subjectId: subject._id },
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (teacherResponse.data.length > 0) {
            return subject;
          }
          return null;
        })
      );

      setSubjects(subjectsWithTeachers.filter((subject) => subject !== null));
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const handleSubjectFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || !selectedTeacher) {
      alert("Please select a subject and a teacher.");
      return;
    }

    const isSubjectAssigned = selectedClass.subjects.some(
      (subject) => subject.subjectId._id === selectedSubject
    );

    if (isSubjectAssigned) {
      alert("This subject is already assigned to this class.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/classes/addsubject/${selectedClass._id}`,
        { subjectId: selectedSubject, teacherId: selectedTeacher },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedClass = await fetchClassById(selectedClass._id);
      setIsSubjectModalVisible(false);
      setSelectedSubject("");
      setSelectedTeacher("");

      setSubjects(
        subjects.filter(
          (subject) =>
            !updatedClass.subjects.some((s) => s.subjectId._id === subject._id)
        )
      );
      setTeachers(
        teachers.filter(
          (teacher) =>
            !updatedClass.subjects.some((s) => s.teacherId._id === teacher._id)
        )
      );

      alert("Subject added successfully!");
    } catch (error) {
      console.error("Failed to add subject:", error);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!selectedClass) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/classes/deletesubject/${selectedClass._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { subjectId },
        }
      );
      fetchClassById(selectedClass._id);
    } catch (error) {
      console.error("Failed to delete subject from class:", error);
    }
  };

  const handleChangeTeacher = async (subjectId, newTeacherId) => {
    if (!selectedClass || !newTeacherId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/classes/changeteacher/${selectedClass._id}`,
        { subjectId, newTeacherId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchClassById(selectedClass._id);
    } catch (error) {
      console.error("Failed to change teacher for subject:", error);
    }
  };

  const handleTransferStudent = async (studentId, newClassId) => {
    if (!selectedClass) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/classes/transfer-student/${selectedClass._id}`,
        { studentId, newClassId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchClassById(selectedClass._id);
    } catch (error) {
      console.error("Failed to transfer student:", error);
    }
  };

  const fetchTeachersBySubject = async (subject) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/teachers/by-subject`,
        {
          params: { subject },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTeachers(response.data);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    setSelectedTeacher("");
    fetchTeachersBySubject(subjectId);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 h-[calc(100vh-120px)] scroll-hidden overflow-y-auto">
        {selectedClass ? (
          <div className="mt-8 bg-gray-100 p-8 rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold text-blue-700 mb-6">
              Class Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border p-6 rounded-lg shadow-lg bg-white">
                <h4 className="text-2xl font-semibold text-gray-800 mb-4">
                  Students List
                </h4>
                <p className="font-medium text-gray-600 mb-2">
                  <span className="font-bold">Number of Students:</span>{" "}
                  {selectedClass.students.length}
                </p>
                <ul className="space-y-2">
                  {selectedClass.students.map((student, index) => (
                    <li
                      key={index}
                      className="py-2 border-b border-gray-200 text-gray-700 font-medium"
                    >
                      {student.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border p-6 rounded-lg shadow-lg bg-white">
                <h4 className="text-2xl font-semibold text-gray-800 mb-4">
                  Subjects
                </h4>
                <ul className="space-y-4">
                  {selectedClass.subjects.map((subject, index) => (
                    <li
                      key={index}
                      className="py-4 px-2 border-b border-gray-200"
                    >
                      <p className="text-lg font-bold text-gray-800">
                        Subject Name:{" "}
                        <span className="font-medium text-gray-600">
                          {subject.subjectId.subName}
                        </span>
                        <button
                          onClick={() =>
                            handleDeleteSubject(subject.subjectId._id)
                          }
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        Teacher Name:{" "}
                        <span className="font-medium text-gray-600">
                          {subject.teacherId.name}
                        </span>
                      </p>
                    </li>
                  ))}
                  <button
                    onClick={handleAddSubjectClick}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Subject
                  </button>
                </ul>

                <Modal
                  isVisible={isSubjectModalVisible}
                  onClose={() => setIsSubjectModalVisible(false)}
                  title="Add Subject"
                >
                  <form onSubmit={handleSubjectFormSubmit}>
                    <div className="mb-4">
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Select Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={selectedSubject}
                        onChange={handleSubjectChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="" disabled>
                          Choose a subject
                        </option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.subName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="teacher"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Select Teacher
                      </label>
                      <select
                        id="teacher"
                        name="teacher"
                        value={selectedTeacher}
                        onChange={handleTeacherChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="" disabled>
                          Choose a teacher
                        </option>
                        {teachers
                          .filter((teacher) =>
                            teacher.teachSubject === (selectedSubject)
                          )
                          .map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Subject
                      </button>
                    </div>
                  </form>
                </Modal>
              </div>
            </div>
            <button
              onClick={() => setSelectedClass(null)}
              className="mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Hide Details
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold mb-8 text-blue-800">
              Classes List
            </h2>
            {loading ? (
              <p>Loading...</p>
            ) : classes.length === 0 ? (
              <p>No classes available.</p>
            ) : (
              <ul>
                {classes.map((classData) => (
                  <li
                    key={classData._id}
                    className="mb-4 p-4 border border-gray-200 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-xl font-semibold">
                        {classData.className}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchClassById(classData._id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(classData)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(classData)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
              className="mt-8 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add New Class
            </button>
          </>
        )}
      </div>

      {isEditing || isAdding ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h3 className="text-2xl font-bold mb-4">
              {isEditing ? "Edit Class" : "Add New Class"}
            </h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="className"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Class Name
                </label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  value={
                    isEditing ? editingClass.className : newClass.className
                  }
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {isEditing ? "Update Class" : "Add Class"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsAdding(false);
                    setEditingClass(null);
                    setNewClass({ className: "" });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <Modal
        isVisible={isModalVisible}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        message={`Are you sure you want to delete class ${deletingClass?.className}?`}
      />
    </Layout>
  );
};

export default Classes;