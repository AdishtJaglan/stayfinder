import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiStar,
  FiMapPin,
  FiDollarSign,
  FiTag,
  FiBookOpen,
} from "react-icons/fi";

const DetailSkeleton = () => (
  <div className="bg-stone-50 min-h-screen text-stone-800 animate-pulse">
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
      <div className="h-4 w-32 bg-stone-300 rounded mb-8"></div>

      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-1/2 bg-stone-300 rounded"></div>
        <div className="h-4 w-1/3 bg-stone-200 rounded"></div>
      </div>

      {/* Image Carousel Skeleton */}
      <div className="relative flex gap-4 overflow-x-auto">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="min-w-[90%] md:min-w-[60%] lg:min-w-[40%] h-80 relative rounded-lg bg-stone-200"
          />
        ))}
      </div>

      {/* Pricing Block Skeleton */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white border border-stone-200 rounded-lg shadow-sm p-6 gap-6">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 bg-stone-200 rounded"></div>
          <div className="h-6 w-2/3 bg-stone-300 rounded"></div>
        </div>
        <div className="w-px h-10 bg-stone-200 hidden md:block" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 bg-stone-200 rounded"></div>
          <div className="h-6 w-2/3 bg-stone-300 rounded"></div>
        </div>
        <div className="h-12 w-full md:w-48 bg-emerald-700 rounded-md"></div>
      </div>

      {/* Description Skeleton */}
      <div className="border-b border-stone-200 pb-8 space-y-3">
        <div className="h-6 w-1/4 bg-stone-300 rounded"></div>
        <div className="h-4 w-full bg-stone-200 rounded"></div>
        <div className="h-4 w-11/12 bg-stone-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default function HotelDetail() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedIndex, setLoadedIndex] = useState({});

  useEffect(() => {
    if (!id) {
      setError("No hotel ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchHotel = async () => {
      setIsLoading(true);
      setError(null);

      const API_URL = `http://127.0.0.1:8000/api/hotels/${id}/`;

      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Hotel not found.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setHotel(data);
      } catch (e) {
        console.error("Fetching hotel details failed:", e);
        setError(e.message || "Failed to fetch hotel details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !hotel) {
    return (
      <div className="p-10 text-center bg-stone-50 min-h-screen text-stone-800">
        <h2 className="text-2xl font-serif font-bold mb-4">
          {error || "Stay Details Not Found"}
        </h2>
        <p className="mb-4 text-stone-600">
          {error
            ? "There was an issue retrieving the hotel details."
            : "The hotel you're looking for doesn't seem to exist."}
        </p>
        <Link
          to="/results"
          className="px-4 py-2 border border-emerald-700 text-emerald-700 rounded-md hover:bg-emerald-700 hover:text-white transition"
        >
          ← Explore Other Stays
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen text-stone-800">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
        <Link
          to="/results"
          className="text-stone-600 hover:text-emerald-700 transition flex items-center gap-1.5"
        >
          ← **Back to results**
        </Link>

        {/* --- Header Section --- */}
        <header className="space-y-2">
          {/* Serif font for the premium name */}
          <h1 className="text-4xl font-serif font-bold text-stone-900">
            {hotel.name}
          </h1>
          <p className="text-lg text-stone-600 flex items-center gap-2">
            <FiMapPin className="text-stone-500" />
            {hotel.address}
          </p>
        </header>

        {/* --- Image Carousel --- */}
        <div className="relative flex gap-4 overflow-x-auto">
          {Array.isArray(hotel.images) &&
            hotel.images.map((img, idx) => {
              const blurImg = hotel.blurPlaceholder;
              const alt = hotel.images_alt?.[idx] || hotel.name;
              const isLoaded = loadedIndex[idx];

              return (
                <div
                  key={idx}
                  className="min-w-[90%] md:min-w-[60%] lg:min-w-[40%] h-80 relative rounded-lg shadow-md overflow-hidden bg-stone-200"
                >
                  {/* Blur placeholder */}
                  <img
                    src={blurImg}
                    className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${
                      isLoaded
                        ? "opacity-0 blur-0"
                        : "opacity-100 blur-sm scale-105"
                    }`}
                    alt={alt + " blur"}
                  />

                  {/* Real image */}
                  <img
                    src={img}
                    loading="lazy"
                    alt={alt}
                    onLoad={() =>
                      setLoadedIndex((prev) => ({ ...prev, [idx]: true }))
                    }
                    className={`w-full h-full object-cover transition duration-700 ${
                      isLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              );
            })}
        </div>

        {/* --- Pricing & Rating Block --- */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white border border-stone-200 rounded-lg shadow-sm p-6 gap-6">
          <div className="flex-1">
            <p className="text-sm text-stone-600 flex items-center gap-1.5 mb-1">
              <FiDollarSign className="text-emerald-700" /> Price per night
            </p>
            <p className="text-3xl font-bold text-emerald-800">
              {hotel.price_per_night?.toLocaleString() || "N/A"}
            </p>
          </div>

          <div className="w-px h-10 bg-stone-200 hidden md:block" />

          <div className="flex-1">
            <p className="text-sm text-stone-600 flex items-center gap-1.5 mb-1">
              <FiStar className="text-amber-500 fill-amber-500" /> Guest Rating
            </p>
            <p className="text-3xl font-bold text-stone-900">
              {hotel.rating} / 5.0
            </p>
          </div>

          {/* Booking button moved here for quick access */}
          <Link
            to="#" // Actual booking link
            className="w-full md:w-auto px-8 py-3 bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800 transition text-lg text-center shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              alert(`Attempting to book ${hotel.name}!`);
            }}
          >
            Book Stay Now
          </Link>
        </div>

        {/* --- Description --- */}
        <section className="border-b border-stone-200 pb-8">
          <h2 className="text-2xl font-serif font-bold mb-3 text-stone-900">
            About the Property
          </h2>
          <p className="text-stone-700 text-lg leading-relaxed">
            {hotel.description}
          </p>
        </section>

        {/* --- Amenities & SDG in two columns --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Amenities */}
          <section>
            <h2 className="text-xl font-serif font-bold mb-4 text-stone-900 flex items-center gap-2">
              <FiTag className="text-emerald-700" /> Key Amenities
            </h2>
            <div className="flex flex-wrap gap-3">
              {Array.isArray(hotel.amenities) &&
                hotel.amenities.map((a) => (
                  <span
                    key={a}
                    className="bg-stone-100 border border-stone-300 px-4 py-2 rounded-full text-sm text-stone-700 font-medium"
                  >
                    {a}
                  </span>
                ))}
            </div>
          </section>

          {/* SDG Tags */}
          <section>
            <h3 className="text-xl font-serif font-bold mb-4 text-stone-900 flex items-center gap-2">
              <FiBookOpen className="text-emerald-700" /> Sustainability Focus
            </h3>
            <div className="flex gap-3 flex-wrap">
              {Array.isArray(hotel.sdg_tags) &&
                hotel.sdg_tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-full font-semibold"
                  >
                    SDG {tag}
                  </span>
                ))}
            </div>
          </section>
        </div>

        {/* --- Why AI Picked --- */}
        <section className="bg-emerald-50 border border-emerald-200 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-emerald-900 flex items-center gap-2">
            <FiStar className="text-emerald-700" /> AI Recommendation Insight
          </h3>
          <p className="text-stone-700 text-sm">{hotel.why_ai_picked}</p>
        </section>

        {/* Footer spacing */}
        <div className="h-10"></div>
      </div>
    </div>
  );
}
