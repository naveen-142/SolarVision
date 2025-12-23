import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaFacebook } from "react-icons/fa";

// 🔥 Firebase imports
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";   // ✅ ADDED
import { auth, db } from "../firebase";             // ✅ db added

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [alert, setAlert] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🔥 UPDATED ONLY THIS FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // ✅ Save name in Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.name,
      });

      // ✅ CREATE FIRESTORE USER DOCUMENT (🔥 THIS FIXES LOGIN)
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        role: "user",
        createdAt: new Date(),
      });

      setAlert({
        type: "success",
        message: "✅ Signup successful! Redirecting to Login...",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setAlert({ type: "danger", message: error.message });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f9b0f, #000000)",
        padding: "30px",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <h2 className="text-center text-white mb-2 fw-bold">Create Account</h2>
        <p className="text-center text-light mb-4">
          Join us and explore intelligent energy solutions
        </p>

        {alert && (
          <div className={`alert alert-${alert.type} text-center`}>
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-white">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white">Email ID</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 py-2 fw-bold"
            style={{ borderRadius: "10px", fontSize: "16px" }}
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Already have an account?{" "}
          <span
            style={{ cursor: "pointer", color: "#00ff7f", fontWeight: "600" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
