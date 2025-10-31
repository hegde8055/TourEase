// src/components/ConfirmModal.js
import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        {/* Backdrop (Made slightly darker) */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Modal Panel Animation */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* --- STYLING UPGRADE STARTS HERE --- */}
              <Dialog.Panel
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 
                           p-6 text-left align-middle shadow-xl transition-all 
                           ring-1 ring-white/10"
              >
                <div className="flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    {/* Icon is now RED */}
                    <FaExclamationTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
                  </div>
                  <div>
                    {/* Title is now white */}
                    <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-gray-100">
                      {message}
                    </Dialog.Title>
                    {/* Added subtle helper text */}
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">This action cannot be undone.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  {/* Cancel button is now dark-themed */}
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2 bg-gray-700 text-gray-200 rounded-md font-medium 
                               hover:bg-gray-600 transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  >
                    Cancel
                  </button>
                  {/* Sign Out button is still red, but with updated focus ring */}
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="px-5 py-2 bg-red-600 text-white rounded-md font-medium 
                               hover:bg-red-700 transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  >
                    Sign Out
                  </button>
                </div>
              </Dialog.Panel>
              {/* --- STYLING UPGRADE ENDS HERE --- */}
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmModal;
