export function scoreHotel(hotel, quizAnswers) {
  let score = 0;
  score += hotel.rating * 12;

  if (
    hotel.price_per_night >= quizAnswers.minBudget &&
    hotel.price_per_night <= quizAnswers.maxBudget
  ) {
    score += 25;
  } else {
    const diff =
      hotel.price_per_night < quizAnswers.minBudget
        ? quizAnswers.minBudget - hotel.price_per_night
        : hotel.price_per_night - quizAnswers.maxBudget;
    score -= Math.min(15, Math.floor(diff / 1500));
  }

  if (hotel.ideal_for?.includes(quizAnswers.tripType)) score += 22;

  const amatches =
    quizAnswers.amenities?.filter((a) => hotel.amenities?.includes(a)).length ||
    0;
  score += amatches * 8;

  if (quizAnswers.sdg && hotel.sdg_tags?.includes(quizAnswers.sdg)) score += 12;

  score -= Math.min(8, Math.floor(hotel.distance_from_center_km || 0));
  const normalized = Math.round(Math.max(-50, Math.min(120, score)));
  return { score: normalized };
}
