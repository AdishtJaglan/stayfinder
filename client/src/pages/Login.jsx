// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

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
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-gray-800 rounded p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Sign in to StayFinder.ai
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-400">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-gray-700 px-3 py-2 rounded"
              placeholder="e.g., adarsh"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-700 px-3 py-2 rounded"
              placeholder="your password"
              required
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black rounded flex items-center gap-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <Link to="/" className="text-sm text-gray-400 underline">
              Back home
            </Link>
          </div>
        </form>

        <div className="text-xs text-gray-500 mt-4">
          <p>Test accounts:</p>
          <ul className="list-disc pl-5">
            <li>adarsh / password123</li>
            <li>meera / letmein</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
