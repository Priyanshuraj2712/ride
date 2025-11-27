import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { email, password } = form;

      const res = await axios.post(
        "http://localhost:5001/api/auth/login",
        { email, password }     // ⬅️ send ONLY email + password
      );

      console.log("LOGIN RESPONSE:", res.data);

      // Store token + user
      login(res.data.token, res.data.user);

      // Also save them in localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      // Driver specific
      if (res.data.user.role === "driver" && res.data.user.driverId) {
        localStorage.setItem("driverId", res.data.user.driverId);
      }

      // Redirect based on role
      if (res.data.user.role === "driver") {
        navigate("/driver/dashboard");
      } else {
        navigate("/passenger/dashboard");
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Ridezy Login</h2>

      <form onSubmit={handleSubmit}>
        <input 
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input 
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Don’t have an account?{" "}
        <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
