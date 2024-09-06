import React from "react";
import PropTypes from "prop-types";

const Modal = ({ isVisible, onClose, onConfirm, title, message, children }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        {message && <p className="mb-4 text-gray-700">{message}</p>}
        <div className="mb-4">
          {children}
        </div>
        <div className="flex justify-end space-x-4">
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Confirm
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  children: PropTypes.node,
};

export default Modal;
