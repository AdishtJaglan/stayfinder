import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import HotelCard from "../components/HotelCard";
import { hotelsRich } from "../data/hotels-rich";
import { FiMapPin } from "react-icons/fi"; // Added icon

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Results() {
  const query = useQuery();
  const location = query.get("location") || "";

  const filtered = useMemo(() => {
    if (!location) return hotelsRich;
    const q = location.toLowerCase();
    return hotelsRich.filter(
      (h) =>
        h.city.toLowerCase().includes(q) || h.name.toLowerCase().includes(q)
    );
  }, [location]);

  return (
    // Use the theme's off-white background
    <div className="bg-stone-50 min-h-screen">
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Use the elegant serif font for the main heading */}
        <h2 className="text-3xl font-serif font-bold mb-8 text-stone-900 flex items-center gap-2">
          <FiMapPin className="text-stone-500" />
          <span>Showing results</span>
          {location && (
            // Highlight the search term with the accent color
            <span className="text-emerald-700">for "{location}"</span>
          )}
        </h2>

        {/* Use a larger gap for a more premium, uncrowded feel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)
          ) : (
            // Added a nice "no results" message
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
