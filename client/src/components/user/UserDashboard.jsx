import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import api from "../../api";
const UserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view orders");
          setLoading(false);
          return;
        }

        const res = await api.get(`${import.meta.env.VITE_API_URL}/api/orders/userOrders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(res.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="d-flex flex-column vh-100 bg-light" style={{ padding: "15px" }}>
      

      <main className="flex-grow-1 bg-white rounded shadow p-4 overflow-auto">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold">Your Orders</h3>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/selectCarrier")}
          >
            Select Carrier
          </button>
        </div>

        {loading && <p>Loading orders...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && (
          <>
            <div className="table-responsive">
              <table className="table table-hover table-bordered rounded mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    
                    <th>Agent</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Weight (kg)</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map((order, idx) => (
                      <tr key={order._id || idx}>
                        <th>{indexOfFirstOrder + idx + 1}</th>
                        <td>{order.agent?.name || "Not assigned"}</td>
                        <td>{order.from}</td>
                        <td>{order.to}</td>
                        <td>{order.weight}</td>
                        <td>{moment(order.date).format("YYYY-MM-DD")}</td>
                        <td>{order.status}</td>
                        <td>
                          {order.agent ? (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => navigate(`/track/${order._id}`)}
                            >
                              Track
                            </button>
                          ) : (
                            <span className="text-muted">Waiting for agent</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {orders.length > ordersPerPage && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-outline-primary"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <span className="fw-semibold">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-outline-primary"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
