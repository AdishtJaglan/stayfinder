import math
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Hotel
from .serializer import HotelSerializer

def clamp(n, minn, maxn):
    return max(minn, min(maxn, n))

class HotelViewSet(viewsets.ViewSet):
    """
        - GET /api/hotels/        -> list all hotels
        - POST /api/hotels/       -> bulk insert/upsert an array of hotel objects
        - GET /api/hotels/{id}/   -> retrieve single hotel (optional implemented)
        - POST /api/hotels/recommend/ -> get recommendations
    """

    def list(self, request):
        qs = Hotel.objects.all().order_by("-created_at")
        serializer = HotelSerializer(qs, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            obj = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = HotelSerializer(obj)
        return Response(serializer.data)

    def create(self, request):
        # ... (Your existing create logic) ...
        if not isinstance(request.data, list):
            return Response(
                {"detail": "Expected a list of hotel objects."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = HotelSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        results = []
        for item in serializer.validated_data:
            pk = item.get("id")
            defaults = {k: v for k, v in item.items() if k != "id"}
            obj, created = Hotel.objects.update_or_create(id=pk, defaults=defaults)
            results.append({"id": obj.id, "created": created})
        return Response(results, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def recommend(self, request):
        """
        Receives quiz answers, scores hotels on the server side, 
        and returns the sorted top matches.
        """
        data = request.data
        
        # Extract preferences with defaults
        trip_type = data.get('tripType', 'family')
        min_budget = int(data.get('minBudget', 0))
        max_budget = int(data.get('maxBudget', 20000))
        user_amenities = data.get('amenities', [])
        location_pref = data.get('locationPref', '').strip().lower()
        guests = int(data.get('guests', 2)) # Not currently used in scoring, but available
        sdg_pref = data.get('sdg', '')

        # Fetch all hotels (In a real app with 10k+ hotels, you would filter using DB queries first)
        hotels = Hotel.objects.all()
        
        scored_results = []

        for hotel in hotels:
            score = 0
            reasons = []

            # 1. Rating Score
            # Assuming rating is a float/decimal field
            rating = float(hotel.rating) if hotel.rating else 0
            score += rating * 12
            reasons.append(f"Rated {rating:.1f} — we prefer highly-rated stays.")

            # 2. Budget Score
            # Assuming price_per_night is integer/decimal
            price = hotel.price_per_night
            if min_budget <= price <= max_budget:
                score += 25
                reasons.append(f"Price ₹{price} fits your budget.")
            else:
                diff = (min_budget - price) if price < min_budget else (price - max_budget)
                # Logic: penalty = min(15, floor(diff / 1500))
                penalty = min(15, math.floor(diff / 1500))
                score -= penalty
                direction = "below" if price < min_budget else "above"
                reasons.append(f"Price is {direction} budget (penalty {penalty}).")

            # 3. Trip Type Match
            # Assuming ideal_for and tags are ListFields or JSONFields
            ideal_for = hotel.ideal_for if hotel.ideal_for else []
            tags = hotel.tags if hotel.tags else []
            
            if trip_type in ideal_for:
                score += 22
                reasons.append(f"Matches your trip type (“{trip_type}”).")
            else:
                # Check tags case-insensitive
                tag_match = any(trip_type.lower() in t.lower() for t in tags)
                if tag_match:
                    score += 10
                    reasons.append(f"Partially matches trip type through tags.")
                else:
                    reasons.append(f"Not a direct {trip_type} pick.")

            # 4. Amenities Match
            # Assuming hotel.amenities is a list
            h_amenities = hotel.amenities if hotel.amenities else []
            matches = [a for a in user_amenities if a in h_amenities]
            if matches:
                add_score = len(matches) * 8
                score += add_score
                reasons.append(f"Has {', '.join(matches)} (+{add_score}).")
            else:
                reasons.append("Doesn't match selected amenities.")

            # 5. Location Match
            h_city = hotel.city.lower() if hotel.city else ""
            h_name = hotel.name.lower() if hotel.name else ""
            
            if location_pref:
                if h_city == location_pref:
                    score += 18
                    reasons.append(f"Located in {hotel.city} — exact match.")
                elif location_pref in h_city or location_pref in h_name:
                    score += 8
                    reasons.append(f"Partial match on location.")
                else:
                    reasons.append("Different location than preference.")

            # 6. SDG Match
            h_sdg = hotel.sdg_tags if hotel.sdg_tags else []
            if sdg_pref:
                if sdg_pref in h_sdg:
                    score += 12
                    reasons.append(f"Supports SDG {sdg_pref}.")
                else:
                    reasons.append(f"Does not list SDG {sdg_pref}.")

            # 7. Distance Penalty
            dist = float(hotel.distance_from_center_km) if hotel.distance_from_center_km else 0
            dist_penalty = min(8, math.floor(dist))
            score -= dist_penalty
            reasons.append(f"Distance: {dist}km (penalty {dist_penalty}).")

            # Normalize
            final_score = round(clamp(score, -50, 120))
            reason_text = " ".join(reasons)

            # Filter out very low scores (optional)
            if final_score > 10:
                scored_results.append({
                    "hotel": HotelSerializer(hotel).data,
                    "score": final_score,
                    "reasonParts": reasons,
                    "reasonText": reason_text
                })

        # Sort by score descending
        scored_results.sort(key=lambda x: x['score'], reverse=True)

        # Return top 20 to keep payload light
        return Response(scored_results[:20])
