import { useState, useEffect } from 'react';
import axios from 'axios';

const recipientOptions = [
  { value: 'Student', label: 'Students' },
  { value: 'Teacher', label: 'Teachers' },
  { value: 'Parent', label: 'Parents' },
  { value: 'Class', label: 'Classes' },
];

const NotificationForm = ({ isEditing, editingNotification, newNotification, setNewNotification, onClose, fetchNotifications }) => {
  const [formData, setFormData] = useState(isEditing ? editingNotification : newNotification);

  useEffect(() => {
    setFormData(isEditing ? editingNotification : newNotification);
  }, [isEditing, editingNotification, newNotification]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prevState => {
      const newRecipientModels = checked
        ? [...prevState.recipientModels, value]
        : prevState.recipientModels.filter(model => model !== value);
      return { ...prevState, recipientModels: newRecipientModels };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/notifications/update/${formData._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/notifications/create',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onClose();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="mt-8 bg-gray-100 p-6 rounded shadow-md">
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message || ''}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Recipient Models</label>
        <div className="mt-2 space-y-2">
          {recipientOptions.map(option => (
            <div key={option.value} className="flex items-center">
              <input
                type="checkbox"
                id={option.value}
                value={option.value}
                checked={formData.recipientModels.includes(option.value)}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <label htmlFor={option.value} className="text-sm text-gray-600">{option.label}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? 'Update' : 'Add'} Notification
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default NotificationForm;
