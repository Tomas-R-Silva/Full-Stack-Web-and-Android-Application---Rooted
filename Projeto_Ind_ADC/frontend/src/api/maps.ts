import { useEffect, useMemo, useRef, useState } from "react";
import { getEventList } from "./auth";
import { getAuthSessions } from "./auth";
import type { AuthSessionsResponse } from "../utils/types";
import { getUser } from "./auth";
import type { UserInformationResponse } from "../utils/types";

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
  lat: number;
  lng: number;
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

const hasValidCoords = (event: EventItem): boolean =>
  typeof event.lat === "number" &&
  typeof event.lng === "number" &&
  !(event.lat === 0 && event.lng === 0);

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
          hasGeolocation && center && hasValidCoords(event)
            ? computeDistanceMeters(center, { lat: event.lat, lng: event.lng })
            : -1,
      }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [center, events, hasGeolocation]);

  // -------------------------------------------------------------------------
  // Map actions
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
    if (!map || !hasValidCoords(event)) return;

    const position = { lat: event.lat, lng: event.lng };
    map.panTo(position);
    map.setZoom(15);
    setActiveEventId(event.eventId);

    const entry = markersRef.current.get(event.eventId);
    if (entry) {
      openInfoWindow(entry.infoWindow, entry.marker);
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current.clear();
  };

  const addMarkerToMap = (map: any, event: EventItem) => {
    const position = { lat: event.lat, lng: event.lng };

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
            style="background-color: var(--color-green); 
            color: var(--color-white); 
            border: none; 
            display: block; 
            width: 100%; 
            text-align: center;"
          >
            View event
          </a>
        </div>
      `,
    });

    marker.addListener("click", () => openInfoWindow(infoWindow, marker));
    markersRef.current.set(event.eventId, { marker, infoWindow });
  };

  const renderVisibleMarkers = (eventList: EventItem[]) => {
    const map = mapInstanceRef.current;
    if (!map || !window.google) return;

    clearMarkers();

    eventList.forEach((event) => {
      if (hasValidCoords(event)) {
        addMarkerToMap(map, event);
      }
    });
  };

  const setMapContainer = (node: HTMLDivElement | null) => {
    mapRef.current = node;
  };

  const getMapRef = () => mapRef.current;
  const getSortedEvents = () => sortedEvents;
  const getActiveEventId = () => activeEventId;
  const getHasGeolocation = () => hasGeolocation;

  const getFilteredEvents = (
    nearYouEnabled: boolean,
    nearYouRadiusKm: number,
    category: string | null,
    sdg: number[] | null,
    status: string | null,
    isAccessible: boolean | null,
  ) => {
    return sortedEvents.filter((event) => {
      const matchesNearYou =
        !nearYouEnabled ||
        !hasGeolocation ||
        (event.distance != null &&
          event.distance >= 0 &&
          event.distance <= nearYouRadiusKm * 1000);

      const matchesCategory = !category || event.category === category;

      const matchesSdg =
        !sdg ||
        sdg.length === 0 ||
        (Array.isArray(event.SDG) &&
          event.SDG.some((id: number) => sdg.includes(id)));

      const matchesStatus = !status || event.status === status;

      const matchesAccessible = !isAccessible || event.isAccessible === true;

      return (
        matchesNearYou &&
        matchesCategory &&
        matchesSdg &&
        matchesStatus &&
        matchesAccessible
      );
    });
  };

  const renderEventMap = async (event: EventItem, container?: HTMLDivElement | null) => {
    const mapContainer = container ?? mapRef.current;
    if (!mapContainer || !window.google) return;

    let position: { lat: number; lng: number } | null = null;

    if (hasValidCoords(event)) {
      position = { lat: event.lat, lng: event.lng };
    } else if (event.location) {
      // Should remove this in the future
      position = await geocodeAddress(event.location);
    }
    

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapContainer, {
        center: position,
        zoom: 15,
        mapTypeId: "hybrid",
        streetViewControl: false,
        fullscreenControl: false,
      });
    }

    const map = mapInstanceRef.current;
    map.setCenter(position);
    map.setZoom(15);

    new window.google.maps.Marker({
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
  };

  // Should remove this in the future
  //========== Geocoding ==========
  const geocodeAddress = (
    address: string,
  ): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!window.google) {
        resolve(null);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          resolve(null);
        }
      });
    });
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

    const addEventMarkers = async (map: any) => {
      try {
        const res = await getEventList({
          input: { category: null, status: null, organizerUsername: null, pageSize: 100, cursor: "", isAccessible: null, sdg: [] },
        });
        const eventsData: EventItem[] =
          Array.isArray(res.data.events) && res.data.events.length > 0
            ? res.data.events
            : [];

        const resolvedEvents = await Promise.all(
          eventsData.map(async (event) => {
            // Should remove this in the future
            if (event.lat === 0 && event.lng === 0 && event.location) {
              const coords = await geocodeAddress(event.location);
              if (coords) {
                return { ...event, lat: coords.lat, lng: coords.lng };
              }
            }
            return event;
          }),
        );

        setEvents(resolvedEvents);
        resolvedEvents.forEach((event) => {
          if (hasValidCoords(event)) {
            addMarkerToMap(map, event);
          }
        });
      } catch (err) {
        console.error("Failed to fetch server events:", err);
      }
    };

    const initMap = async () => {
      var coords = { lat: 0, lng: 0 };
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          const res: AuthSessionsResponse = await getAuthSessions({
            token: { jwt: token },
          });

          const userToFind = res.data.tokens[0].username;

          const res2: UserInformationResponse = await getUser({
            token: { jwt: token },
            input: {
              username: userToFind,
            },
          });

          const country = res2.data.country;
          const possibleCoords = await geocodeAddress(country);
          if (possibleCoords) {
            coords = possibleCoords;
          }
        }
      } catch (err) {
        console.error(err);
      }

      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: coords.lat, lng: coords.lng },
        zoom: 2,
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
  }, [mapsApiKey]);

  return {
    setMapContainer,
    getMapRef,
    getSortedEvents,
    getActiveEventId,
    getHasGeolocation,
    getFilteredEvents,
    focusEvent,
    renderEventMap,
    renderVisibleMarkers,
    geocodeAddress,
    hasValidCoords,
  };
};