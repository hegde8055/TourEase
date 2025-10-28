import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real app this would call an API; we surface a friendly message for now.
    setStatus({
      type: "success",
      message: "Thanks for reaching out! Our concierge team will respond within 24 hours.",
    });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="main-content">
      <Navbar />
      <main className="page-container" style={{ paddingTop: "140px", paddingBottom: "120px" }}>
        <section style={{ textAlign: "center", marginBottom: "60px" }}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              fontSize: "3.1rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #d4af37, #3b82f6)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "22px",
            }}
          >
            Let’s Craft Your Next Escape
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{
              maxWidth: "760px",
              margin: "0 auto",
              color: "rgba(226, 232, 240, 0.82)",
              fontSize: "1.12rem",
              lineHeight: 1.8,
            }}
          >
            Whether you’re seeking an off-grid Himalayan retreat or a palatial celebration in
            Rajasthan, our travel artisans are ready to design, refine, and deliver a breathtaking
            journey.
          </motion.p>
        </section>

        <section
          style={{
            display: "grid",
            gap: "32px",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            style={{
              background: "var(--glass)",
              borderRadius: "24px",
              padding: "34px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div style={{ display: "grid", gap: "18px" }}>
              {[
                { name: "name", label: "Full Name", type: "text" },
                { name: "email", label: "Email", type: "email" },
              ].map((field) => (
                <label key={field.name} style={{ textAlign: "left" }}>
                  <span
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#e2e8f0",
                      fontWeight: 600,
                    }}
                  >
                    {field.label}
                  </span>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      borderRadius: "14px",
                      border: "2px solid rgba(59, 130, 246, 0.15)",
                      background: "rgba(15, 23, 42, 0.7)",
                      color: "#e2e8f0",
                      fontSize: "1rem",
                      outline: "none",
                    }}
                  />
                </label>
              ))}
              <label style={{ textAlign: "left" }}>
                <span
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#e2e8f0",
                    fontWeight: 600,
                  }}
                >
                  Subject
                </span>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    border: "2px solid rgba(59, 130, 246, 0.15)",
                    background: "rgba(15, 23, 42, 0.7)",
                    color: "#e2e8f0",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </label>
              <label style={{ textAlign: "left" }}>
                <span
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#e2e8f0",
                    fontWeight: 600,
                  }}
                >
                  Message
                </span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    border: "2px solid rgba(59, 130, 246, 0.15)",
                    background: "rgba(15, 23, 42, 0.7)",
                    color: "#e2e8f0",
                    fontSize: "1rem",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </label>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary"
                style={{ marginTop: "10px" }}
              >
                Send Message
              </motion.button>
              {status && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background:
                      status.type === "success"
                        ? "rgba(16, 185, 129, 0.12)"
                        : "rgba(239, 68, 68, 0.12)",
                    border: `1px solid ${status.type === "success" ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)"}`,
                    color: status.type === "success" ? "#10b981" : "#ef4444",
                  }}
                >
                  {status.message}
                </motion.div>
              )}
            </div>
          </motion.form>

          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              borderRadius: "24px",
              padding: "34px",
              border: "1px solid rgba(212, 175, 55, 0.18)",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.4)",
              display: "grid",
              gap: "22px",
            }}
          >
            <h2 style={{ fontSize: "1.6rem", color: "#d4af37" }}>Concierge Desk</h2>
            <p style={{ color: "rgba(226, 232, 240, 0.82)", lineHeight: 1.8 }}>
              Speak with our travel specialists Monday through Saturday, 9 AM – 8 PM IST, or book a
              private planning session for bespoke celebrations and extended journeys.
            </p>
            <div style={{ display: "grid", gap: "14px" }}>
              {[
                { icon: "📞", label: "Phone", value: "+91 1800 123 4567" },
                { icon: "💌", label: "Email", value: "concierge@tourease.com" },
                { icon: "💬", label: "WhatsApp", value: "+91 99000 12345" },
                { icon: "📍", label: "Studio", value: "UB City, Vittal Mallya Road, Bengaluru" },
              ].map((detail) => (
                <div
                  key={detail.label}
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{detail.icon}</span>
                  <div>
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{detail.label}</div>
                    <div style={{ color: "#e2e8f0", fontWeight: 600 }}>{detail.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>
        </section>
      </main>
    </div>
  );
};

export default Contact;
