import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api";
const AgentHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [currLocations, setCurrLocations] = useState({}); 
  
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/api/orders/agent-history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setOrders(response.data.orders);
      }
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      console.error("Error fetching orders:", err);
      setLoading(false);
    }
  };

  const handleLocationUpdate = async (orderId) => {
    try {
      const newLocation = currLocations[orderId];
      if (!newLocation) {
        alert("Please enter a location before updating.");
        return;
      }

      setUpdating(orderId);
      const token = localStorage.getItem("token");

      await api.patch(
        `/api/orders/update-location/${orderId}`,
        { currlocation: newLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUpdating(null);
      fetchHistory(); 
    } catch (err) {
      console.error("Error updating location:", err);
      setUpdating(null);
    }
  };

  const handleDelivered = async (order) => {
  try {
    if ((currLocations[order._id] ?? order.currlocation) !== order.to) {
      alert("Current location must match destination before marking delivered.");
      return;
    }


    const token = localStorage.getItem("token");

    await api.patch(
      `/api/orders/mark-delivered/${order._id}`,
      { status: "Delivered" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchHistory();
  } catch (err) {
    console.error("Error marking delivered:", err);
  }
};

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <div className="p-4">Loading history...</div>;

  return (
    <div className="p-4 bg-light min-vh-100">
      <h2 className="mb-4">Order History</h2>

      {orders.length === 0 ? (
        <div className="alert alert-info">No history available yet.</div>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>User</th>
              <th>From</th>
              <th>To</th>
              <th>Date</th>
              <th>Weight</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Current Location</th>
              <th>Action</th>
              <th>Mark Delivered</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((record) => {
              const order = record.orderId;
              if (!order) return null;

              return (
                <tr key={order._id}>
                  <td>{record.userId?.name}</td>
                  <td>{order.from}</td>
                  <td>{order.to}</td>
                  <td>
                    {order.date
                      ? new Date(order.date).toLocaleDateString()
                      : ""}
                  </td>
                  <td>{order.weight}</td>
                  <td>{order.weight*100}</td>
                  <td>{order.status}</td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter current city"
                      value={currLocations[order._id] ?? order.currlocation ?? ""}
                      onChange={(e) =>
                        setCurrLocations({
                          ...currLocations,
                          [order._id]: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleLocationUpdate(order._id)}
                      disabled={updating === order._id}
                    >
                      {updating === order._id ? "Updating..." : "Update"}
                    </button>
                  </td>
                  <td>
                      <button
                        className="btn btn-success btn-sm ms-2"
                        onClick={() => handleDelivered(order)}
                        disabled={(currLocations[order._id] ?? order.currlocation) !== order.to}
                      >
                        ✓
                      </button>

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AgentHistory;
