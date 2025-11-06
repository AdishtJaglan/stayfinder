import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Gi3dHammer } from "react-icons/gi"; // Example icon

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = (path) =>
    // Muted text, with a dark green underline for the active link
    `relative px-3 py-2 text-stone-700 hover:text-emerald-800 transition
     ${
       location.pathname === path
         ? "after:content-[''] after:absolute after:left-3 after:right-3 after:bottom-1 after:h-[2px] after:bg-emerald-800"
         : ""
     }`;

  function doLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    // Off-white background with a subtle border
    <nav className="bg-stone-50 border-b border-stone-200 p-4 flex justify-between items-center">
      <Link
        to="/"
        // Use the serif font for the logo and our accent color
        className="text-2xl font-bold font-serif text-emerald-800 flex items-center gap-2"
      >
        <Gi3dHammer /> {/* Added a thematic icon */}
        StayFinder.ai
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/" className={linkClass("/")}>
          Home
        </Link>
        <Link to="/results" className={linkClass("/results")}>
          Explore
        </Link>
        <Link to="/recommend" className={linkClass("/recommend")}>
          Recommend
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-sm text-stone-700">
              Hi, <span className="font-medium">{user.name}</span>
            </div>
            <button
              onClick={doLogout}
              className="text-sm text-stone-700 hover:text-black"
            >
              Logout
            </button>
          </div>
        ) : (
          // "Ghost" button style: accent border, fills on hover
          <Link
            to="/login"
            className="px-4 py-2 border border-emerald-800 text-emerald-800 rounded-md hover:bg-emerald-800 hover:text-white transition-all duration-300"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
