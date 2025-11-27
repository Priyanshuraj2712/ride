import React, { useState, useRef, useEffect } from "react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN; // FIXED

const LocationSearch = ({ onSelect, placeholder }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showList, setShowList] = useState(false);

  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Debounced search
  const searchLocation = (text) => {
    setQuery(text);

    if (!text || text.length < 3) {
      setResults([]);
      setShowList(false);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          text
        )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=7&country=in`;
        console.log(url);
        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        if (!data.features) return;

        const suggestions = data.features.map((item) => ({
          address: item.place_name,
          lat: item.center[1],
          lng: item.center[0],
        }));

        setResults(suggestions);
        setShowList(true);
      } catch (err) {
        console.error("Mapbox Search Error:", err);
      }
    }, 350);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => searchLocation(e.target.value)}
        className="w-full p-3 border rounded-md shadow-sm"
      />

      {showList && results.length > 0 && (
        <ul
          className="absolute w-full bg-white border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto z-30"
        >
          {results.map((item, index) => (
            <li
              key={index}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b"
              onClick={() => {
                onSelect(item); // return selected location
                setQuery(item.address);
                setShowList(false);
                setResults([]);
              }}
            >
              {item.address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
