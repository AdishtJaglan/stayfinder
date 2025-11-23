from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import HotelViewSet

router = DefaultRouter()
# Register a viewset-like route manually because we used ViewSet not ModelViewSet
# But DefaultRouter expects a ViewSet with basename; this will route list/create/retrieve.
router.register(r"hotels", HotelViewSet, basename="hotel")

urlpatterns = router.urls
