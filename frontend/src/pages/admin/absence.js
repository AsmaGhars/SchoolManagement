import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import { format, parseISO, isToday } from 'date-fns';

const Absences = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [absences, setAbsences] = useState([]);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchStudents();
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/students/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsences = async (studentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/absences/details/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAbsences(response.data);
    } catch (error) {
      console.error("Failed to fetch absences:", error);
      setAbsences([]);
    }
  };

  const handleShowAbsences = (studentId) => {
    setSelectedStudent(studentId);
    fetchAbsences(studentId);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateString = format(date, 'yyyy-MM-dd');
      const todayString = format(new Date(), 'yyyy-MM-dd');
  
      if (dateString === todayString) {
        return "bg-gray-500 text-white";
      }
  
      const dayStatus = absences.find((absence) => {
        const absenceDateString = format(parseISO(absence.date), 'yyyy-MM-dd');
        return absenceDateString === dateString;
      });
  
      if (dayStatus) {
        switch (dayStatus.status) {
          case "Absent":
            return "bg-red-500 text-white";  
          case "Present":
            return "bg-green-500 text-white"; 
          case "Late":
            return "bg-yellow-500 text-white"; 
          default:
            return "";
        }
      }
    }
    return "";
  };
  
  

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 h-[calc(100vh-120px)] overflow-auto">
        <h2 className="text-3xl font-semibold mb-8 text-blue-800">
          Students List
        </h2>
        {loading ? (
          <p>Loading...</p>
        ) : students.length === 0 ? (
          <p>No students available.</p>
        ) : (
          <ul>
            {students.map((student) => (
              <li
                key={student._id}
                className="mb-4 p-4 border border-gray-200 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {student.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleShowAbsences(student._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Absences
                </button>
              </li>
            ))}
          </ul>
        )}
        {selectedStudent && (
          <div className="mt-8 bg-gray-100 p-8 rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold text-blue-700 mb-6">
              Absences for{" "}
              {students.find((s) => s._id === selectedStudent).name}
            </h3>
            <Calendar tileClassName={tileClassName} className="w-full h-auto" />
            {absences.length === 0 && (
              <p className="text-gray-700 font-medium mt-4">
                No absences for this student.
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Absences;
