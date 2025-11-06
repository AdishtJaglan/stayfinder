import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiCalendar, FiUsers, FiArrowRight } from "react-icons/fi"; // Import icons

export default function Home() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const handleSearch = () => {
    navigate(
      `/results?location=${location}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );
  };

  return (
    // Use the off-white background and elegant text colors
    <div className="bg-stone-50 text-stone-800 min-h-screen">
      <div className="flex flex-col items-center justify-center text-center py-20">
        {/* Use the serif font for the main heading */}
        <h1 className="text-5xl font-serif font-bold mb-4">
          Find your perfect stay
        </h1>
        <p className="text-stone-600 mb-10 text-lg">
          AI-powered hotel recommendations (coming soon)
        </p>

        {/* --- Enhanced Search Form --- */}
        {/* We wrap the form in a 'card' to make it stand out */}
        <div className="w-full max-w-4xl p-6 bg-white border border-stone-200 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Input with Icon */}
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Where are you going?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-stone-100 border border-stone-300 px-4 py-3 rounded-md w-full pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {/* Date Input with Icon */}
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                data-placeholder="Check-in" // For our CSS trick
                className="date-input bg-stone-100 border border-stone-300 px-4 py-3 rounded-md w-full pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {/* Date Input with Icon */}
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                data-placeholder="Check-out" // For our CSS trick
                className="date-input bg-stone-100 border border-stone-300 px-4 py-3 rounded-md w-full pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {/* Number Input with Icon */}
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="bg-stone-100 border border-stone-300 px-4 py-3 rounded-md w-full pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="mt-5 w-full md:w-auto px-8 py-3 bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800 transition text-lg"
          >
            Search
          </button>
        </div>
        {/* --- End Enhanced Search Form --- */}
      </div>

      {/* --- Enhanced "Top Picks" Section --- */}
      <section className="pb-20 w-full max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold mb-6 text-center md:text-left">
          Top Picks in India
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <a
            href="/results?location=Goa"
            className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden group transition hover:shadow-lg"
          >
            <div className="w-full h-48 bg-stone-200 flex items-center justify-center overflow-hidden">
              {/* Image Placeholder */}
              <span className="text-stone-400">Hotel Image</span>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Luxury Villa in Goa
              </h3>
              <p className="text-stone-600 mb-3">Beachside, 5-star amenities</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-emerald-800">
                  $250/night
                </span>
                <span className="flex items-center gap-1 text-emerald-700 group-hover:underline">
                  Explore <FiArrowRight className="text-sm" />
                </span>
              </div>
            </div>
          </a>

          {/* Card 2 */}
          <a
            href="/results?location=Jaipur"
            className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden group transition hover:shadow-lg"
          >
            <div className="w-full h-48 bg-stone-200 flex items-center justify-center overflow-hidden">
              <span className="text-stone-400">Hotel Image</span>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Jaipur Palace Hotel
              </h3>
              <p className="text-stone-600 mb-3">
                Heritage, cultural experience
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-emerald-800">
                  $180/night
                </span>
                <span className="flex items-center gap-1 text-emerald-700 group-hover:underline">
                  Explore <FiArrowRight className="text-sm" />
                </span>
              </div>
            </div>
          </a>

          {/* Card 3 */}
          <a
            href="/results?location=Kerala"
            className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden group transition hover:shadow-lg"
          >
            <div className="w-full h-48 bg-stone-200 flex items-center justify-center overflow-hidden">
              <span className="text-stone-400">Hotel Image</span>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Kerala Backwater Resort
              </h3>
              <p className="text-stone-600 mb-3">Houseboat, serene nature</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-emerald-800">
                  $210/night
                </span>
                <span className="flex items-center gap-1 text-emerald-700 group-hover:underline">
                  Explore <FiArrowRight className="text-sm" />
                </span>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
