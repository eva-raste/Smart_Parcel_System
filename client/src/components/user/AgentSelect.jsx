import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from "../api";
export default function AgentSelect() {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');
  const [weight, setWeight] = useState('');
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await api.get(`${import.meta.env.VITE_API_URL}/api/auth/agent/allowedCities`);
        if (res.data && res.data.cities) {
          setCities(res.data.cities);
        }
      } catch (err) {
        console.error('Failed to fetch cities', err);
        toast.error('Failed to fetch cities!');
      }
    }
    fetchCities();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!fromCity || !toCity || !date || !weight) {
      toast.error('Please fill in all fields including date and weight');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        `${import.meta.env.VITE_API_URL}/api/orders/agentSelect`,
        {
          from: fromCity,
          to: toCity,
          date,
          weight: Number(weight),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status) {
        toast.success(res.data.message);
        setFromCity('');
        setToCity('');
        setDate('');
        setWeight('');
        navigate('/dashboard');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to place order!');
    }
  };

  return (
    <div
      className="d-flex flex-column vh-100 bg-light"
      style={{ padding: '15px', maxWidth: '400px', margin: '0 auto' }}
    >
      <h2 className="mb-4 text-center fw-bold">User Parcel Delivery Place Order</h2>

      <form onSubmit={handleSearch} className="d-flex flex-column gap-3 flex-grow-1">
        <div>
          <label htmlFor="fromCity" className="form-label fw-semibold">From:</label>
          <select
            id="fromCity"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={`from-${city}`} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="toCity" className="form-label fw-semibold">To:</label>
          <select
            id="toCity"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={`to-${city}`} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="form-label fw-semibold">Date:</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div>
          <label htmlFor="weight" className="form-label fw-semibold">Weight (kg):</label>
          <input
            id="weight"
            type="number"
            min="0"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="form-control"
            placeholder="Enter weight"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100 mt-auto">
          Place Order
        </button>

  
        <button
          type="button"
          className="btn btn-secondary w-100 mt-2"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </button>
      </form>
    </div>
  );
}