import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Student/Navbar";
import Layout from "@/components/Student/Layout";

const AttendanceReports = () => {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchReports = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(`http://localhost:5000/api/attendancereports/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports:", error.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated, fetchReports]);

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Attendance Reports</h1>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <table className="w-full border border-gray-200">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Report Date</th>
                  <th className="border px-4 py-2">Total Absences</th>
                  <th className="border px-4 py-2">Total Presences</th>
                  <th className="border px-4 py-2">Total Late</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td className="border px-4 py-2">{new Date(report.reportDate).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">{report.totalAbsences}</td>
                    <td className="border px-4 py-2">{report.totalPresences}</td>
                    <td className="border px-4 py-2">{report.totalLate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No reports available</p>
        )}
      </div>
    </Layout>
  );
};

export default AttendanceReports;
