from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Hotel
from .serializer import HotelSerializer

class HotelViewSet(viewsets.ViewSet):
    """
    - GET /api/hotels/        -> list all hotels
    - POST /api/hotels/       -> bulk insert/upsert an array of hotel objects
    - GET /api/hotels/{id}/   -> retrieve single hotel (optional implemented)
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
        """
        Accepts an array of hotel objects and upserts them.
        Returns list of created/updated records.
        """
        if not isinstance(request.data, list):
            return Response(
                {"detail": "Expected a list of hotel objects."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # validate first
        serializer = HotelSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        results = []
        for item in serializer.validated_data:
            pk = item.get("id")
            defaults = {k: v for k, v in item.items() if k != "id"}
            obj, created = Hotel.objects.update_or_create(id=pk, defaults=defaults)
            results.append({"id": obj.id, "created": created})
        return Response(results, status=status.HTTP_200_OK)
