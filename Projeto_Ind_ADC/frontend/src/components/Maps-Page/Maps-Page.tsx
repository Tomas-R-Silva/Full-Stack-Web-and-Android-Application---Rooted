import { useEffect, useMemo, useRef, useState } from "react";
import NavBar from "../NavBar/NavBar";
import { getEventList } from "../../api/auth";

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

const MapsPage = () => {
  const server = import.meta.env.VITE_API_URL || "";
  const mapsApiKey = import.meta.env.VITE_API_KEY;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<any | null>(null);

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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&callback=initMap&loading=async`;
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

      const addUserMarker = (position: { lat: number; lng: number }) => {
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }
        userMarkerRef.current = new window.google.maps.Marker({
          position,
          map,
          title: "You",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "blue",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
        });
      };

      const setMapCenter = (location: { lat: number; lng: number }, zoom: number) => {
        map.setCenter(location);
        map.setZoom(zoom);
        setCenter(location);
      };

      const centerMapOnUserByIP = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setMapCenter(userPos, 13);
              addUserMarker(userPos);
            },
            () => {
              console.warn("Geolocation denied or unavailable. Using default center.");
              setMapCenter({ lat: 0, lng: 0 }, 3);
            },
            { timeout: 5000 }
          );
        } else {
          console.warn("Navigator geolocation unavailable. Using default center.");
          setMapCenter({ lat: 0, lng: 0 }, 3);
        }
      };

      const renderEvents = (eventList: any[]) => {
        eventList.forEach((event) => {
            geocoder.geocode({ address: event.location }, (results: any, status: any) => {
              if (status === "OK" && results[0]) {
                const pos = {
                  lat: results[0].geometry.location.lat(),
                  lng: results[0].geometry.location.lng(),
                };
                const updatedEvent = { ...event, position: pos };
                setEvents((current) =>
                  current.map((item) =>
                    item.eventId === updatedEvent.eventId ? updatedEvent : item
                  )
                );
                addMarker(pos, updatedEvent);
              }
            });
        });
      };

      const addMarker = (position: { lat: number; lng: number }, event: any) => {
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: event.title,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 9,
            fillColor: "green",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
        });
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div><h3>${event.title}</h3><p>${event.location}</p></div>`,
        });
        marker.addListener("click", () => infoWindow.open(map, marker));
      };

      const addEventMarkers = async () => {
        try {
          const res = await getEventList({ pageSize: 100, cursor: "" });
          const eventsData = Array.isArray(res.data.events) && res.data.events.length > 0
            ? res.data.events
            : [];
          setEvents(eventsData);
          renderEvents(eventsData);
        } catch (err) {
          console.error("Failed to fetch server events:", err);
        }
      };

      centerMapOnUserByIP();
      addEventMarkers();
    };

    loadScript();
  }, []);

  return (
    <>
      <NavBar />

      <main className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0">Events Map</h1>
            <p className="text-muted mb-0">Explore the nearby events and see their location on the map.</p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h3 className="card-title">Nearby events</h3>
                {sortedEvents.length === 0 ? (
                  <div className="alert alert-info mt-3">There are no events loadedda.</div>
                ) : (
                  sortedEvents.map((event, idx) => (
                    <div key={`${event.eventId}-${idx}`} className="mb-3 p-3 rounded bg-white border">
                      <div className="fw-bold">{event.title}</div>
                      <div className="text-muted small my-1">{event.location}</div>
                      {event.distance != null && event.distance !== Infinity ? (
                        <div className="small text-dark">{(event.distance / 1000).toFixed(1)} km away</div>
                      ) : (
                        <div className="small text-muted">Distance unknown</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="card shadow-sm h-100">
              <div className="card-body p-0" style={{ minHeight: "70vh" }}>
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MapsPage;
