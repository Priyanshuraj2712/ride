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
    role: "passenger"
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://localhost:5001/api/auth/login", form);

    console.log("LOGIN RESPONSE:", res.data);

    login(res.data.token, res.data.user.role);

    if (res.data.role === "driver") navigate("/driver/dashboard");
    else navigate("/passenger/dashboard");

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    alert("Login failed");
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

        <select name="role" onChange={handleChange}>
          <option value="passenger">Passenger</option>
          <option value="driver">Driver</option>
        </select>

        <button type="submit">Login</button>
      </form>

      {/* ⭐ Register Button BELOW */}
      <p style={{ marginTop: "15px" }}>
        Don’t have an account?{" "}
        <Link to="/register" style={{ color: "blue", textDecoration: "underline" }}>
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
