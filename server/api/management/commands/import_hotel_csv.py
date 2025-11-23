import csv
import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import Hotel

def to_float(v):
    try:
        return float(v)
    except Exception:
        return None

def to_int(v):
    try:
        return int(float(v))
    except Exception:
        return None

def make_unique_id(base):
    """
    If base exists as a PK, append -1, -2... until unique.
    """
    candidate = base
    i = 1
    while Hotel.objects.filter(id=candidate).exists():
        candidate = f"{base}-{i}"
        i += 1
    return candidate

class Command(BaseCommand):
    help = "Import hotels from a CSV file and upsert into Hotel model."

    def add_arguments(self, parser):
        parser.add_argument("path", type=str, help="Path to CSV file")
        parser.add_argument(
            "--images", type=int, default=3,
            help="Number of placeholder images to generate per hotel (default: 3)"
        )
        parser.add_argument(
            "--seed-by", type=str, default="id",
            help="How to seed placeholder images: 'id' or 'name' (default 'id')"
        )

    def handle(self, *args, **options):
        path = options["path"]
        images_per = options["images"]
        seed_by = options["seed_by"]

        if not os.path.exists(path):
            self.stdout.write(self.style.ERROR(f"File not found: {path}"))
            return

        created = 0
        updated = 0
        skipped = 0

        with open(path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            # normalize header keys: strip & upper/lower convert spaces to underscores optional
            rows = list(reader)

        for row in rows:
            # Normalize input keys for robust matching (strip spaces)
            clean = {k.strip(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}

            # Map CSV columns to model fields (change keys if your CSV uses different names)
            name = clean.get("Hotel_Name") or clean.get("Hotel name") or clean.get("HotelName") or clean.get("name")
            if not name:
                self.stdout.write(self.style.WARNING("Skipping row w/o Hotel_Name"))
                skipped += 1
                continue

            city = clean.get("City") or ""
            rating = to_float(clean.get("Hotel_Rating") or clean.get("Rating") or None)
            price = to_int(clean.get("Hotel_Price") or clean.get("Price") or None)

            # Gather Feature_1..Feature_9 columns into amenities/tags
            amenities = []
            tags = []
            for i in range(1, 10):
                k = f"Feature_{i}"
                v = clean.get(k)
                if not v:
                    # also try lowercase-ish variants
                    v = clean.get(k.lower())
                if v:
                    # split by common separators if needed (comma/semicolon) — keep simple by trimming
                    parts = [p.strip() for p in v.split(",")] if "," in v else [v.strip()]
                    for part in parts:
                        if part and part not in amenities:
                            amenities.append(part)
                            # heuristics: small feature words could be tags too
                            if len(part) <= 15:
                                tags.append(part.lower())

            # generate base id (slug)
            base = slugify(f"{name}-{city}")[:60]  # keep length reasonable
            pk = make_unique_id(base)

            # create images using picsum.photos with stable seed
            seed = pk if seed_by == "id" else slugify(name)
            images = [f"https://picsum.photos/seed/{seed}-{n}/1200/800" for n in range(1, images_per + 1)]
            images_alt = [f"{name} — image {n}" for n in range(1, images_per + 1)]
            blur = f"https://picsum.photos/seed/{seed}/20/13"

            # populate rooms: minimal single room if not available via CSV
            rooms = [
                {
                    "type": "Standard",
                    "occupancy": 2,
                    "size_sqm": 25,
                    "price": price or 0,
                }
            ]

            # policies default
            policies = {
                "check_in": "14:00",
                "check_out": "12:00",
                "cancellation": "Free upto 48h",
            }

            description = (
                clean.get("Description")
                or f"{name} in {city}. Rated {rating if rating else 'N/A'} — great choice for travellers."
            )
            why_ai_picked = f"Automatically generated: good rating and central location in {city}."

            sustainability = {"certifications": [], "energy_source": "grid", "water_conservation": False}

            # prepare upsert defaults
            defaults = {
                "name": name,
                "city": city,
                "address": clean.get("Address", "") or "",
                "phone": clean.get("Phone", "") or "",
                "email": clean.get("Email", "") or "",
                "price_per_night": price,
                "rating": rating,
                "images": images,
                "images_alt": images_alt,
                "blurPlaceholder": blur,
                "rooms": rooms,
                "policies": policies,
                "amenities": amenities,
                "ideal_for": [],     # CSV doesn't have; left blank
                "distance_from_center_km": to_float(clean.get("Distance_km", None)),
                "tags": tags,
                "description": description,
                "why_ai_picked": why_ai_picked,
                "sdg_tags": [],
                "nearby": [],
                "sustainability": sustainability,
            }

            # upsert
            obj, created_flag = Hotel.objects.update_or_create(id=pk, defaults=defaults)
            if created_flag:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"Import finished. Created: {created}, Updated: {updated}, Skipped: {skipped}"
        ))
