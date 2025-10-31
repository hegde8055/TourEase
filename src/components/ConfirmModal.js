// src/components/ConfirmModal.js
import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaExclamationTriangle } from "react-icons/fa"; // Added for extra visual cue

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  return (
    // 'Transition' handles the fade-in/out of the entire modal
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        {/*
          'Transition.Child' for the backdrop (the dark overlay)
          This fades in and out.
        */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/*
              'Transition.Child' for the modal panel itself.
              This fades in and scales up.
            */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* This 'Dialog.Panel' is your original styled modal box */}
              <Dialog.Panel
                className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 
                           text-left align-middle shadow-2xl transition-all 
                           ring-2 ring-yellow-500 shadow-yellow-500/30 
                           shadow-[0_0_30px_5px_rgba(255,215,0,0.5)]"
              >
                <div className="flex items-center">
                  <div className="mr-4 flex-shrink-0">
                    <FaExclamationTriangle className="h-8 w-8 text-yellow-500" aria-hidden="true" />
                  </div>
                  <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-gray-900">
                    {message}
                  </Dialog.Title>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="px-5 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
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
