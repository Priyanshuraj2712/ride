import { useState } from "react";
import axios from "axios";
import "../auth/Register.css";
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
    walletId: "",
    govtIdName: "",
    govtIdVerified: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // Clear corresponding error instantly when typing
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // store only the filename as a placeholder for now
      setForm((f) => ({ ...f, govtIdName: file.name, govtIdVerified: false }));
      setErrors({ ...errors, govtId: "" });
    }
  };

  const handleVerifyGovtId = () => {
    if (!form.govtIdName) {
      setErrors((s) => ({ ...s, govtId: "Please upload your government ID first." }));
      return;
    }
    // Dummy verification flow: mark as verified
    setForm((f) => ({ ...f, govtIdVerified: true }));
    alert("Government ID verified (dummy)");
  };

  // -------------------------------
  // VALIDATION
  // -------------------------------
  const validate = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z ]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(form.name)) {
      newErrors.name = "Name should contain only alphabets and spaces";
    }

    if (!emailRegex.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.role === "driver") {
      if (!form.vehicleNumber.trim()) {
        newErrors.vehicleNumber = "Vehicle number is required for drivers";
      }
      if (!form.vehicleModel.trim()) {
        newErrors.vehicleModel = "Vehicle model is required for drivers";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // return true if no errors
  };

  // -------------------------------
  // SUBMIT
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      // Send only the fields that backend expects. walletId and govtId are collected client-side only.
      let payload = { ...form };
      delete payload.walletId;
      delete payload.govtIdName;
      delete payload.govtIdVerified;

      // Remove driver-only fields if passenger
      if (form.role !== "driver") {
        delete payload.vehicleNumber;
        delete payload.vehicleModel;
      }

      await axios.post("http://localhost:5001/api/auth/register", payload);

      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrors({ server: err.response?.data?.message || "Registration failed" });
    }
  };

  return (
    <div className="register-container">
      <h2>Ridezy Register</h2>

      <form onSubmit={handleSubmit}>

        {/* NAME */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />
        {errors.name && <span className="error-text">{errors.name}</span>}

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        {errors.email && <span className="error-text">{errors.email}</span>}

        {/* PHONE */}
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          required
        />
        {errors.phone && <span className="error-text">{errors.phone}</span>}

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        {errors.password && <span className="error-text">{errors.password}</span>}

        {/* ROLE */}
        <select name="role" onChange={handleChange}>
          <option value="passenger">Passenger</option>
          <option value="driver">Driver</option>
        </select>

        {/* DRIVER ONLY FIELDS */}
        {form.role === "driver" && (
          <>
            <input
              type="text"
              name="vehicleNumber"
              placeholder="Vehicle Number"
              onChange={handleChange}
            />
            {errors.vehicleNumber && (
              <span className="error-text">{errors.vehicleNumber}</span>
            )}

            <input
              type="text"
              name="vehicleModel"
              placeholder="Vehicle Model"
              onChange={handleChange}
            />
            {errors.vehicleModel && (
              <span className="error-text">{errors.vehicleModel}</span>
            )}
          </>
        )}

        {/* WALLET ID */}
        <input
          type="text"
          name="walletId"
          placeholder="Wallet ID (e.g. 0x...)"
          onChange={handleChange}
        />

        {/* GOVT ID UPLOAD (DUMMY) */}
        <div className="govt-id-row">
          <label className="govt-upload">
            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
            <span className="upload-label">Upload Govt ID</span>
          </label>
          <button type="button" className="btn-verify" onClick={handleVerifyGovtId}>
            Verify ID
          </button>
        </div>
        {form.govtIdName && (
          <div className="govt-summary">
            <small>Uploaded: {form.govtIdName} {form.govtIdVerified ? "(verified)" : "(not verified)"}</small>
          </div>
        )}
        {errors.govtId && <span className="error-text">{errors.govtId}</span>}

        {/* SERVER ERROR */}
        {errors.server && (
          <p style={{ color: "red", marginTop: "10px" }}>{errors.server}</p>
        )}

        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "blue" }}>
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
