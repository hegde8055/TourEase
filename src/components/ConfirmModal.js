// /client/src/components/ConfirmModal.js
import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const openSound = "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3";
const confirmSound = "https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3";

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const audio = new Audio(openSound);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  }, [isOpen]);

  const handleConfirm = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const audio = new Audio(confirmSound);
      audio.volume = 0.5;
      audio.play().catch(() => {});

      if (typeof onConfirm === "function") {
        await onConfirm();
      }

      if (typeof onCancel === "function") {
        onCancel();
      }
    } catch (err) {
      console.error("[ConfirmModal] onConfirm error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const colors = {
    gold: "#D4AF37",
    goldDeep: "#B38F2B",
    bgDark: "#0B0E14",
    surface: "#111827",
    text: "#E5E7EB",
    muted: "#94A3B8",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative" onClose={onCancel} style={{ zIndex: 2000 }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-400"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
            }}
          />
        </Transition.Child>

        <div
          style={{
            position: "fixed",
            inset: 0,
            overflowY: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500"
            enterFrom="opacity-0 scale-90 rotate-[-4deg]"
            enterTo="opacity-100 scale-100 rotate-0"
            leave="ease-in duration-300"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-90 rotate-2"
          >
            <Dialog.Panel
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "420px",
                borderRadius: "18px",
                padding: "28px 22px 32px",
                background: "linear-gradient(145deg, #000000 0%, #0b0e14 60%, #111827 100%)",
                boxShadow: "0 0 40px rgba(212,175,55,0.25)",
                border: "1px solid rgba(212,175,55,0.35)",
                overflow: "hidden",
              }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "18px",
                  border: "2px solid rgba(212,175,55,0.3)",
                }}
                animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background: "rgba(212,175,55,0.15)",
                    padding: "16px",
                    borderRadius: "50%",
                    border: "1px solid rgba(212,175,55,0.4)",
                    boxShadow: "0 0 20px rgba(212,175,55,0.4)",
                  }}
                >
                  <FaExclamationTriangle
                    style={{
                      width: "38px",
                      height: "38px",
                      color: colors.gold,
                      filter: "drop-shadow(0 0 6px rgba(212,175,55,0.7))",
                    }}
                  />
                </motion.div>
              </motion.div>

              <Dialog.Title
                as="h3"
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  background: "linear-gradient(90deg, #D4AF37, #FCE570, #D4AF37)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                  marginBottom: "6px",
                }}
              >
                {message}
              </Dialog.Title>

              <p
                style={{
                  color: colors.muted,
                  fontSize: "0.9rem",
                  textAlign: "center",
                  marginBottom: "24px",
                }}
              >
                You’ll need to sign in again to continue exploring TourEase.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "18px",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.1, textShadow: "0 0 10px rgba(255,255,255,0.7)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCancel}
                  disabled={isProcessing}
                  type="button"
                  style={{
                    padding: "10px 26px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(17,24,39,0.8)",
                    border: "1px solid rgba(212,175,55,0.3)",
                    color: colors.text,
                    fontWeight: "600",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.15, boxShadow: "0 0 24px rgba(212,175,55,0.7)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  type="button"
                  style={{
                    padding: "10px 26px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    color: "#0b0e14",
                    background: "linear-gradient(135deg, #D4AF37, #B38F2B, #F8E78A)",
                    boxShadow: "0 0 18px rgba(212,175,55,0.4)",
                    border: "none",
                    transition: "all 0.3s ease",
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                >
                  {isProcessing ? "Signing out..." : "Sign Out"}
                </motion.button>
              </div>

              <button
                onClick={onCancel}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "18px",
                  fontSize: "1.2rem",
                  background: "transparent",
                  color: colors.gold,
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                type="button"
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
