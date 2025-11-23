from django.db import models

class Hotel(models.Model):
    id = models.CharField(max_length=64, primary_key=True)  # e.g. "del-01"
    name = models.CharField(max_length=300)
    city = models.CharField(max_length=200, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    price_per_night = models.IntegerField(null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)

    # JSON fields to hold arrays / nested objects
    images = models.JSONField(default=list, blank=True)
    images_alt = models.JSONField(default=list, blank=True)
    blurPlaceholder = models.CharField(max_length=500, blank=True)

    rooms = models.JSONField(default=list, blank=True)          # list of room objects
    policies = models.JSONField(default=dict, blank=True)       # dict
    amenities = models.JSONField(default=list, blank=True)
    ideal_for = models.JSONField(default=list, blank=True)
    distance_from_center_km = models.FloatField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True)
    why_ai_picked = models.TextField(blank=True)
    sdg_tags = models.JSONField(default=list, blank=True)
    nearby = models.JSONField(default=list, blank=True)        # list of {name, distance_km}
    sustainability = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id} — {self.name}"
