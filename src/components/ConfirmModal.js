// src/components/ConfirmModal.js
import React from "react";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    // Backdrop: Fixed position, full screen, centered, semi-transparent black
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      {/* Modal Body */}
      <div
        className="relative bg-white rounded-lg p-6 shadow-2xl max-w-md mx-4
                   ring-2 ring-yellow-500 shadow-yellow-500/30 shadow-[0_0_30px_5px_rgba(255,215,0,0.5)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Message */}
        <h2 id="modal-title" className="text-xl font-medium text-gray-900 mb-4">
          {message}
        </h2>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
