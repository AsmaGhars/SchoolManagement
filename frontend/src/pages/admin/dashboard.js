import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Sidebar from "@/components/Admin/Sidebar";
import Layout from "@/components/Admin/Layout";
import Navbar from "@/components/Admin/Navbar";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../../app/globals.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/dashboards/get",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      router.push("/login");
    }
  }, [router]);

  const data = {
    labels: ["Success Rate"],
    datasets: [
      {
        data: [stats.successRate, 100 - stats.successRate],
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(201, 203, 207, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const data1 = {
    labels: ["Avg. Presence Rate"],
    datasets: [
      {
        data: [stats.averagePresenceRate, 100 - stats.averagePresenceRate],
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(201, 203, 207, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const data2 = {
    labels: ["Avg. Absences/Student"],
    datasets: [
      {
        data: [
          stats.averageAbsencesPerStudent,
          100 - stats.averageAbsencesPerStudent,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(201, 203, 207, 1)"],
        borderWidth: 1,
      },
    ],
  };
  
  const data3 = {
    labels: ["Avg. Tardies/Student"],
    datasets: [
      {
        data: [
          stats.averageTardiesPerStudent,
          100 - stats.averageTardiesPerStudent,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(201, 203, 207, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}%`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <Layout>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-0">
          <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-medium">Success Rate</h2>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
                <div className="h-64">
                  <Doughnut data={data} options={options} />
                </div>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-medium">Avg. Presence Rate</h2>
                <p className="text-2xl font-bold">
                  {stats.averagePresenceRate}%
                </p>
                <div className="h-64">
                  <Doughnut data={data1} options={options} />
                </div>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-medium">Avg. Absences/Student</h2>
                <p className="text-2xl font-bold">
                  {stats.averageAbsencesPerStudent}
                </p>
                <div className="h-64">
                  <Doughnut data={data2} options={options} />
                </div>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-medium">Avg. Tardies/Student</h2>
                <p className="text-2xl font-bold">
                  {stats.averageTardiesPerStudent}
                </p>
                <div className="h-64">
                  <Doughnut data={data3} options={options} />
                </div>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-medium">Enrollments</h2>
                <p className="text-2xl font-bold">{stats.enrollments}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    <p>Total Enrollments</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default Dashboard;
