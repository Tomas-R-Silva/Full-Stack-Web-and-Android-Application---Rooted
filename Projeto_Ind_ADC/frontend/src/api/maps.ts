import { useEffect, useMemo, useRef, useState } from "react";
import { getEventList } from "./auth";

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

export interface EventItem {
  eventId: string;
  title: string;
  location: string;
  position?: { lat: number; lng: number };
  distance?: number;
  [key: string]: any;
}

interface MarkerEntry {
  marker: any;
  infoWindow: any;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

export const computeDistanceMeters = (
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) *
      Math.cos(toRad(p2.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371000 * c;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useMapsPage = (mapsApiKey: string) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<any | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const activeInfoWindowRef = useRef<any | null>(null);

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [hasGeolocation, setHasGeolocation] = useState(false);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------

  const sortedEvents = useMemo<EventItem[]>(() => {
    return [...events]
      .map((event) => ({
        ...event,
        distance:
          hasGeolocation && center && event.position
            ? computeDistanceMeters(center, event.position)
            : -1,
      }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [center, events, hasGeolocation]);

  // -------------------------------------------------------------------------
  // Map actions (stable refs via mapInstanceRef / markersRef)
  // -------------------------------------------------------------------------

  const openInfoWindow = (infoWindow: any, marker: any) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (
      activeInfoWindowRef.current &&
      activeInfoWindowRef.current !== infoWindow
    ) {
      activeInfoWindowRef.current.close();
    }

    infoWindow.open(map, marker);
    activeInfoWindowRef.current = infoWindow;
  };

  const focusEvent = (event: EventItem) => {
    const map = mapInstanceRef.current;
    if (!map || !event.position) return;

    map.panTo(event.position);
    map.setZoom(15);
    setActiveEventId(event.eventId);

    const entry = markersRef.current.get(event.eventId);
    if (entry) {
      openInfoWindow(entry.infoWindow, entry.marker);
    }
  };

  // -------------------------------------------------------------------------
  // Map initialisation
  // -------------------------------------------------------------------------

  useEffect(() => {
    const addUserMarker = (
      map: any,
      position: { lat: number; lng: number },
    ) => {
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

    const setMapCenter = (
      map: any,
      location: { lat: number; lng: number },
      zoom: number,
    ) => {
      map.setCenter(location);
      map.setZoom(zoom);
      setCenter(location);
    };

    const centerMapOnUser = (map: any) => {
      if (!navigator.geolocation) {
        console.warn("Navigator geolocation unavailable. Using default center.");
        setMapCenter(map, { lat: 0, lng: 0 }, 3);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setMapCenter(map, userPos, 13);
          addUserMarker(map, userPos);
          setHasGeolocation(true);
        },
        () => {
          console.warn("Geolocation denied or unavailable. Using default center.");
          setHasGeolocation(false);
          setMapCenter(map, { lat: 0, lng: 0 }, 3);
        },
        { timeout: 5000 },
      );
    };

    const addMarker = (
      map: any,
      position: { lat: number; lng: number },
      event: EventItem,
    ) => {
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
        content: `
          <div>
            <h3>${event.title}</h3>
            <p>${event.location}</p>
            <a
              href="/events/${event.eventId}"
              class="btn btn-sm"
              style="background-color: var(--color-green); color: var(--color-white); border: none; display: block; width: 100%; text-align: center;"
            >
              View event
            </a>
          </div>
        `,
      });

      marker.addListener("click", () => openInfoWindow(infoWindow, marker));
      markersRef.current.set(event.eventId, { marker, infoWindow });
    };

    const renderEvents = (map: any, eventList: EventItem[]) => {
      const geocoder = new window.google.maps.Geocoder();

      eventList.forEach((event) => {
        geocoder.geocode(
          { address: event.location },
          (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              const pos = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              };
              const updatedEvent = { ...event, position: pos };
              setEvents((current) =>
                current.map((item) =>
                  item.eventId === updatedEvent.eventId ? updatedEvent : item,
                ),
              );
              addMarker(map, pos, updatedEvent);
            }
          },
        );
      });
    };

    const addEventMarkers = async (map: any) => {
      try {
        const res = await getEventList({ pageSize: 100, cursor: "" });
        const eventsData: EventItem[] =
          Array.isArray(res.data.events) && res.data.events.length > 0
            ? res.data.events
            : [];
        setEvents(eventsData);
        renderEvents(map, eventsData);
      } catch (err) {
        console.error("Failed to fetch server events:", err);
      }
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

      mapInstanceRef.current = map;

      centerMapOnUser(map);
      await addEventMarkers(map);
    };

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

    loadScript();
  }, []);

  // -------------------------------------------------------------------------
  // Exposed API
  // -------------------------------------------------------------------------

  return {
    mapRef,
    sortedEvents,
    activeEventId,
    focusEvent,
  };
};