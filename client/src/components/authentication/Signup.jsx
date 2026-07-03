import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import api from "../api";
export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNo: '',
    role: 'user',
    city: '',
  });

  const [cities, setCities] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/agent/allowedCities`);
        if (res.data && res.data.cities) {
          setCities(res.data.cities);
        }
      } catch (err) {
        console.error('Failed to fetch cities', err);
      }
    }
    fetchCities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (formData.role === 'user') {
            res = await api.post(`${import.meta.env.VITE_API_URL}/api/auth/user/signup`, {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phoneNo || undefined, 
            city: formData.city || undefined   
      });
} else {
        res = await api.post(`${import.meta.env.VITE_API_URL}/api/auth/agent/signup`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNo: formData.phoneNo,
          city: formData.city,
          role: formData.role,
        });
      }

      if (res.data.status) {
        toast.success(res.data.message);
        navigate('/login');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 p-md-5 rounded shadow"
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <h2 className="mb-4 text-center">SIGN UP</h2>

        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your password"
            required
          />
        </div>

        <fieldset className="mb-4">
          <legend className="col-form-label">Select Role</legend>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="role"
              id="roleUser"
              value="user"
              checked={formData.role === 'user'}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="roleUser">
              User
            </label>
          </div>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="role"
              id="roleAgent"
              value="agent"
              checked={formData.role === 'agent'}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="roleAgent">
              Agent
            </label>
          </div>
        </fieldset>

        {formData.role === 'agent' && (
          <>
            <div className="mb-3">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="" disabled>
                  Select City
                </option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="phoneNo" className="form-label">
                Phone Number
              </label>
              <input
                id="phoneNo"
                name="phoneNo"
                type="tel"
                value={formData.phoneNo}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your phone number"
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary w-100">
          Register
        </button>

        <p className="mt-3 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary text-decoration-none">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
