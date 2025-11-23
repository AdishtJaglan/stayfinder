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

from sentence_transformers import SentenceTransformer, util

print("Loading AI Model...") 
model = SentenceTransformer('all-MiniLM-L6-v2') 
print("AI Model Loaded.")

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

        
        hotels = list(hotels)
        if not hotels:
            return Response([])


        user_prompt = f"I want a {trip_type} trip. "
        user_prompt += f"Amenities: {' '.join(user_amenities)}. "
        if sdg_pref:
            user_prompt += f"I care about SDG {sdg_pref}. "
        
        hotel_descriptions = []
        for h in hotels:
            desc = f"{h.name} is a {h.city} hotel. {h.description}. "
            desc += f"It has {' '.join(h.amenities)}. "
            desc += f"Good for {' '.join(h.ideal_for)}."
            hotel_descriptions.append(desc)

        query_embedding = model.encode(user_prompt, convert_to_tensor=True)
        hotel_embeddings = model.encode(hotel_descriptions, convert_to_tensor=True)

        cosine_scores = util.cos_sim(query_embedding, hotel_embeddings)[0]

        scored_results = []

        for idx, hotel in enumerate(hotels):
            ai_score_raw = float(cosine_scores[idx])
            ai_score = ai_score_raw * 50
            
            reasons = []
            rule_score = 0
            
            if ai_score_raw > 0.45:
                reasons.append("AI Confidence: High semantic match with your preferences.")
            elif ai_score_raw > 0.25:
                reasons.append("AI Confidence: Moderate match.")

            final_score = round(ai_score + rule_score)

            scored_results.append({
                "hotel": HotelSerializer(hotel).data,
                "score": final_score,
                "reasonParts": reasons,
                "reasonText": " ".join(reasons)
            })

        scored_results.sort(key=lambda x: x['score'], reverse=True)
        return Response(scored_results)