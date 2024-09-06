import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Student/Navbar";
import Layout from "@/components/Student/Layout";

const PerformanceReport = () => {
  const router = useRouter();
  const [report, setReport] = useState(null);
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

  const fetchReport = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(`http://localhost:5000/api/performancereports/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (Array.isArray(data) && data.length > 0) {
        setReport(data[0]);
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReport();
    }
  }, [isAuthenticated, fetchReport]);

  if (loading) {
    return <p>Loading report...</p>;
  }

  if (!report) {
    return <p>No report available</p>;
  }

  const normalizeTrimesterName = (name) => name.trim().toLowerCase().replace(/\s+/g, ' ').replace(/^(trimester\s*\d+)/i, 'Trimester $1');

  const normalizedTrimesters = report.trimesters.map(trimester => ({
    ...trimester,
    trimester: normalizeTrimesterName(trimester.trimester),
  }));

  const uniqueTrimesters = Array.from(new Set(normalizedTrimesters.map(trimester => trimester.trimester)))
    .map(trimesterName => ({
      trimester: trimesterName,
      average: normalizedTrimesters.find(trimester => trimester.trimester === trimesterName).average
    }));

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Performance Report</h1>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Overall Performance</h2>
          <p><strong>Final Average:</strong> {report.finalAverage ? report.finalAverage.toFixed(2) : 'N/A'}</p>
          <p><strong>Passed Subjects:</strong> {report.passedSubjects !== undefined ? report.passedSubjects : 'N/A'}</p>
          <p><strong>Failed Subjects:</strong> {report.failedSubjects !== undefined ? report.failedSubjects : 'N/A'}</p>
          <p><strong>Total Subjects:</strong> {report.totalSubjects !== undefined ? report.totalSubjects : 'N/A'}</p>
          <p><strong>Report Generated At:</strong> {new Date(report.generatedAt).toLocaleDateString() || 'N/A'}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Trimester Averages</h2>
          {uniqueTrimesters.length > 0 ? (
            <table className="w-full border border-gray-200">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Trimester</th>
                  <th className="border px-4 py-2">Average</th>
                </tr>
              </thead>
              <tbody>
                {uniqueTrimesters.map((trimester) => (
                  <tr key={trimester.trimester}>
                    <td className="border px-4 py-2">{trimester.trimester}</td>
                    <td className="border px-4 py-2">{trimester.average ? trimester.average.toFixed(2) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No trimesters available</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PerformanceReport;
