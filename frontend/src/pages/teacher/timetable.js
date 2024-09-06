import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Teacher/Navbar";
import Layout from "@/components/Teacher/Layout";

const TeacherTimetable = () => {
  const router = useRouter();
  const [timetable, setTimetable] = useState(null);
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

  const fetchTimetable = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(`http://localhost:5000/api/timetables/get-teacher`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setTimetable(data.timetables);
    } catch (error) {
      console.error("Failed to fetch timetable:", error.message);
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTimetable();
    }
  }, [isAuthenticated, fetchTimetable]);

  const formatTimetable = (timetable) => {
    const formatted = {};

    timetable.forEach((course) => {
      const { day, startTime, endTime, subject, classroom, className } = course;
      if (!formatted[day]) formatted[day] = {};

      const timeSlot = `${startTime}-${endTime}`;
      formatted[day][timeSlot] = { subject, classroom, className };
    });

    return formatted;
  };

  const formattedTimetable = timetable ? formatTimetable(timetable) : {};

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Teacher Timetable</h1>

        {loading ? (
          <p>Loading timetable...</p>
        ) : Object.keys(formattedTimetable).length > 0 ? (
          <div>
            <table className="w-full border border-gray-200">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Day</th>
                  <th className="border px-4 py-2">08:00-10:00</th>
                  <th className="border px-4 py-2">10:00-12:00</th>
                  <th className="border px-4 py-2">12:00-14:00</th>
                  <th className="border px-4 py-2">14:00-16:00</th>
                  <th className="border px-4 py-2">16:00-18:00</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(formattedTimetable).map((day) => (
                  <tr key={day}>
                    <td className="border px-4 py-2 font-semibold">{day}</td>
                    <td className="border px-4 py-2">
                      {formattedTimetable[day]["08:00-10:00"] ? (
                        <>
                          <strong>{formattedTimetable[day]["08:00-10:00"].className}</strong><br />
                          {formattedTimetable[day]["08:00-10:00"].subject}<br />
                          {formattedTimetable[day]["08:00-10:00"].classroom}
                        </>
                      ) : (
                        "No class"
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {formattedTimetable[day]["10:00-12:00"] ? (
                        <>
                          <strong>{formattedTimetable[day]["10:00-12:00"].className}</strong><br />
                          {formattedTimetable[day]["10:00-12:00"].subject}<br />
                          {formattedTimetable[day]["10:00-12:00"].classroom}
                        </>
                      ) : (
                        "No class"
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {formattedTimetable[day]["12:00-14:00"] ? (
                        <>
                          <strong>{formattedTimetable[day]["12:00-14:00"].className}</strong><br />
                          {formattedTimetable[day]["12:00-14:00"].subject}<br />
                          {formattedTimetable[day]["12:00-14:00"].classroom}
                        </>
                      ) : (
                        "No class"
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {formattedTimetable[day]["14:00-16:00"] ? (
                        <>
                          <strong>{formattedTimetable[day]["14:00-16:00"].className}</strong><br />
                          {formattedTimetable[day]["14:00-16:00"].subject}<br />
                          {formattedTimetable[day]["14:00-16:00"].classroom}
                        </>
                      ) : (
                        "No class"
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {formattedTimetable[day]["16:00-18:00"] ? (
                        <>
                          <strong>{formattedTimetable[day]["16:00-18:00"].className}</strong><br />
                          {formattedTimetable[day]["16:00-18:00"].subject}<br />
                          {formattedTimetable[day]["16:00-18:00"].classroom}
                        </>
                      ) : (
                        "No class"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No timetable available for the teacher</p>
        )}
      </div>
    </Layout>
  );
};

export default TeacherTimetable;
