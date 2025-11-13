// /client/src/components/ConfirmModal.js
import React, { Fragment, useEffect, useState, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const openSound = "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3";
const confirmSound = "https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3";

const playSound = (url, volume = 0.4) => {
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch (err) {
    console.debug("[ConfirmModal] Audio playback skipped:", err?.message);
  }
};

const ConfirmModal = ({ isOpen, onConfirm, onCancel, onForceConfirm, message }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playSound(openSound, 0.35);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const colors = useMemo(
    () => ({
      gold: "#D4AF37",
      text: "#E5E7EB",
      muted: "#94A3B8",
    }),
    []
  );

  const handleConfirm = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    playSound(confirmSound, 0.45);

    const tryForce = async () => {
      if (typeof onForceConfirm === "function") {
        await onForceConfirm();
      }
    };

    try {
      if (typeof onConfirm === "function") {
        await onConfirm();
      } else if (typeof onForceConfirm === "function") {
        await tryForce();
      }
    } catch (error) {
      console.error("[ConfirmModal] Confirm handler failed, invoking fallback:", error);
      await tryForce();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (isProcessing) return;
    if (typeof onCancel === "function") onCancel();
  };

  const handleForce = (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (typeof onForceConfirm === "function") onForceConfirm();
  };

  return (
    <Transition as={Fragment} appear show={isOpen}>
      <Dialog as="div" className="relative" onClose={handleCancel} style={{ zIndex: 2000 }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            style={{
              position: "fixed",
              inset: 0,
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0,0,0,0.65)",
            }}
          />
        </Transition.Child>

        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-250"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 420,
                borderRadius: 18,
                padding: "30px 26px",
                background: "linear-gradient(150deg, #05070f 0%, #0e162b 65%, #0b0e14 100%)",
                border: "1px solid rgba(212,175,55,0.35)",
                boxShadow: "0 0 36px rgba(212,175,55,0.28)",
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
              >
                <div
                  style={{
                    padding: 16,
                    borderRadius: "50%",
                    background: "rgba(212,175,55,0.15)",
                    border: "1px solid rgba(212,175,55,0.4)",
                    boxShadow: "0 0 20px rgba(212,175,55,0.4)",
                  }}
                >
                  <FaExclamationTriangle size={34} color={colors.gold} />
                </div>
              </motion.div>

              <Dialog.Title
                as="h3"
                style={{
                  textAlign: "center",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: colors.gold,
                  marginBottom: 10,
                }}
              >
                {message}
              </Dialog.Title>

              <p
                style={{
                  textAlign: "center",
                  color: colors.muted,
                  fontSize: "0.95rem",
                  marginBottom: 28,
                }}
              >
                You’ll need to sign in again to continue exploring TourEase.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 18,
                }}
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: isProcessing ? 1 : 1.05 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.95 }}
                  onClick={handleCancel}
                  disabled={isProcessing}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    border: "1px solid rgba(212,175,55,0.3)",
                    background: "rgba(17,24,39,0.75)",
                    color: colors.text,
                    fontWeight: 600,
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: isProcessing ? 1 : 1.08 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.94 }}
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    color: "#0b0e14",
                    background: "linear-gradient(135deg, #D4AF37, #B38F2B, #F8E78A)",
                    boxShadow: "0 0 20px rgba(212,175,55,0.45)",
                    border: "none",
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                >
                  {isProcessing ? "Signing out…" : "Sign Out"}
                </motion.button>
              </div>

              {typeof onForceConfirm === "function" && (
                <button
                  type="button"
                  onClick={handleForce}
                  style={{
                    marginTop: 18,
                    padding: "8px 18px",
                    borderRadius: 999,
                    border: "1px dashed rgba(212,175,55,0.45)",
                    background: "transparent",
                    color: colors.muted,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Trouble signing out? Force it
                </button>
              )}

              <button
                type="button"
                onClick={handleCancel}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 18,
                  border: "none",
                  background: "transparent",
                  color: colors.gold,
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmModal;
