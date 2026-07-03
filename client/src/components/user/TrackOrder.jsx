import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { io } from "socket.io-client";
import api from "../../api";
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; 

const TrackOrder = () => {
  const socket = io(import.meta.env.VITE_API_URL);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [city, setCity] = useState("");

  
    useEffect(() => {

    socket.on("order-location-updated", (data) => {

      console.log("Live update:", data);

      if (data.orderId === id) {

        setOrder((prev) => ({
          ...prev,
          currlocation: data.currlocation,
        }));

        setCity(data.currlocation);
      }
    });

    return () => {
      socket.off("order-location-updated");
    };

  }, [id]);

  const fetchOrder = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ No token found, user unauthorized");
        return;
      }

      const res = await api.get(`${import.meta.env.VITE_API_URL}/api/orders/userOrders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const found = res.data.orders.find((o) => o._id === id);
      if (found) {
        setOrder(found);
        setCity(found.currlocation || "");
        console.log("✅ Order fetched:", found);
      } else {
        console.warn("⚠️ Order not found for ID:", id);
      }
    } catch (err) {
      console.error("❌ Error fetching order:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

useEffect(() => {
  if (!mapContainerRef.current || mapRef.current) return;

  mapRef.current = new mapboxgl.Map({
    container: mapContainerRef.current,
    style: "mapbox://styles/mapbox/streets-v12",
    center: [78.9629, 20.5937], // 🇮🇳 India center fallback
    zoom: 4,
  });

  mapRef.current.on("load", () => {
    console.log("🗺️ Map fully loaded ✅");
  });
}, [order]);


  const getCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          location
        )}.json?country=IN&access_token=${mapboxgl.accessToken}`
      );

      const data = await response.json();

      if (data.features.length > 0) {
        console.log("📍 Found coordinates for", location, ":", data.features[0].geometry.coordinates);
        return data.features[0].geometry.coordinates; // [lng, lat]
      } else {
        console.warn("⚠️ No coordinates found for:", location);
        return null;
      }
    } catch (err) {
      console.error("❌ Geocoding failed:", err);
      return null;
    }
  };

useEffect(() => {
  (async () => {
    if (!city || !mapRef.current) return;

    if (!mapRef.current.loaded()) {
      mapRef.current.once("load", async () => {
        await updateMarker(city);
      });
    } else {
      await updateMarker(city);
    }
  })();
}, [city]);

const updateMarker = async (cityName) => {
  const coords = await getCoordinates(cityName);
  if (!coords) return;

  markersRef.current.forEach((m) => m.remove());
  markersRef.current = [];

  const marker = new mapboxgl.Marker({ color: "green" })
    .setLngLat(coords)
    .addTo(mapRef.current);

  markersRef.current.push(marker);

  mapRef.current.flyTo({ center: coords, zoom: 9, essential: true });
};


  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const calculatedAmount = order.weight * 100;

      const res = await api.post(
        `${import.meta.env.VITE_API_URL}/api/orders/create-order`,
        { orderId: id, amount: calculatedAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, key } = res.data;
      const options = {
        key,
        amount: (order.weight *100 ) ,
        currency: "INR",
        name: "Samaan Parcel",
        description: "Order Payment",
        order_id: orderId,
        handler: async function (response) {
          await api.post(
            `${import.meta.env.VITE_API_URL}/api/orders/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: id,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          await fetchOrder();
        },
        prefill: {
          name: order.userId?.name || "Customer",
          email: order.userId?.email || "customer@example.com",
          contact: order.userId?.phone || "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error("❌ Payment error:", err);
    }
  };

  if (!order) return <p>Loading...</p>;

  return (
    <div className="container p-4">
      <h3 className="mb-3">Track Your Order</h3>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Agent:</strong> {order.agent?.name || "Not Assigned"}</p>
      <p><strong>Weight:</strong> {order.weight}</p>
      <p><strong>Amount:</strong> ₹{order.weight ? order.weight * 100 : 0}</p>
      <p><strong>From:</strong> {order.from}</p>
      <p><strong>To:</strong> {order.to}</p>
      <p><strong>Current Location:</strong> {order.currlocation}</p>
      

      {order.status !== "PAID" && (
        <button
          onClick={handlePayment}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
        >
          Pay Now
        </button>
      )}

      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "400px",
          marginTop: "20px",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default TrackOrder;
