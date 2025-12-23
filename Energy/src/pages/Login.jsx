import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// 🔥 Firebase
import { auth, db, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// 🎨 Icons
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
} from "react-icons/fa";

// 🎨 CSS
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ===============================
     EMAIL + PASSWORD LOGIN
     =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 🔐 Safety check (should already exist)
      if (!userSnap.exists()) {
  await setDoc(userRef, {
    email: user.email,
    name: user.email.split("@")[0],
    role: "user",
    createdAt: new Date(),
  });
}


     // ✅ SAVE USER FOR BACKEND USE
localStorage.setItem(
  "user",
  JSON.stringify({
    uid: user.uid,              // REQUIRED by backend
    email: user.email,
    role: userSnap.data()?.role || "user",
  })
);

login(); // update auth context
setAlert({ type: "success", message: "Login Successful!" });

setTimeout(() => navigate("/home"), 1000);

    } catch (error) {
      setAlert({ type: "danger", message: error.message });
    }

    setLoading(false);
  };

  /* ===============================
     GOOGLE LOGIN
     =============================== */
  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 🔥 First-time Google user → create Firestore doc
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "User",
          email: user.email,
          role: "user",
          createdAt: new Date(),
        });
      }

      // ✅ SAVE USER FOR BACKEND USE
localStorage.setItem(
  "user",
  JSON.stringify({
    uid: user.uid,
    email: user.email,
    role: userSnap.exists() ? userSnap.data().role : "user",
  })
);

login();
setAlert({ type: "success", message: "Google Login Successful!" });

setTimeout(() => navigate("/home"), 1000);

    } catch (error) {
      setAlert({ type: "danger", message: error.message });
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h2 className="text-center fw-bold mb-4">Login</h2>

        {alert && (
          <div className={`alert alert-${alert.type} text-center`}>
            {alert.message}
          </div>
        )}

        {/* EMAIL LOGIN */}
        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-4 position-relative">
            <input
              type="email"
              className="form-control ps-5"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>Email</label>
            <FaEnvelope className="icon-left" />
          </div>

          <div className="form-floating mb-4 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control ps-5"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label>Password</label>
            <FaLock className="icon-left" />

            <span
              className="icon-right"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="btn w-100 fw-bold py-2"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* OR */}
        <div className="text-center my-3 opacity-75">OR</div>

        {/* GOOGLE LOGIN */}
        <button
          className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FaGoogle />
          Continue with Google
        </button>

        <p className="text-center mt-4">
          Don’t have an account?{" "}
          <span
            className="signup-link"
            onClick={() => navigate("/signup")}
          >
            Signup
          </span>
        </p>

      </div>
    </div>
  );
};

export default Login;
