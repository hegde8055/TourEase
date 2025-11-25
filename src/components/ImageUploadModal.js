import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { profileAPI } from "../utils/api";

const ImageUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [uploadMethod, setUploadMethod] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [crop, setCrop] = useState({ unit: "%", width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [stream, setStream] = useState(null);

  // New State for enhancements
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const imgRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cleanup camera stream when component unmounts or stream changes
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  // Auto-start camera if method is camera
  useEffect(() => {
    if (isOpen && uploadMethod === "camera" && !stream && !cameraLoading && !imageSrc) {
      startCamera();
    }
  }, [isOpen, uploadMethod, stream, cameraLoading, imageSrc]);

  const resetState = () => {
    setUploadMethod(null);
    setImageSrc(null);
    setCrop({ unit: "%", width: 50, aspect: 1 });
    setCompletedCrop(null);
    setShowCropper(false);
    setCameraLoading(false);
    setUploadProgress(0);
    setError("");
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, etc.)");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("File size exceeds 5MB limit.");
      return false;
    }
    setError("");
    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
      setShowCropper(false);
      setCrop({ unit: "%", width: 50, aspect: 1 });
      setCompletedCrop(null);
      setUploadMethod("local");
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageSrc(reader.result);
          setShowCropper(false);
          setCrop({ unit: "%", width: 50, aspect: 1 });
          setCompletedCrop(null);
          setUploadMethod("local");
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const startCamera = useCallback(async () => {
    if (cameraLoading) return;
    setCameraLoading(true);
    try {
      setImageSrc(null);
      setShowCropper(false);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraLoading(false);
      setError("Unable to access camera. Please check permissions.");
    }
  }, [cameraLoading, stream]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;

    const videoElement = videoRef.current;
    videoElement.muted = true;
    videoElement.setAttribute("playsinline", "true");
    videoElement.srcObject = stream;

    const handleCanPlay = () => {
      setCameraLoading(false);
      videoElement.removeEventListener("canplay", handleCanPlay);
    };

    videoElement.addEventListener("canplay", handleCanPlay);

    const playPromise = videoElement.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch((err) => {
        console.warn("Video play() failed:", err);
        setTimeout(() => setCameraLoading(false), 500);
      });
    }

    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay);
      if (videoElement.srcObject === stream) {
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setImageSrc(imageDataUrl);
      setShowCropper(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  };

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return null;
    const canvas = document.createElement("canvas");
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9));
  };

  const dataUrlToBlob = (dataUrl) => {
    try {
      const [header, base64] = dataUrl.split(",");
      if (!base64) return null;
      const mimeMatch = header.match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const binary = atob(base64);
      const length = binary.length;
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: mimeType });
    } catch (error) {
      console.error("Failed to convert data URL to blob", error);
      return null;
    }
  };

  const handlePhotoUpload = async (useCrop = false) => {
    try {
      setUploadProgress(0);
      let blobToUpload = null;

      if (useCrop) {
        const croppedBlob = await getCroppedImg();
        if (!croppedBlob) {
          setError("Please crop the image first");
          return;
        }
        blobToUpload = croppedBlob;
      } else {
        if (!imageSrc) {
          setError("No image found to upload. Please try again.");
          return;
        }

        if (imageSrc.startsWith("data:")) {
          blobToUpload = dataUrlToBlob(imageSrc);
          if (!blobToUpload) {
            setError("Couldn't prepare the image for upload. Please try cropping it first.");
            return;
          }
        } else {
          try {
            const response = await fetch(imageSrc);
            const blob = await response.blob();
            blobToUpload = blob;
          } catch (error) {
            console.error("Unable to prepare image for upload:", error);
            setError("Couldn't prepare the image for upload. Please try cropping it first.");
            return;
          }
        }
      }

      if (!blobToUpload) {
        setError("Could not prepare the image. Please try again.");
        return;
      }

      const formData = new FormData();
      const fileType = blobToUpload.type || "image/jpeg";
      const extension = fileType.split("/")[1] || "jpg";
      formData.append("photo", blobToUpload, `profile-${Date.now()}.${extension}`);

      await profileAPI.uploadPhoto(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      handleClose();
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Error processing image:", error);
      setError(error.response?.data?.error || "Error processing image. Please try again.");
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
        onClick={handleClose}
        onDragEnter={handleDrag}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            background: "#111827",
            borderRadius: "24px",
            padding: "30px",
            width: "100%",
            maxWidth: "500px",
            border: dragActive ? "2px dashed #d4af37" : "1px solid rgba(212, 175, 55, 0.2)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Drag Overlay */}
          {dragActive && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(212, 175, 55, 0.1)",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <h3 style={{ color: "#d4af37", fontSize: "1.5rem" }}>Drop image here</h3>
            </div>
          )}

          <h3
            style={{
              color: "#d4af37",
              fontSize: "1.5rem",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            Update Profile Photo
          </h3>

          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {!uploadMethod ? (
            <div style={{ display: "grid", gap: "16px" }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "30px",
                  background: "rgba(255,255,255,0.05)",
                  border: "2px dashed rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  color: "#9ca3af",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d4af37";
                  e.currentTarget.style.background = "rgba(212, 175, 55, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              >
                <span style={{ fontSize: "2rem" }}>📁</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "#e5e7eb" }}>
                  Click to Upload or Drag & Drop
                </span>
                <span style={{ fontSize: "0.85rem" }}>Supports JPG, PNG (Max 5MB)</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                onClick={() => setUploadMethod("camera")}
                style={{
                  padding: "16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontSize: "1.1rem",
                }}
              >
                📸 Take Photo
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {uploadMethod === "camera" && !imageSrc && (
                <div
                  style={{
                    position: "relative",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "#000",
                    aspectRatio: "4/3",
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    onClick={capturePhoto}
                    style={{
                      position: "absolute",
                      bottom: "20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "#fff",
                      border: "4px solid rgba(0,0,0,0.2)",
                      cursor: "pointer",
                    }}
                  />
                </div>
              )}

              {imageSrc && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {!showCropper ? (
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "16px",
                        overflow: "hidden",
                        maxHeight: "400px",
                      }}
                    >
                      <img
                        src={imageSrc}
                        alt="Preview"
                        style={{ width: "100%", height: "auto", display: "block" }}
                      />
                    </div>
                  ) : (
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      circularCrop
                    >
                      <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="Crop me"
                        style={{ maxWidth: "100%" }}
                        onLoad={(e) => {
                          const { width, height } = e.currentTarget;
                          const size = Math.min(width, height);
                          setCrop({
                            unit: "px",
                            width: size,
                            height: size,
                            x: (width - size) / 2,
                            y: (height - size) / 2,
                            aspect: 1,
                          });
                        }}
                      />
                    </ReactCrop>
                  )}

                  {/* Progress Bar */}
                  {uploadProgress > 0 && (
                    <div
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "99px",
                        height: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        style={{ height: "100%", background: "#10b981", borderRadius: "99px" }}
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    {!showCropper ? (
                      <>
                        <button
                          onClick={() => handlePhotoUpload(false)}
                          disabled={uploadProgress > 0}
                          style={{
                            flex: 1,
                            padding: "12px",
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            opacity: uploadProgress > 0 ? 0.7 : 1,
                          }}
                        >
                          {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : "Upload Original"}
                        </button>
                        <button
                          onClick={() => setShowCropper(true)}
                          disabled={uploadProgress > 0}
                          style={{
                            flex: 1,
                            padding: "12px",
                            background: "rgba(255,255,255,0.1)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
                            fontWeight: "600",
                          }}
                        >
                          Crop Image
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handlePhotoUpload(true)}
                        disabled={uploadProgress > 0}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: "#3b82f6",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          opacity: uploadProgress > 0 ? 0.7 : 1,
                        }}
                      >
                        {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : "Save & Upload"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setUploadMethod(null);
                  setImageSrc(null);
                  if (stream) {
                    stream.getTracks().forEach((track) => track.stop());
                    setStream(null);
                  }
                }}
                disabled={uploadProgress > 0}
                style={{
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#9ca3af",
                  borderRadius: "8px",
                  cursor: uploadProgress > 0 ? "not-allowed" : "pointer",
                }}
              >
                Back
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageUploadModal;
