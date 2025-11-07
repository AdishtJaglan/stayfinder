import { useEffect, useMemo, useState, useRef } from "react";
import HotelCard from "../components/HotelCard";
import { hotelsRich } from "../data/hotels-rich";
import { useAuth } from "../context/AuthProvider";
import {
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiCheckCircle,
  FiAward,
  FiList,
  FiArrowRight,
  FiArrowLeft,
  FiRotateCcw,
  FiSave,
} from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

const hotels = hotelsRich;
const TRIP_TYPES = [
  "business",
  "family",
  "romantic",
  "beach",
  "nature",
  "cultural",
  "budget",
  "luxury",
];
const AMENITIES = [
  "Wifi",
  "Breakfast",
  "Pool",
  "Gym",
  "Spa",
  "Sea View",
  "Lake View",
  "Workspace",
  "Boat Tours",
  "Hiking Access",
  "Cultural Shows",
];
const DEFAULT_QUIZ = {
  tripType: "family",
  minBudget: 0,
  maxBudget: 20000,
  amenities: [],
  locationPref: "",
  guests: 2,
  sdg: "",
};
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function StepHeader({ icon, text }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-lg font-serif text-stone-800">{text}</h3>
    </div>
  );
}

export default function Recommend() {
  const { user, updateProfile } = useAuth();
  const saved = user && user.quizAnswers ? user.quizAnswers : null;
  const [quiz, setQuiz] = useState(saved ?? DEFAULT_QUIZ);

  const [step, setStep] = useState(0);
  const totalSteps = 5;

  const [isThinking, setIsThinking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [traceLines, setTraceLines] = useState([]);
  const traceTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (user && user.quizAnswers) {
      setQuiz(user.quizAnswers);
    }
  }, [user]);

  function updateQuiz(patch) {
    setQuiz((q) => ({ ...q, ...patch }));
  }

  function toggleAmenity(name) {
    setQuiz((q) => {
      const has = q.amenities.includes(name);
      return {
        ...q,
        amenities: has
          ? q.amenities.filter((a) => a !== name)
          : [...q.amenities, name],
      };
    });
  }

  function goNext() {
    setStep((s) => clamp(s + 1, 0, totalSteps - 1));
  }
  function goBack() {
    setStep((s) => clamp(s - 1, 0, totalSteps - 1));
  }
  function resetQuiz() {
    setQuiz(DEFAULT_QUIZ);
    setResults(null);
    setStep(0);
    setTraceLines([]);
    setProgress(0);
  }

  function scoreAndExplain(hotel, quizAnswers) {
    let score = 0;
    const reasons = [];

    score += hotel.rating * 12;
    reasons.push(
      `Rated ${hotel.rating.toFixed(1)} — we prefer highly-rated stays.`
    );

    const withinBudget =
      hotel.price_per_night >= quizAnswers.minBudget &&
      hotel.price_per_night <= quizAnswers.maxBudget;
    if (withinBudget) {
      score += 25;
      reasons.push(
        `Price ₹${hotel.price_per_night} fits your budget (₹${quizAnswers.minBudget}–₹${quizAnswers.maxBudget}).`
      );
    } else {
      const diff =
        hotel.price_per_night < quizAnswers.minBudget
          ? quizAnswers.minBudget - hotel.price_per_night
          : hotel.price_per_night - quizAnswers.maxBudget;
      const penalty = Math.min(15, Math.floor(diff / 1500));
      score -= penalty;
      reasons.push(
        `Price is slightly ${
          hotel.price_per_night < quizAnswers.minBudget ? "below" : "above"
        } your budget (penalty ${penalty}).`
      );
    }

    if (hotel.ideal_for.includes(quizAnswers.tripType)) {
      score += 22;
      reasons.push(`Matches your trip type (“${quizAnswers.tripType}”).`);
    } else {
      const tagMatch = hotel.tags.some((t) =>
        t.toLowerCase().includes(quizAnswers.tripType)
      );
      if (tagMatch) {
        score += 10;
        reasons.push(`Partially matches trip type through tags.`);
      } else {
        reasons.push(
          `Not a direct ${quizAnswers.tripType} pick, but still worth considering.`
        );
      }
    }

    const amenMatches = quizAnswers.amenities.filter((a) =>
      hotel.amenities.includes(a)
    );
    if (amenMatches.length > 0) {
      const add = amenMatches.length * 8;
      score += add;
      reasons.push(
        `Has ${amenMatches.join(", ")} which you requested (+${add}).`
      );
    } else {
      reasons.push(`Doesn't match your selected amenities exactly.`);
    }

    if (quizAnswers.locationPref.trim()) {
      const q = quizAnswers.locationPref.trim().toLowerCase();
      if (hotel.city.toLowerCase() === q) {
        score += 18;
        reasons.push(
          `Located in ${hotel.city} — matches your location preference.`
        );
      } else if (
        hotel.city.toLowerCase().includes(q) ||
        hotel.name.toLowerCase().includes(q)
      ) {
        score += 8;
        reasons.push(
          `Partial match on location (“${quizAnswers.locationPref}”).`
        );
      } else {
        reasons.push(`Different location than your preference.`);
      }
    }

    if (quizAnswers.sdg) {
      if (hotel.sdg_tags.includes(quizAnswers.sdg)) {
        score += 12;
        reasons.push(`Supports SDG ${quizAnswers.sdg}, which you prioritized.`);
      } else {
        reasons.push(`Does not list SDG ${quizAnswers.sdg}.`);
      }
    }

    const distPenalty = Math.min(8, Math.floor(hotel.distance_from_center_km));
    score -= distPenalty;
    reasons.push(
      `Distance from center: ${hotel.distance_from_center_km} km (penalty ${distPenalty}).`
    );

    const normalized = Math.round(clamp(score, -50, 120));
    const reasonText = reasons.join(" ");
    return { score: normalized, reasonParts: reasons, reasonText };
  }

  function runRecommendation() {
    if (updateProfile) {
      updateProfile({ quizAnswers: quiz });
    }

    setIsThinking(true);
    setResults(null);
    setTraceLines([]);
    setProgress(0);

    const lines = [
      "Analyzing your preferences...",
      "Matching hotels with similar profiles...",
      "Scoring results by rating, budget-fit and amenities...",
      "Checking sustainability and local-fit...",
      "Compiling top recommendations...",
    ];

    let revealIndex = 0;
    traceTimerRef.current && clearInterval(traceTimerRef.current);
    traceTimerRef.current = setInterval(() => {
      setTraceLines((prev) => [...prev, lines[revealIndex]]);
      revealIndex += 1;
      if (revealIndex >= lines.length) {
        clearInterval(traceTimerRef.current);
      }
    }, 700);

    const totalDuration = 3000;
    const tickInterval = 80;
    const ticks = Math.ceil(totalDuration / tickInterval);
    let t = 0;
    progressTimerRef.current && clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      t += 1;
      setProgress(Math.round((t / ticks) * 100));
      if (t >= ticks) {
        clearInterval(progressTimerRef.current);
      }
    }, tickInterval);

    setTimeout(() => {
      const scored = hotels
        .map((h) => {
          const { score, reasonParts, reasonText } = scoreAndExplain(h, quiz);
          return { hotel: h, score, reasonParts, reasonText };
        })
        .filter((r) => r.score > 10)
        .sort((a, b) => b.score - a.score);

      setResults(scored);
      setIsThinking(false);
      setProgress(100);

      if (updateProfile) {
        const topIds = scored.slice(0, 6).map((r) => r.hotel.id);
        updateProfile({
          lastRecommendations: topIds,
          quizAnswers: quiz,
          lastRecommendedAt: new Date().toISOString(),
        });
      }
    }, totalDuration + 3500);
  }

  useEffect(() => {
    return () => {
      if (traceTimerRef.current) clearInterval(traceTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const topSummary = useMemo(() => {
    if (!results || results.length === 0) return null;
    const top = results[0];
    return {
      title: `Top pick: ${top.hotel.name}`,
      text: `Scored ${top.score}. ${top.reasonParts.slice(1, 3).join(" ")}`,
    };
  }, [results]);

  return (
    <div className="bg-stone-50 min-h-screen text-stone-800">
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            Personalized Recommendations
          </h1>
          {user && (
            <div className="text-sm text-stone-600">
              Signed in as{" "}
              <span className="font-medium text-emerald-800">{user.name}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Quiz Sidebar --- */}
          <aside className="lg:col-span-1 bg-white border border-stone-200 rounded-lg shadow-sm p-6 space-y-6 h-fit sticky top-10">
            <div>
              <div className="text-sm text-stone-600 mb-2">
                Step {step + 1} of {totalSteps}
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-emerald-700 transition-all duration-300"
                  style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {isThinking ? (
              <div className="text-center py-6">
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <FaSpinner className="animate-spin text-emerald-700" />
                    <div className="text-sm font-medium text-emerald-800">
                      Curating your stays...
                    </div>
                  </div>
                </div>

                <div className="text-xs text-stone-500 mb-2">
                  Progress: {progress}%
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-2 bg-emerald-700 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="text-left text-sm space-y-2">
                  {traceLines.map((t, i) => (
                    <div key={i} className="text-stone-600 flex gap-2">
                      <span className="text-emerald-700">✓</span> {t}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <div>
                    <StepHeader
                      icon={<FiCalendar className="text-emerald-700" />}
                      text="What type of trip is this?"
                    />
                    <div className="flex flex-wrap gap-2">
                      {TRIP_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => updateQuiz({ tripType: t })}
                          className={`px-3 py-1.5 text-sm border rounded-full transition-all ${
                            quiz.tripType === t
                              ? "bg-emerald-700 text-white border-emerald-700"
                              : "border-stone-300 text-stone-700 hover:border-emerald-600"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <StepHeader
                      icon={<FiDollarSign className="text-emerald-700" />}
                      text="Budget per night (₹)"
                    />
                    <div className="flex gap-3 items-center">
                      <input
                        type="number"
                        placeholder="Min"
                        value={quiz.minBudget || ""}
                        onChange={(e) =>
                          updateQuiz({ minBudget: Number(e.target.value || 0) })
                        }
                        className="w-1/2 bg-stone-100 border border-stone-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-stone-500">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={quiz.maxBudget || ""}
                        onChange={(e) =>
                          updateQuiz({ maxBudget: Number(e.target.value || 0) })
                        }
                        className="w-1/2 bg-stone-100 border border-stone-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="text-xs text-stone-500 mt-2">
                      Tip: wider ranges return broader matches.
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <StepHeader
                      icon={<FiCheckCircle className="text-emerald-700" />}
                      text="Which amenities matter most?"
                    />
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-auto pr-2">
                      {AMENITIES.map((a) => (
                        <label
                          key={a}
                          className="text-sm flex items-center gap-2 text-stone-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={quiz.amenities.includes(a)}
                            onChange={() => toggleAmenity(a)}
                            className="h-4 w-4 accent-emerald-700 rounded"
                          />
                          <span>{a}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <StepHeader
                      icon={<FiMapPin className="text-emerald-700" />}
                      text="Location preference"
                    />
                    <input
                      value={quiz.locationPref}
                      onChange={(e) =>
                        updateQuiz({ locationPref: e.target.value })
                      }
                      placeholder="City or area (e.g., Goa, New Delhi)"
                      className="w-full bg-stone-100 border border-stone-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <StepHeader
                      icon={<FiUsers className="text-emerald-700" />}
                      text="Guests"
                    />
                    <input
                      type="number"
                      min="1"
                      value={quiz.guests}
                      onChange={(e) =>
                        updateQuiz({ guests: Number(e.target.value || 1) })
                      }
                      className="w-32 bg-stone-100 border border-stone-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <StepHeader
                      icon={<FiAward className="text-emerald-700" />}
                      text="Sustainability preference"
                    />
                    <input
                      value={quiz.sdg}
                      onChange={(e) => updateQuiz({ sdg: e.target.value })}
                      placeholder="SDG number (e.g., 12) (Optional)"
                      className="w-full bg-stone-100 border border-stone-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <StepHeader
                      icon={<FiList className="text-emerald-700" />}
                      text="Quick summary"
                    />
                    <div className="text-sm text-stone-700 space-y-2 bg-stone-50 p-3 rounded-md border border-stone-200">
                      <div>
                        <strong className="text-stone-900">Trip:</strong>{" "}
                        <span className="text-emerald-800 font-medium">
                          {quiz.tripType}
                        </span>
                      </div>
                      <div>
                        <strong className="text-stone-900">Budget:</strong>{" "}
                        <span className="text-emerald-800 font-medium">
                          ₹{quiz.minBudget}–₹{quiz.maxBudget}
                        </span>
                      </div>
                      <div>
                        <strong className="text-stone-900">Amenities:</strong>{" "}
                        <span className="text-emerald-800 font-medium">
                          {quiz.amenities.length
                            ? quiz.amenities.join(", ")
                            : "Any"}
                        </span>
                      </div>
                      <div>
                        <strong className="text-stone-900">Location:</strong>{" "}
                        <span className="text-emerald-800 font-medium">
                          {quiz.locationPref || "Any"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- Navigation Buttons --- */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-stone-200">
                  <div className="flex gap-2">
                    {step > 0 && (
                      <button
                        onClick={goBack}
                        className="px-4 py-2 border border-stone-400 text-stone-600 rounded-md hover:bg-stone-100 transition text-sm font-medium flex items-center gap-1.5"
                      >
                        <FiArrowLeft /> Back
                      </button>
                    )}
                    {step < totalSteps - 1 ? (
                      <button
                        onClick={goNext}
                        className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800 transition text-sm flex items-center gap-1.5"
                      >
                        Next <FiArrowRight />
                      </button>
                    ) : (
                      <button
                        onClick={runRecommendation}
                        className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800 transition text-sm"
                      >
                        Get Recommendations
                      </button>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={resetQuiz}
                      title="Reset Quiz"
                      className="p-2 border border-stone-400 text-stone-600 rounded-md hover:bg-stone-100 transition"
                    >
                      <FiRotateCcw />
                    </button>
                  </div>
                </div>
              </>
            )}
          </aside>

          <main className="lg:col-span-2 space-y-8">
            {isThinking && (
              <div className="p-6 bg-white border border-stone-200 rounded-lg shadow-sm">
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                  Thinking...
                </h3>
                <p className="text-stone-600 mb-6">
                  Our AI is generating personalised matches for you. This
                  usually takes a few seconds.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-4 border border-stone-200 rounded-lg"
                    >
                      <div className="h-40 bg-stone-200 rounded mb-3" />
                      <div className="h-5 bg-stone-200 w-3/4 mb-2 rounded" />
                      <div className="h-4 bg-stone-200 w-1/2 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isThinking && results && (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-stone-900">
                      Recommended for you
                    </h2>
                    <p className="text-stone-600">
                      Based on your answers
                      {quiz.locationPref ? ` for ${quiz.locationPref}` : ""}.
                    </p>
                  </div>

                  {topSummary && (
                    <div className="text-sm bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-right max-w-xs shrink-0">
                      <div className="font-semibold text-emerald-900">
                        {topSummary.title}
                      </div>
                      <div className="text-emerald-800">{topSummary.text}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {results.map(({ hotel, score, reasonText }) => (
                    <div
                      key={hotel.id}
                      className="bg-white border border-stone-200 rounded-lg shadow-sm"
                    >
                      <HotelCard hotel={hotel} />
                      <div className="p-3 border-t border-stone-200 text-xs text-stone-600 space-y-1">
                        <div>
                          <strong className="text-stone-900">
                            Match score:
                          </strong>{" "}
                          <span className="font-bold text-emerald-800">
                            {score}
                          </span>
                        </div>
                        <div>
                          <strong className="text-stone-900">
                            Why we picked this:
                          </strong>{" "}
                          {reasonText}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-3 pt-6 border-t border-stone-200">
                  <button
                    onClick={() => {
                      updateProfile && updateProfile({ quizAnswers: quiz });
                      alert("Preferences saved to your profile.");
                    }}
                    className="px-4 py-2 border border-stone-400 text-stone-600 rounded-md hover:bg-stone-100 transition text-sm font-medium flex items-center gap-2"
                  >
                    <FiSave /> Save preferences
                  </button>

                  <button
                    onClick={() => {
                      resetQuiz();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800 transition text-sm flex items-center gap-2"
                  >
                    <FiRotateCcw /> Retake quiz
                  </button>
                </div>
              </div>
            )}

            {!isThinking && !results && (
              <div className="p-8 bg-white border border-stone-200 rounded-lg shadow-sm">
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3">
                  How it works
                </h3>
                <ul className="text-stone-600 list-disc pl-5 space-y-2">
                  <li>
                    Sign in to save preferences and get personalised
                    recommendations.
                  </li>
                  <li>
                    Answer 5 quick questions — we’ll think like an AI and return
                    curated picks.
                  </li>
                  <li>
                    Results are stored in your profile and can be re-run or
                    refined anytime.
                  </li>
                </ul>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setStep(0);
                    }}
                    className="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800 transition flex items-center gap-2"
                  >
                    Start Quiz <FiArrowRight />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
