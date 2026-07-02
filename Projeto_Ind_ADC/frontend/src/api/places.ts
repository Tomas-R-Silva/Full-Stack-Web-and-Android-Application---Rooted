import { useEffect, useRef, useState, type ChangeEvent } from "react";

declare global {
  interface Window {
    google: any;
    initGooglePlaces?: () => void;
  }
}

export interface PlacePrediction {
  placeId: string;
  description: string;
}

export interface PlacesAutocompleteOptions {
  apiKey: string;
  value: string;
  onChange?: (value: string) => void;
  onSelect?: (prediction: PlacePrediction) => void;
}

export interface PlacesAutocompleteResult {
  inputValue: string;
  predictions: PlacePrediction[];
  loading: boolean;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSelect: (prediction: PlacePrediction) => void;
}

interface BiasLocation {
  lat: number;
  lng: number;
}

let placesScriptPromise: Promise<void> | null = null;

function loadGooglePlacesScript(apiKey: string): Promise<void> {
  if (window.google?.maps?.places) return Promise.resolve();

  if (placesScriptPromise) return placesScriptPromise;

  placesScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("google-places-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Places script")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "google-places-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces&loading=async`;
    script.async = true;
    script.defer = true;

    window.initGooglePlaces = () => resolve();

    script.onerror = () => reject(new Error("Failed to load Google Places script"));
    document.body.appendChild(script);
  });

  return placesScriptPromise;
}

async function getCurrentBiasLocation(): Promise<BiasLocation | null> {
  if (!navigator.geolocation) return null;

  return await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  });
}

export async function fetchPlacePredictions(
  apiKey: string,
  input: string,
  biasLocation?: BiasLocation | null,
): Promise<PlacePrediction[]> {
  if (!input.trim() || !apiKey) return [];

  try {
    await loadGooglePlacesScript(apiKey);

    const service = new window.google.maps.places.AutocompleteService();

    return await new Promise((resolve) => {
      const request: any = {
        input,
        types: ["geocode"],
      };

      if (biasLocation) {
        request.location = new window.google.maps.LatLng(
          biasLocation.lat,
          biasLocation.lng,
        );
        request.radius = 5000;
      }

      service.getPlacePredictions(request, (predictions: any[], status: string) => {
        console.log("Autocomplete status:", status);
        console.log("Autocomplete predictions:", predictions);

        const results = Array.isArray(predictions)
          ? predictions.map((item: any) => ({
              placeId: item.place_id,
              description: item.description,
            }))
          : [];

        resolve(results);
      });
    });
  } catch (err) {
    console.error("Places autocomplete failed:", err);
    return [];
  }
}

export function usePlacesAutocomplete({
  apiKey,
  value,
  onChange,
  onSelect,
}: PlacesAutocompleteOptions): PlacesAutocompleteResult {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [biasLocation, setBiasLocation] = useState<BiasLocation | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    let active = true;

    void (async () => {
      const location = await getCurrentBiasLocation();
      if (active) {
        setBiasLocation(location);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const updateValue = (nextValue: string) => {
    setInputValue(nextValue);
    onChange?.(nextValue);
  };

  const searchPlaces = async (input: string) => {
    if (!input.trim()) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const results = await fetchPlacePredictions(apiKey, input, biasLocation);
    setPredictions(results);
    setLoading(false);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    updateValue(nextValue);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    if (!nextValue.trim()) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      void searchPlaces(nextValue);
    }, 300);
  };

  const handleSelect = (prediction: PlacePrediction) => {
    const nextValue = prediction.description;
    setInputValue(nextValue);
    setPredictions([]);
    setLoading(false);
    onChange?.(nextValue);
    onSelect?.(prediction);
  };

  return {
    inputValue,
    predictions,
    loading,
    handleInputChange,
    handleSelect,
  };
}