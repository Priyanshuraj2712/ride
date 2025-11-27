import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "passenger",
    vehicleNumber: "",
    vehicleModel: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // API endpoint example
      const res = await axios.post("http://localhost:5001/api/auth/register", form);

      alert("Registration successful! Please login.");
      navigate("/login");

    } catch (err) {
      console.error(err);
      alert("Registration failed!");
    }
  };

  return (
    <div className="register-container">
      <h2>Ridezy Register</h2>

      <form onSubmit={handleSubmit}>

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          onChange={handleChange}
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
        />

        {/* Phone */}
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          required
          onChange={handleChange}
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
        />

        {/* Role */}
        <select name="role" onChange={handleChange}>
          <option value="passenger">Passenger</option>
          <option value="driver">Driver</option>
        </select>

        {/* Show driver-only fields */}
        {form.role === "driver" && (
          <>
            <input
              type="text"
              name="vehicleNumber"
              placeholder="Vehicle Number"
              required
              onChange={handleChange}
            />

            <input
              type="text"
              name="vehicleModel"
              placeholder="Vehicle Model"
              required
              onChange={handleChange}
            />
          </>
        )}

        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "blue", textDecoration: "underline" }}>
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
