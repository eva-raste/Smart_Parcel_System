import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api";
const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", email: "" });
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return navigate("/login");
      try {
        const res = await api.get(`${import.meta.env.VITE_API_URL}/api/profile/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setFormData({
          name: res.data.user.name,
          phone: res.data.user.phone,
          address: res.data.user.address,
          email: res.data.user.email,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    try {
      const res = await api.put(
        `${import.meta.env.VITE_API_URL}/api/profile/user`,
        { name: formData.name, phone: formData.phone, address: formData.address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err.response?.data?.message || err.message);
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
        <header
          className="d-flex justify-content-between align-items-center p-3 mb-3 rounded shadow-sm"
          style={{ backgroundColor: "#e8eaff" }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-box-seam fs-3 text-primary"></i>
            <span className="fs-4 fw-semibold">Samaan</span>
          </div>
        </header>
        <div className="text-center text-gray-600 mt-8">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>

      <div className="container" style={{ maxWidth: "600px" }}>
        
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#e8eaff",
                }}
              >
                <i className="bi bi-person-circle fs-1 text-primary"></i>
              </div>
              <h2 className="fs-4 fw-bold text-primary mb-1">User Profile</h2>
            </div>

            {!editMode ? (
              <div>
                <div className="mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                  <label className="text-muted small mb-1 d-block">
                    <i className="bi bi-person me-2"></i>Name
                  </label>
                  <p className="mb-0 fw-semibold">{user.name}</p>
                </div>

                <div className="mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                  <label className="text-muted small mb-1 d-block">
                    <i className="bi bi-envelope me-2"></i>Email
                  </label>
                  <p className="mb-0 fw-semibold">{user.email}</p>
                </div>

                <div className="mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                  <label className="text-muted small mb-1 d-block">
                    <i className="bi bi-telephone me-2"></i>Phone
                  </label>
                  <p className="mb-0 fw-semibold">{user.phone || "Not provided"}</p>
                </div>

                <div className="mb-4 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                  <label className="text-muted small mb-1 d-block">
                    <i className="bi bi-geo-alt me-2"></i>Address
                  </label>
                  <p className="mb-0 fw-semibold">{user.address || "Not provided"}</p>
                </div>

                <div className="d-flex gap-2">
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-pencil"></i>
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger flex-fill d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    <i className="bi bi-person me-2"></i>Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    <i className="bi bi-envelope me-2"></i>Email
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    disabled
                    className="form-control"
                    style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                  />
                  <small className="text-muted">Email cannot be changed</small>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    <i className="bi bi-telephone me-2"></i>Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">
                    <i className="bi bi-geo-alt me-2"></i>Address
                  </label>
                  <textarea
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    rows="2"
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="btn btn-success flex-fill d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-check-circle"></i>
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="btn btn-secondary flex-fill d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-x-circle"></i>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;