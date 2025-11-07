import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { FiLogIn, FiArrowLeft } from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state && location.state.from) || "/recommend";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login({ username: username.trim(), password });
    setLoading(false);
    if (res.ok) {
      navigate(redirectTo, { replace: true });
    } else {
      setError(res.message || "Login failed");
    }
  }

  return (
    // Base container: Off-white background, centered, and full height
    <div className="bg-stone-50 min-h-[70vh] flex items-center justify-center p-6 text-stone-800">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-xl shadow-lg p-8 space-y-6">
        {/* Use serif font for the main heading */}
        <h2 className="text-3xl font-serif font-bold mb-6 text-stone-900 flex items-center gap-3">
          <FiLogIn className="text-emerald-700" />
          Sign in
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium mb-1 text-stone-700">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              // Themed input field
              className="w-full bg-stone-100 border border-stone-300 px-4 py-2 rounded-lg placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., adarsh"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium mb-1 text-stone-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // Themed input field
              className="w-full bg-stone-100 border border-stone-300 px-4 py-2 rounded-lg placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="your password"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm p-3 rounded-md">
              **Error:** {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              // Accent color button style
              className="px-6 py-2.5 bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800 transition flex items-center gap-2 shadow-md"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LuLoaderCircle className="animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
            <Link
              to="/"
              className="text-sm text-stone-600 hover:text-emerald-700 transition flex items-center gap-1.5"
            >
              <FiArrowLeft /> Back home
            </Link>
          </div>
        </form>

        {/* Test Accounts Hint */}
        <div className="text-xs text-stone-500 mt-6 pt-4 border-t border-stone-100">
          <p className="font-medium mb-1">Test accounts:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>**adarsh** / `password123`</li>
            <li>**meera** / `letmein`</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
