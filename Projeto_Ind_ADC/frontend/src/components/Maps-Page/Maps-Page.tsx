import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

const MapsPage = () => {
  const server = "";
  const mapsApiKey = "";
  const mapRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const computeDistanceMeters = (p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(p2.lat - p1.lat);
    const dLng = toRad(p2.lng - p1.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371000 * c;
  };

  const sortedEvents = useMemo(() => {
    if (!center) return events;
    return [...events]
      .map((event) => ({
        ...event,
        distance: event.position ? computeDistanceMeters(center, event.position) : Number.POSITIVE_INFINITY,
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [center, events]);

  useEffect(() => {
    const loadScript = () => {
      if (document.getElementById("google-maps-script")) {
        initMap();
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = initMap;
      document.body.appendChild(script);
    };

    const initMap = async () => {
      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 3,
        mapTypeId: "hybrid",
        streetViewControl: false,
        fullscreenControl: false,
      });

      const geocoder = new window.google.maps.Geocoder();

      const setMapCenter = (location: { lat: number; lng: number }, zoom: number) => {
        map.setCenter(location);
        map.setZoom(zoom);
        setCenter(location);
      };

      const centerMapOnUserByIP = () => {
        const ipLookup = () => {
          fetch("https://ipapi.co/json/")
            .then((res) => res.json())
            .then((data) => {
              if (data.latitude && data.longitude) {
                setMapCenter({ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) }, 11);
              } else if (data.city) {
                const addr = [data.city, data.region, data.country_name].filter(Boolean).join(", ");
                geocoder.geocode({ address: addr }, (results: any, status: any) => {
                  if (status === "OK" && results[0]) {
                    const loc = results[0].geometry.location;
                    setMapCenter({ lat: loc.lat(), lng: loc.lng() }, 11);
                  }
                });
              }
            })
            .catch((err) => console.error("IP geolocation failed:", err));
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 13);
            },
            () => {
              ipLookup();
            },
            { timeout: 5000 }
          );
        } else {
          ipLookup();
        }
      };

      const addEventMarkers = async () => {
        const res = await fetch(`${server}/rest/events/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "UPCOMING" }),
        });
        const data = await res.json();
        const eventsData = data.events || [];

        eventsData.forEach((event: any) => {
          if (!event.location) return;

          geocoder.geocode({ address: event.location }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              const position = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              };

              new window.google.maps.Marker({
                position,
                map,
              });

              const infoWindow = new window.google.maps.InfoWindow({
                content: `<div><h1>${event.title}</h1><p>${event.location}</p></div>`,
              });

              const marker = new window.google.maps.Marker({
                position,
                map,
              });

              marker.addListener("click", () => {
                infoWindow.open(map, marker);
              });

              setEvents((prev) => [...prev, { ...event, position }]);
            }
          });
        });
      };

      centerMapOnUserByIP();
      addEventMarkers();
    };

    loadScript();
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "60px", width: "100%", background: "#ffffffcc", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", zIndex: 1 }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", fontWeight: "bold", fontSize: "18px" }}>
          Rooted
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => navigate("/signin")}>Sign In</button>
          <button onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ width: 320, background: "#f4f5f7", padding: 12, overflowY: "auto", borderRight: "1px solid #ddd" }}>
          <h3 style={{ margin: "0 0 12px 0" }}>Nearby events</h3>
          {sortedEvents.map((event, idx) => (
            <div key={`${event.eventId}-${idx}`} style={{ marginBottom: 12, padding: 12, borderRadius: 12, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 700 }}>{event.title}</div>
              <div style={{ fontSize: 12, color: "#555", margin: "6px 0" }}>{event.location}</div>
              {event.distance != null && event.distance !== Infinity ? (
                <div style={{ fontSize: 12, color: "#333" }}>{(event.distance / 1000).toFixed(1)} km away</div>
              ) : (
                <div style={{ fontSize: 12, color: "#999" }}>Distance unknown</div>
              )}
            </div>
          ))}
        </div>

        <div ref={mapRef} style={{ flex: 1 }} />
      </div>
    </div>
  );
};

export default MapsPage;
