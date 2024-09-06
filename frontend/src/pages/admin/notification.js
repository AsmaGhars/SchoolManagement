import { useState, useEffect } from 'react';
import axios from 'axios';
import "../../app/globals.css";
import { useRouter } from 'next/router';
import NotificationForm from '@/components/Admin/NotificationForm';
import NotificationItem from '@/components/Admin/NotificationItem';
import Modal from '@/components/Admin/Modal';
import Navbar from '@/components/Admin/Navbar';
import Layout from '@/components/Admin/Layout';

const Notifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [newNotification, setNewNotification] = useState({ title: '', message: '', recipientModels: [] });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState(null);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        fetchNotifications();
      } else {
        router.push('/login');
      }
    };
    checkAuthentication();
  }, [router]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setIsEditing(true);
  };

  const handleDelete = (notification) => {
    setDeletingNotification(notification);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/notifications/delete/${deletingNotification._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.filter((notif) => notif._id !== deletingNotification._id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setIsModalVisible(false);
      setDeletingNotification(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setDeletingNotification(null);
  };

  const handleAddNotification = () => {
    setIsAdding(true);
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 h-[calc(100vh-120px)] scroll-hidden overflow-y-auto">
        <h2 className="text-3xl font-semibold mb-8 text-blue-800">Notifications List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onEdit={() => handleEdit(notification)}
                onDelete={() => handleDelete(notification)}
              />
            ))}
          </ul>
        )}
        <button
          onClick={handleAddNotification}
          className="mt-8 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
        >
          Add Notification
        </button>
        {(isEditing || isAdding) && (
          <NotificationForm
            isEditing={isEditing}
            editingNotification={editingNotification}
            newNotification={newNotification}
            setNewNotification={setNewNotification}
            onClose={() => {
              setIsEditing(false);
              setIsAdding(false);
              setEditingNotification(null);
              setNewNotification({ title: '', message: '', recipientModels: [] });
            }}
            fetchNotifications={fetchNotifications}
          />
        )}
        <Modal
          isVisible={isModalVisible}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          message={`Are you sure you want to delete notification?`}
        />
      </div>
    </Layout>
  );
};

export default Notifications;
