import math
import numpy as np
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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
        data = request.data
        
        trip_type = data.get('tripType', '')
        min_budget = int(data.get('minBudget', 0))
        max_budget = int(data.get('maxBudget', 50000))
        user_amenities = data.get('amenities', [])
        location_pref = data.get('locationPref', '').strip().lower()
        sdg_pref = data.get('sdg', '')

        hotels = Hotel.objects.all()

        if location_pref:
            hotels = hotels.filter(
                Q(city__icontains=location_pref) | 
                Q(name__icontains=location_pref)
            )

        if not hotels.exists():
            return Response([])

        
        user_profile_text = f"{trip_type} trip. " 
        user_profile_text += " ".join(user_amenities) 
        if sdg_pref:
            user_profile_text += f" focused on sustainable goal {sdg_pref}"

        hotel_corpus = []
        hotel_refs = [] # To keep track of which hotel is which index

        for h in hotels:
            amenities_str = " ".join(h.amenities) if h.amenities else ""
            tags_str = " ".join(h.tags) if h.tags else ""
            ideal_str = " ".join(h.ideal_for) if h.ideal_for else ""
            
            text_soup = f"{h.description} {amenities_str} {tags_str} {ideal_str} {h.rating} stars"
            hotel_corpus.append(text_soup)
            hotel_refs.append(h)

        corpus_with_user = [user_profile_text] + hotel_corpus
        
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(corpus_with_user)

        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

        scored_results = []

        for idx, hotel in enumerate(hotel_refs):
            ml_score = cosine_sim[idx] * 50 
            
            rule_score = 0
            reasons = []

            if ml_score > 15:
                reasons.append("AI Match: High semantic similarity to your preferences.")
            
            rating = float(hotel.rating) if hotel.rating else 0
            rule_score += rating * 5

            price = hotel.price_per_night
            if min_budget <= price <= max_budget:
                rule_score += 20
                reasons.append(f"Price ₹{price} is within budget.")
            else:
                rule_score -= 10
                reasons.append(f"Price ₹{price} is outside budget range.")

            if sdg_pref and hotel.sdg_tags and sdg_pref in hotel.sdg_tags:
                rule_score += 15
                reasons.append(f"Directly supports SDG {sdg_pref}.")

            final_score = round(ml_score + rule_score)
            
            if not reasons:
                reasons.append("Matched based on general location availability.")

            scored_results.append({
                "hotel": HotelSerializer(hotel).data,
                "score": final_score,
                "reasonParts": reasons,
                "reasonText": " ".join(reasons)
            })

        scored_results.sort(key=lambda x: x['score'], reverse=True)
        return Response(scored_results)