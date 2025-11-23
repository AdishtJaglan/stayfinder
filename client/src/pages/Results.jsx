import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import HotelCard from "../components/HotelCard";
import { FiMapPin } from "react-icons/fi";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const HotelCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
    <div className="h-48 bg-stone-200"></div>
    <div className="p-4">
      <div className="h-4 bg-stone-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-stone-200 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-stone-200 rounded w-full mb-1"></div>
      <div className="h-3 bg-stone-200 rounded w-2/3"></div>
    </div>
  </div>
);

export default function Results() {
  const query = useQuery();
  const location = query.get("location") || "";
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true);
      setError(null);

      const API_URL = "http://127.0.0.1:8000/api/hotels/";

      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHotels(data);
      } catch (e) {
        console.error("Fetching hotels failed:", e);
        setError(e.message || "Failed to fetch hotel data.");
        setHotels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const filtered = useMemo(() => {
    if (!location) return hotels;
    const q = location.toLowerCase();

    // **Safety Check:** Ensure 'hotels' is an array before calling filter
    if (!Array.isArray(hotels)) return [];

    return hotels.filter(
      (h) =>
        h.city.toLowerCase().includes(q) || h.name.toLowerCase().includes(q)
    );
  }, [location, hotels]);

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <h2 className="text-3xl font-serif font-bold mb-8 text-stone-900 flex items-center gap-2">
          <FiMapPin className="text-stone-500" />
          <span>Showing results</span>
          {location && (
            <span className="text-emerald-700">for "{location}"</span>
          )}
        </h2>

        {/* Conditional rendering based on state */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Loading State */}
          {isLoading ? (
            // Show 6 skeletons while loading
            Array.from({ length: 6 }).map((_, index) => (
              <HotelCardSkeleton key={index} />
            ))
          ) : /* 2. Error State */
          error ? (
            <div className="col-span-full text-center py-16">
              <h3 className="text-xl font-semibold text-red-600">
                Data Fetch Error
              </h3>
              <p className="text-stone-500">Could not load hotels: {error}</p>
            </div>
          ) : /* 3. Data & No Results State */
          filtered.length > 0 ? (
            filtered.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)
          ) : (
            <div className="col-span-full text-center py-16">
              <h3 className="text-xl font-semibold text-stone-700">
                No hotels found
              </h3>
              <p className="text-stone-500">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
