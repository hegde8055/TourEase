// src/components/ConfirmModal.js
import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        {/* Backdrop is just a blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full max-w-md transform overflow-hidden rounded-2xl 
                           bg-white/70 backdrop-blur-lg 
                           p-6 text-left align-middle shadow-xl transition-all 
                           ring-1 ring-black/10"
              >
                <div className="flex items-start">
                  <div className="mr-4 flex-shrink-0 rounded-full bg-red-100 p-3">
                    <FaExclamationTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-gray-900">
                      {message}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        This action is permanent and cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2 bg-white text-gray-900 rounded-md font-medium 
                               ring-1 ring-inset ring-gray-300
                               hover:bg-gray-50 transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="px-5 py-2 bg-red-600 text-white rounded-md font-medium 
                               hover:bg-red-700 transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Sign Out
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmModal;
