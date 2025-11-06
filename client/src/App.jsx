// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Results from "./pages/Results";
import HotelDetail from "./pages/HotelDetail";
import Recommend from "./pages/Recommend";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthProvider";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/hotel/:id" element={<HotelDetail />} />
            <Route path="/login" element={<Login />} />
            {/* protect recommend page so user must sign in */}
            <Route
              path="/recommend"
              element={
                <RequireAuth>
                  <Recommend />
                </RequireAuth>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
