import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../api";
const AgentDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/api/orders/agent-orders", {
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/api/orders/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order accepted successfully");
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

 const handleReject = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await api.patch(
      `/api/orders/reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("Order rejected successfully");
    setOrders((prev) => prev.filter((order) => order._id !== id));

  } catch (err) {
    console.error("Reject Error:", err);
  }
};

  
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
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
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
     

      <div className="container-fluid px-4">
       

        {orders.length === 0 && !loading && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 text-center">
              <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
              <h5 className="mb-2">No orders available</h5>
              <p className="text-muted mb-0">
                There are currently no pending orders in your city. Orders will
                appear here when users place orders for pickup from your city.
              </p>
            </div>
          </div>
        )}

       
        {orders.length > 0 && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-list-ul me-2 text-primary"></i>
                  Pending Orders
                </h5>
                <span className="badge bg-primary rounded-pill">
                  {orders.length} Total
                </span>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive d-none d-lg-block">
                <table className="table table-hover mb-0">
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th className="border-0 py-3">User Info</th>
                      <th className="border-0 py-3">Contact</th>
                      <th className="border-0 py-3">Route</th>
                      <th className="border-0 py-3">Date</th>
                      <th className="border-0 py-3">Weight</th>
                      <th className="border-0 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="align-middle">
                          <div>
                            <div className="fw-semibold">{order.userId.name}</div>
                          </div>
                        </td>
                        <td className="align-middle">
                          <div className="small">
                            <div>
                              <i className="bi bi-envelope me-1"></i>
                              {order.userId.email}
                            </div>
                            <div>
                              <i className="bi bi-telephone me-1"></i>
                              {order.userId.phone}
                            </div>
                          </div>
                        </td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-success-subtle text-success">
                              {order.from}
                            </span>
                            <i className="bi bi-arrow-right text-muted"></i>
                            <span className="badge bg-danger-subtle text-danger">
                              {order.to}
                            </span>
                          </div>
                        </td>
                        <td className="align-middle">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="align-middle">
                          <span className="badge bg-info-subtle text-info">
                            {order.weight} kg
                          </span>
                        </td>
                        <td className="align-middle text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-success"
                              onClick={() => handleAccept(order._id)}
                              title="Accept Order"
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Accept
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleReject(order._id)}
                              title="Reject Order"
                            >
                              <i className="bi bi-x-circle me-1"></i>
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-lg-none p-3">
                {currentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="card mb-3 border shadow-sm"
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="mb-1 fw-bold">{order.userId.name}</h6>
                          <small className="text-muted">
                            ID: {order.userId._id.slice(-6)}
                          </small>
                        </div>
                        <span className="badge bg-info-subtle text-info">
                          {order.weight} kg
                        </span>
                      </div>

                      <div className="mb-2 small">
                        <div className="mb-1">
                          <i className="bi bi-envelope me-2 text-muted"></i>
                          {order.userId.email}
                        </div>
                        <div className="mb-2">
                          <i className="bi bi-telephone me-2 text-muted"></i>
                          {order.userId.phone}
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-success-subtle text-success">
                          {order.from}
                        </span>
                        <i className="bi bi-arrow-right text-muted"></i>
                        <span className="badge bg-danger-subtle text-danger">
                          {order.to}
                        </span>
                      </div>

                      <div className="mb-3 small text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(order.date).toLocaleDateString()}
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleAccept(order._id)}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          Accept Order
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReject(order._id)}
                        >
                          <i className="bi bi-x-circle me-2"></i>
                          Reject Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="card-footer bg-white border-top">
                <nav>
                  <ul className="pagination pagination-sm mb-0 justify-content-center">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${
                          currentPage === index + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => paginate(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>

                <div className="text-center mt-2">
                  <small className="text-muted">
                    Showing {indexOfFirstOrder + 1} to{" "}
                    {Math.min(indexOfLastOrder, orders.length)} of{" "}
                    {orders.length} orders
                  </small>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;