import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '@/components/Parent/Navbar';
import Layout from '@/components/Parent/Layout';
import "../../app/globals.css";

const ParentAttendanceReport = () => {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/parents/children`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setChildren(response.data);
      } catch (error) {
        console.error('Error fetching children:', error);
      }
    };

    fetchChildren();
  }, [router]);

  const fetchReport = async (studentId) => {
    console.log('Fetching report for student ID:', studentId);
    
    try {
      setLoading(true);
      setError(null);
      setSelectedStudentId(studentId);
  
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/attendancereports/details/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log('Report data:', response.data);
  
      if (response.data.length === 0) {
        setError('No report available for this student.');
        setReport(null);
      } else {
        setReport(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Failed to fetch attendance report.');
      } else {
        setError('An error occurred while fetching the report.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const getStudentNameById = (id) => {
    const student = children.find(child => child._id === id);
    return student ? student.name : 'Unknown Student';
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-20">
        <h2 className="text-3xl font-semibold mb-10">Attendance Reports</h2>

        <div className="mb-10">
          <h3 className="text-xl font-medium mb-4">Your Children</h3>
          {children.length === 0 ? (
            <p>No children found.</p>
          ) : (
            <ul>
              {children.map((child) => (
                <li key={child._id} className="mb-4 flex items-center">
                  <span className="mr-4">{child.name}</span>
                  <button
                    onClick={() => fetchReport(child._id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    View Report
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {report ? (
          <div>
            <h3 className="text-xl font-medium mb-4">
              Report for Student: {getStudentNameById(report.studentId)}
            </h3>
            <p className="mb-4">
              <span className="font-semibold">Total Absences:</span> {report.totalAbsences !== undefined ? report.totalAbsences : 'N/A'}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Total Presences:</span> {report.totalPresences !== undefined ? report.totalPresences : 'N/A'}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Total Late:</span> {report.totalLate !== undefined ? report.totalLate : 'N/A'}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Report Date:</span> {formatDate(report.reportDate)}
            </p>
          </div>
        ) : (
          <div> </div>
        )}
      </div>
    </Layout>
  );
};

export default ParentAttendanceReport;
