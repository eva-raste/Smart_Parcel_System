import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import api from "../../api";
const FindOptimalPath = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const markersRef = useRef([]);

  const [cities, setCities] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState([]);
  const [results, setResults] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const navigate = useNavigate();

  // FETCH CITIES
  useEffect(() => {
    async function fetchCities() {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get(
          `${import.meta.env.VITE_API_URL}/api/auth/agent/allowedCities`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data && res.data.cities) {
          setCities(res.data.cities);
        }
      } catch (err) {
        console.error("Failed to fetch cities", err);
        toast.error("Failed to fetch cities");
      }
    }

    fetchCities();
  }, []);

  // FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) return navigate("/login");

      try {
        const res = await api.get(
          `${import.meta.env.VITE_API_URL}/api/profile/agent`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSource(res.data.agent.city);

      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, [navigate]);

  // INITIALIZE MAP
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [72.5714, 23.0225],
      zoom: 6,
    });
  }, []);

  // GET COORDINATES
  async function getCoordinates(location) {

  if (location === "Ahemdabad") {
    location = "Ahmedabad";
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json?access_token=${mapboxgl.accessToken}`
    );

    const data = await response.json();

    if (data.features.length > 0) {
      return data.features[0].geometry.coordinates;
    }

    return null;

  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}

  // GET ROUTE
  async function getRoute(start, end) {
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      const data = await query.json();

      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry;
      }

      return null;

    } catch (err) {
      console.error("Failed to fetch route:", err);
      return null;
    }
  }

  // CLEAR MARKERS
  function clearMarkers() {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  }

  // FIND ROUTE
  const handleClick = async (e) => {
    e.preventDefault();

    if (!source || destination.length === 0) {
      toast.error("Please select at least one destination");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        `${import.meta.env.VITE_API_URL}/api/orders/findpath`,
        {
          source,
          destinations: destination,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);

      // NEW RESPONSE
      const route = res.data.optimizedRoute;

      setResults(route);

      setTotalDistance(res.data.totalDistance);

      toast.success("Optimized route fetched!");

      if (!mapRef.current) return;

      // REMOVE OLD ROUTES
      const layers = mapRef.current.getStyle().layers;

      layers.forEach((layer) => {
        if (layer.id.startsWith("route-line")) {

          if (mapRef.current.getLayer(layer.id)) {
            mapRef.current.removeLayer(layer.id);
          }

          if (mapRef.current.getSource(layer.id)) {
            mapRef.current.removeSource(layer.id);
          }
        }
      });

      clearMarkers();

      // GET ALL COORDS
      const coordsList = await Promise.all(
        route.map((city) => getCoordinates(city))
      );

      // DRAW ROUTES
      for (let i = 0; i < coordsList.length - 1; i++) {

        const start = coordsList[i];
        const end = coordsList[i + 1];

        if (!start || !end) continue;

        const routeGeometry = await getRoute(start, end);

        if (!routeGeometry) continue;

        const layerId = `route-line-${i}`;

        if (mapRef.current.getSource(layerId)) {
          mapRef.current.removeLayer(layerId);
          mapRef.current.removeSource(layerId);
        }

        mapRef.current.addSource(layerId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: routeGeometry,
          },
        });

        mapRef.current.addLayer({
          id: layerId,
          type: "line",
          source: layerId,

          layout: {
            "line-join": "round",
            "line-cap": "round",
          },

          paint: {
            "line-color": "#FF5733",
            "line-width": 5,
          },
        });
      }

      // ADD MARKERS
      coordsList.forEach((coord, index) => {

        if (!coord) return;

        const marker = new mapboxgl.Marker({
          color: index === 0 ? "green" : "red",
        })
          .setLngLat(coord)
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      });

      // FIT MAP
      const bounds = new mapboxgl.LngLatBounds();

      coordsList.forEach((coord) => {
        if (coord) bounds.extend(coord);
      });

      mapRef.current.fitBounds(bounds, {
        padding: 50,
      });

    } catch (err) {
      console.error("Failed to fetch path", err);

      if (err.response) {
        console.log(err.response.data);
      }

      toast.error("Failed to fetch path");
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "20px auto",
        fontFamily: "Arial",
      }}
    >
      {/* SOURCE */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          <strong>Source:</strong>
        </label>

        <div
          style={{
            marginTop: "5px",
            padding: "10px",
            backgroundColor: "#d4edda",
            borderRadius: "5px",
            color: "#155724",
            fontWeight: "bold",
          }}
        >
          {source}
        </div>
      </div>

      {/* DESTINATIONS */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          <strong>Destination(s)</strong>
        </label>

        <select
          multiple
          value={destination}
          onChange={(e) =>
            setDestination(
              [...e.target.selectedOptions].map((o) => o.value)
            )
          }
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            height: "120px",
            borderRadius: "5px",
          }}
        >
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleClick}
        style={{
          padding: "12px 20px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          fontWeight: "bold",
        }}
      >
        Find Optimized Route
      </button>

      {/* MAP */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "450px",
          marginTop: "20px",
          borderRadius: "10px",
        }}
      ></div>

      {/* RESULT */}
      {results.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>Optimized Delivery Route</h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            {results.map((city, index) => (
              <React.Fragment key={index}>
                <span
                  style={{
                    padding: "8px 14px",
                    borderRadius: "20px",
                    color: "white",
                    fontWeight: "bold",
                    backgroundColor:
                      index === 0 ? "green" : "#FF5733",
                  }}
                >
                  {city}
                </span>

                {index !== results.length - 1 && (
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    →
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <p
            style={{
              marginTop: "20px",
              fontSize: "16px",
            }}
          >
            <strong>Total Distance:</strong>{" "}
            {totalDistance} km
          </p>
        </div>
      )}
    </div>
  );
};

export default FindOptimalPath;