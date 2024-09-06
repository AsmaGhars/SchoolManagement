const NotificationItem = ({ notification, onEdit, onDelete }) => {
    return (
      <li className="mb-4 p-4 border border-gray-200 rounded-lg flex flex-col">
        <h3 className="text-xl font-semibold mb-2">{notification.title}</h3>
        <p className="text-gray-700 mb-4">{notification.message}</p>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </li>
    );
  };
  
  export default NotificationItem;
  