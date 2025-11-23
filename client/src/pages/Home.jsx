import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiArrowRight,
  FiSearch,
  FiStar,
} from "react-icons/fi";

export default function Home() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [topPicks, setTopPicks] = useState([]);

  useEffect(() => {
    async function fetchTopPicks() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/hotels/random/");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        setTopPicks(data);
      } catch (err) {
        console.error("Failed to load top picks:", err);
      }
    }
    fetchTopPicks();
  }, []);

  const handleSearch = () => {
    navigate(
      `/results?location=${encodeURIComponent(
        location
      )}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );
  };

  return (
    <div className="bg-stone-50 text-stone-800 min-h-screen relative font-sans">
      {/* --- Decorative Background Element --- */}
      {/* A subtle emerald blob in the top right to break the flatness */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* --- Hero Section --- */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 px-4">
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-2">
            AI-Powered Travel
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 leading-tight">
            Find your <span className="text-emerald-800 italic">perfect</span>{" "}
            stay.
          </h1>
          <p className="text-stone-500 text-lg md:text-xl max-w-xl mx-auto font-light">
            Experience curated hospitality. Discover hotels tailored to your
            style, budget, and sustainability goals.
          </p>
        </div>

        {/* --- Modern Integrated Search Bar --- */}
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:divide-x divide-stone-100">
            {/* Location */}
            <div className="relative flex-1 p-2 group hover:bg-stone-50 transition">
              <div className="px-4 py-2">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Destination
                </label>
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-emerald-700" />
                  <input
                    type="text"
                    placeholder="Where to?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent font-medium text-stone-900 placeholder-stone-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Check In */}
            <div className="relative md:w-48 p-2 hover:bg-stone-50 transition">
              <div className="px-4 py-2">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Check In
                </label>
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-emerald-700" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent font-medium text-stone-900 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Check Out */}
            <div className="relative md:w-48 p-2 hover:bg-stone-50 transition">
              <div className="px-4 py-2">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Check Out
                </label>
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-emerald-700" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent font-medium text-stone-900 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="relative md:w-40 p-2 hover:bg-stone-50 transition">
              <div className="px-4 py-2">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Guests
                </label>
                <div className="flex items-center gap-2">
                  <FiUsers className="text-emerald-700" />
                  <input
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-transparent font-medium text-stone-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="p-3">
              <button
                onClick={handleSearch}
                className="w-full md:w-auto h-full min-h-[50px] px-8 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
              >
                <FiSearch /> <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Top Picks Section --- */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">
              Curated for you
            </h2>
            <p className="text-stone-500 mt-2">
              Top rated stays in India chosen by our algorithms.
            </p>
          </div>
          <a
            href="/results"
            className="hidden md:flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-800 transition"
          >
            View all stays <FiArrowRight />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {topPicks.length === 0
            ? /* Loading Skeletons */
              [1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100"
                >
                  <div className="w-full h-64 bg-stone-200 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-stone-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-stone-200 rounded w-1/2 animate-pulse" />
                    <div className="pt-4 flex justify-between">
                      <div className="h-5 bg-stone-200 rounded w-1/4 animate-pulse" />
                      <div className="h-5 bg-stone-200 rounded w-1/4 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            : /* Real Cards */
              topPicks.map((hotel) => {
                const image =
                  Array.isArray(hotel.images) && hotel.images.length
                    ? hotel.images[0]
                    : "/placeholder.jpg";
                const city = hotel.city ?? "";
                const rating = hotel.rating ?? null;
                const link = `/results?location=${encodeURIComponent(
                  city || hotel.name
                )}`;

                return (
                  <a
                    key={hotel.id}
                    href={link}
                    className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-stone-100"
                  >
                    {/* Image Container */}
                    <div className="relative w-full h-64 overflow-hidden">
                      <img
                        src={image}
                        alt={hotel.name}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      {/* Floating Rating Badge */}
                      {rating && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-stone-900 flex items-center gap-1 shadow-sm">
                          <FiStar className="text-amber-500 fill-amber-500" />
                          {rating}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-stone-900 group-hover:text-emerald-800 transition">
                            {hotel.name}
                          </h3>
                          <p className="text-stone-500 text-sm flex items-center gap-1 mt-1">
                            <FiMapPin className="text-stone-400" /> {city}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center">
                        <div>
                          <span className="text-sm text-stone-400">from</span>
                          <span className="block text-xl font-bold text-stone-900">
                            ₹{hotel.price_per_night?.toLocaleString() ?? "N/A"}
                          </span>
                        </div>
                        <span className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition">
                          <FiArrowRight />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <a
            href="/results"
            className="inline-flex items-center gap-2 text-emerald-700 font-bold"
          >
            View all stays <FiArrowRight />
          </a>
        </div>
      </section>
    </div>
  );
}
