import { useRouter } from 'next/router';
import axios from 'axios';

const TeacherNavbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/teachers/logout', 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Logout response:', response);

      if (response.status === 200) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        console.error('Logout failed with status:', response.status, response.data.message);
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
      alert('An error occurred during logout. Please try again.');
    }
  };

  return (
    <div className=" bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">Teacher Panel</h1>
      <button
        onClick={handleLogout}
        className="bg-blue-800 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Logout
      </button>
    </div>
  );
};

export default TeacherNavbar;
