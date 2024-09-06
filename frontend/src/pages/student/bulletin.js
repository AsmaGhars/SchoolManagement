import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Student/Navbar";
import Layout from "@/components/Student/Layout";

const Bulletin = () => {
  const router = useRouter();
  const [bulletin, setBulletin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trimester, setTrimester] = useState("");
  const [studentId, setStudentId] = useState("");
  const [downloadStatus, setDownloadStatus] = useState(""); 

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setStudentId(decodedToken._id);
      } else {
        router.push("/login");
      }
    };

    checkAuthentication();
  }, [router]);

  const fetchBulletin = useCallback(async () => {
    if (!studentId || !trimester) {
      console.error("Student ID or trimester not set");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get("http://localhost:5000/api/bulletins/details", {
        params: { studentId, trimester },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setBulletin(data.bulletin);
    } catch (error) {
      console.error("Failed to fetch bulletin:", error.message);
      setBulletin(null); 
    } finally {
      setLoading(false);
    }
  }, [studentId, trimester]);

  useEffect(() => {
    if (isAuthenticated && trimester) {
      fetchBulletin();
    }
  }, [isAuthenticated, trimester, fetchBulletin]);

  const handleTrimesterChange = (event) => {
    setTrimester(event.target.value);
  };

  const handleDownload = async () => {
    if (!studentId || !trimester) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/bulletins/download", {
        params: { studentId, trimester },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: 'blob',
      });
      
  
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `bulletin_${trimester}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
  
        setDownloadStatus("Bulletin successfully downloaded!");
      } else {
        setDownloadStatus("Failed to download bulletin.");
      }
    } catch (error) {
      console.error("Failed to download bulletin:", error.response ? error.response.data : error.message);
      setDownloadStatus("Failed to download bulletin.");
    }
  };
  
  
  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Student Bulletin</h1>

        <div className="mb-4">
          <label htmlFor="trimester" className="block text-lg font-medium mb-2">
            Select Trimester
          </label>
          <select
            id="trimester"
            value={trimester}
            onChange={handleTrimesterChange}
            className="border px-4 py-2"
          >
            <option value="">Select Trimester</option>
            <option value="Trimester1">Trimester 1</option>
            <option value="Trimester2">Trimester 2</option>
            <option value="Trimester3">Trimester 3</option>
          </select>
        </div>

        {loading ? (
          <p>Loading bulletin...</p>
        ) : bulletin ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Bulletin for {trimester}</h2>
            <table className="w-full border border-gray-200">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Subject</th>
                  <th className="border px-4 py-2">Control Grade</th>
                  <th className="border px-4 py-2">Synthesis Grade</th>
                  <th className="border px-4 py-2">Coefficient</th>
                </tr>
              </thead>
              <tbody>
                {bulletin.subjects.map((subject) => (
                  <tr key={subject._id}>
                    <td className="border px-4 py-2">{subject.subjectId.subName}</td>
                    <td className="border px-4 py-2">{subject.controleGrade}</td>
                    <td className="border px-4 py-2">{subject.syntheseGrade}</td>
                    <td className="border px-4 py-2">{subject.coefficient}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4">Overall Average: {bulletin.average || 'N/A'}</p>
            <button
              onClick={handleDownload}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Download Bulletin
            </button>
            {downloadStatus && (
              <p className="mt-4 text-orange-500">{downloadStatus}</p>
            )}
          </div>
        ) : (
          <p>No bulletin available for the selected trimester</p>
        )}
      </div>
    </Layout>
  );
};

export default Bulletin;
