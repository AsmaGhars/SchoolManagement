import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Reports = () => {
  const router = useRouter();
  const [reportType, setReportType] = useState("");
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [studentReport, setStudentReport] = useState(null);
  const [noReportMessage, setNoReportMessage] = useState("");

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

  const fetchReports = async () => {
    if (!reportType) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/${reportType}/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setReports(response.data);
    } catch (error) {
      console.error(`Failed to fetch ${reportType} reports:`, error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/${reportType}/generate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchReports();
    } catch (error) {
      console.error(`Failed to generate ${reportType} report:`, error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReports = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/${reportType}/delete`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setReports([]);
    } catch (error) {
      console.error(`Failed to delete ${reportType} reports:`, error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportClick = async (studentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/${reportType}/details/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const reportData = response.data;

      if (reportData && reportData.length > 0) {
        setStudentReport(reportData);
        setNoReportMessage("");
      } else {
        setNoReportMessage("No report available for this student.");
        setStudentReport(null);
      }
    } catch (error) {
      console.error(`Failed to fetch report for student ${studentId}:`, error);
      setNoReportMessage("Error fetching report data.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Reports</h1>
        <div className="mb-4 space-x-2">
          <button
            className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setReportType("attendancereports")}
          >
            Attendance Report
          </button>
          <button
            className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setReportType("performancereports")}
          >
            Performance Report
          </button>
          <button
            className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setReportType("financialreports")}
          >
            Financial Report
          </button>
        </div>
        {reportType && (
          <>
            <div className="mb-4 space-x-2">
              <button
                className="btn bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Reports"}
              </button>
              <button
                className="btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setIsModalVisible(true)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Reports"}
              </button>
            </div>
            {students.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Students List</h2>
                <ul className="list-disc pl-5">
                  {students.map((student) => (
                    <li key={student._id} className="mb-2 flex items-center">
                      {student.name}
                      <button
                        className="btn bg-teal-500 text-white ml-2 px-3 py-1 rounded hover:bg-teal-600"
                        onClick={() => handleReportClick(student._id)}
                      >
                        View Report
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {studentReport && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">
                  {`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}
                </h2>
                <div className="bg-gray-100 p-4 rounded">
                  <p>Total Absences: {studentReport.totalAbsences || 0}</p>
                  <p>Total Presences: {studentReport.totalPresences || 0}</p>
                  <p>Total Late: {studentReport.totalLate || 0}</p>
                  <p>Report Date: {studentReport.reportDate ? new Date(studentReport.reportDate).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            )}
            {noReportMessage && (
              <div className="bg-red-100 text-red-700 p-4 rounded">
                {noReportMessage}
              </div>
            )}
            {reports.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">
                  {`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Reports`}
                </h2>
                <ul className="list-disc pl-5">
                  {reports.map((report) => (
                    <li key={report._id} className="mb-2">
                      Report ID: {report._id}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      {isModalVisible && (
        <Modal
          title="Confirm Deletion"
          onConfirm={handleDeleteReports}
          onCancel={() => setIsModalVisible(false)}
        >
          Are you sure you want to delete these reports?
        </Modal>
      )}
    </Layout>
  );
};

export default Reports;
