import { useState, useEffect } from "react";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Teacher/Navbar";
import Layout from "@/components/Teacher/Layout";
import { useRouter } from "next/router";


const GradePage = () => {
    const router = useRouter();

  const [classes, setClasses] = useState([]); 
  const [selectedClass, setSelectedClass] = useState("");
  const [trimesters, setTrimesters] = useState(["Trimester1", "Trimester2", "Trimester3"]);
  const [selectedTrimester, setSelectedTrimester] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) throw new Error("No authentication token found");

        const { data } = await axios.get("http://localhost:5000/api/classes/list-teacher", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        setClasses(data || []); 
      } catch (error) {
        console.error("Failed to fetch classes:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedTrimester) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No authentication token found");

          const { data } = await axios.get(`http://localhost:5000/api/classes/listclassstudents/${selectedClass}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log(data);
          
          setStudents(data || []); 
        } catch (error) {
          console.error("Failed to fetch students:", error.message);
        }
      };
      fetchStudents();
    }
  }, [selectedClass, selectedTrimester]);

  const handleGradeChange = (studentId, gradeType, value) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [studentId]: {
        ...prevGrades[studentId],
        [gradeType]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
  
      const payload = {
        classId: selectedClass,
        trimester: selectedTrimester,
        grades: Object.keys(grades).map((studentId) => ({
          studentId,
          controleGrade: grades[studentId]?.control || 0,
          syntheseGrade: grades[studentId]?.synthesis || 0,
        })),
      };
  
      console.log("Payload before sending:", payload);
  
      await axios.post("http://localhost:5000/api/grades/save", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert("Grades submitted successfully!");
      setTimeout(() => {
        router.push("/student/account"); 
      }, 220); 
    } catch (error) {
      console.error("Failed to submit grades:", error.message);
    }
  };
  

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Enter Grades</h1>

        <div className="mb-4">
          <label htmlFor="class-select" className="block font-semibold mb-2">Select Class</label>
          <select
            id="class-select"
            className="w-full p-2 border border-gray-300 rounded"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select Class --</option>
            {classes.length > 0 ? (
              classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.className} 
                </option>
              ))
            ) : (
              <option value="" disabled>No classes available</option>
            )}
          </select>
        </div>

        {selectedClass && (
          <div className="mb-4">
            <label htmlFor="trimester-select" className="block font-semibold mb-2">Select Trimester</label>
            <select
              id="trimester-select"
              className="w-full p-2 border border-gray-300 rounded"
              value={selectedTrimester}
              onChange={(e) => setSelectedTrimester(e.target.value)}
            >
              <option value="">-- Select Trimester --</option>
              {trimesters.map((trimester) => (
                <option key={trimester} value={trimester}>
                  {trimester}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedClass && selectedTrimester && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-4">Students List</h2>
            {students.length > 0 ? (
              <table className="w-full border border-gray-300">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Student</th>
                    <th className="border px-4 py-2">Control Grade</th>
                    <th className="border px-4 py-2">Synthesis Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="border px-4 py-2">{student.name}</td>
                      <td className="border px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={grades[student._id]?.control || ""}
                          onChange={(e) =>
                            handleGradeChange(student._id, "control", e.target.value)
                          }
                          className="p-2 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="border px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={grades[student._id]?.synthesis || ""}
                          onChange={(e) =>
                            handleGradeChange(student._id, "synthesis", e.target.value)
                          }
                          className="p-2 border border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No students found for this class.</p>
            )}
          </div>
        )}

        {selectedClass && selectedTrimester && students.length > 0 && (
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={handleSubmit}
          >
            Submit Grades
          </button>
        )}
      </div>
    </Layout>
  );
};

export default GradePage;
