import { Link } from "react-router-dom";
import { useState } from "react";
import { FiStar } from "react-icons/fi"; // Added icon

export default function HotelCard({ hotel }) {
  const primaryImg = hotel.images?.[0] || "/images/placeholder.jpg";
  const alt = hotel.images_alt?.[0] || hotel.name;
  const blurImg = hotel.blurPlaceholder || "/images/placeholder-blur.jpg";

  const [loaded, setLoaded] = useState(false);

  return (
    // Card Base: White background, light border, rounded, and shadow on hover
    <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
      {/* Image Section */}
      <div className="relative h-48 w-full bg-stone-200">
        {/* Blur placeholder */}
        <img
          src={blurImg}
          alt={`${alt} blur`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-0" : "opacity-100 blur-sm scale-105"
          }`}
        />
        {/* Actual image */}
        <img
          src={primaryImg}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Use serif font for the hotel name */}
        <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">
          {hotel.name}
        </h3>
        <p className="text-sm text-stone-600 mb-3">
          {hotel.city} • {hotel.distance_from_center_km} km from center
        </p>

        {/* Description */}
        <p className="mt-2 text-sm text-stone-700 line-clamp-2 flex-grow">
          {hotel.description}
        </p>
      </div>

      {/* Footer Section: Separated with a border */}
      <div className="p-4 border-t border-stone-200 flex items-center justify-between">
        {/* Left Side: Rating & Price */}
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <FiStar className="text-amber-500 fill-amber-500" />
            <span className="font-bold text-stone-800">{hotel.rating}</span>
          </div>
          <div className="text-sm text-stone-600">
            {/* Use accent color for the price */}
            <span className="font-bold text-lg text-emerald-800">
              ₹{hotel.price_per_night.toLocaleString()}
            </span>{" "}
            / night
          </div>
        </div>

        {/* Right Side: "Ghost" Button */}
        <Link
          to={`/hotel/${hotel.id}`}
          className="px-4 py-2 text-sm border border-emerald-800 text-emerald-800 rounded-md hover:bg-emerald-800 hover:text-white transition-all duration-300"
        >
          View
        </Link>
      </div>
    </div>
  );
}
