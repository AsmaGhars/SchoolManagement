import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '@/components/Parent/Navbar';
import Layout from '@/components/Parent/Layout';
import "../../app/globals.css";

const BulletinPage = () => {
  const router = useRouter();
  const [bulletin, setBulletin] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null); 
  const [trimester, setTrimester] = useState(''); 

  useEffect(() => {
    const fetchBulletin = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/bulletins/details?studentId=${studentId}&trimester=${trimester}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBulletin(response.data.bulletin);
      } catch (error) {
        console.error('Error fetching bulletin:', error);
        setError('Failed to fetch bulletin.');
      } finally {
        setLoading(false);
      }
    };

    fetchBulletin();
  }, [studentId, trimester, router]);

  const downloadBulletin = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/bulletins/download?studentId=${studentId}&trimester=${trimester}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob' 
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bulletin_${studentId}_${trimester}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading bulletin:', error);
      setError('Failed to download bulletin.');
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-20">
        <h2 className="text-3xl font-semibold mb-10">Student Bulletin</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : bulletin ? (
          <div>
            <h3 className="text-xl font-medium mb-4">
              Bulletin for Student: {bulletin.studentId.name}
            </h3>
            <p className="mb-4">
              <span className="font-semibold">Trimester:</span> {bulletin.trimester}
            </p>
            <p className="mb-4">
              <span className="font-semibold">School:</span> {bulletin.school.name}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Class:</span> {bulletin.className}
            </p>
            <div className="mb-4">
              <span className="font-semibold">Subjects:</span>
              <ul>
                {bulletin.subjects.map(subject => (
                  <li key={subject.subjectId._id}>
                    <strong>{subject.subjectId.subName}:</strong> 
                    Control Grade: {subject.controleGrade}, 
                    Synthesis Grade: {subject.syntheseGrade}, 
                    Coefficient: {subject.coefficient}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mb-4">
              <span className="font-semibold">Overall Average:</span> {bulletin.average}
            </p>
            <button
              onClick={downloadBulletin}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Download Bulletin as PDF
            </button>
          </div>
        ) : (
          <div>No bulletin available</div>
        )}
      </div>
    </Layout>
  );
};

export default BulletinPage;
