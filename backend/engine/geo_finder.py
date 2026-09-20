import json
import os
import math
from typing import List, Dict, Any

class GeoTrainingCentreFinder:
    """
    GPS Nearest Training Centre Finder.
    Calculates exact geodesic distance (in kilometers) between worker coordinates/location
    and certified skilling institutes.
    """

    def __init__(self, dataset_path: str = None):
        if dataset_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            dataset_path = os.path.join(base_dir, "data", "training_centres.json")

        with open(dataset_path, "r", encoding="utf-8") as f:
            self.centres: List[Dict[str, Any]] = json.load(f)

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates distance between two coordinates in kilometers using Haversine formula."""
        R = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2 +
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 1)

    def find_nearest(
        self,
        user_lat: float = 12.9716, # Default Bangalore coordinates
        user_lng: float = 77.5946,
        user_location_name: str = "Bengaluru",
        trade: str = "Electrician"
    ) -> List[Dict[str, Any]]:
        """
        Finds nearest training centres for specified trade, sorted by distance.
        """
        results = []

        # Coordinate fallback mapping for popular Indian cities
        CITY_COORDS = {
            "bengaluru": (12.9716, 77.5946),
            "bangalore": (12.9716, 77.5946),
            "karnataka": (12.9716, 77.5946),
            "mysuru": (12.3556, 76.6128),
            "mysore": (12.3556, 76.6128),
            "mumbai": (19.0760, 72.8777),
            "maharashtra": (19.0760, 72.8777),
            "delhi": (28.6139, 77.2090),
            "new delhi": (28.6139, 77.2090)
        }

        if user_location_name and user_location_name.lower() in CITY_COORDS:
            user_lat, user_lng = CITY_COORDS[user_location_name.lower()]

        for tc in self.centres:
            # Check if trade matches
            if trade and trade not in tc["trades_offered"] and "Electrician" not in tc["trades_offered"]:
                continue

            dist_km = self.haversine_distance(user_lat, user_lng, tc["latitude"], tc["longitude"])
            
            readout_script = (
                f"The nearest certified centre for {trade} is {tc['name']}, located {dist_km} km away at {tc['address']}. "
                f"It currently has {tc['open_seats']} open seats. Phone: {tc['contact_phone']}."
            )

            results.append({
                "centre": tc,
                "distance_km": dist_km,
                "readout_script": readout_script
            })

        results.sort(key=lambda x: x["distance_km"])
        return results

_finder_instance = None
def get_centre_finder() -> GeoTrainingCentreFinder:
    global _finder_instance
    if _finder_instance is None:
        _finder_instance = GeoTrainingCentreFinder()
    return _finder_instance
