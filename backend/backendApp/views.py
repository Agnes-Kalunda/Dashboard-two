import requests
from django.http import JsonResponse
from django.views import View
from django.conf import settings
from datetime import datetime, timedelta

class FREDDataView(View):
    def get(self, request):
        base_url = "https://api.stlouisfed.org/fred/category/series"
        params = {
            "category_id": 125,
            "api_key": settings.FRED_API_KEY,
            "file_type": "json"
        }

        try:
            response = requests.get(base_url, params=params)
            response.raise_for_status()

            data = response.json()
            six_months_ago = datetime.now() - timedelta(days=180)

            # Filter and process series 
            active_series = []
            for series in data.get('seriess', []):
                last_updated = datetime.strptime(series.get('last_updated', ''), "%Y-%m-%d %H:%M:%S-%f")
                
    
                if last_updated > six_months_ago:
                    processed_series = {
                        "id": series.get('id'),
                        "title": series.get('title'),
                        "observation_start": series.get('observation_start'),
                        "observation_end": series.get('observation_end'),
                        "frequency": series.get('frequency'),
                        "frequency_short": series.get('frequency_short'),
                        "units": series.get('units'),
                        "units_short": series.get('units_short'),
                        "seasonal_adjustment": series.get('seasonal_adjustment'),
                        "seasonal_adjustment_short": series.get('seasonal_adjustment_short'),
                        "last_updated": series.get('last_updated'),
                        "popularity": series.get('popularity'),
                        "group_popularity": series.get('group_popularity')
                    }
                    active_series.append(processed_series)

        
            active_series.sort(key=lambda x: (
                ['D', 'W', 'BW', 'M', 'Q', 'SA', 'A'].index(x['frequency_short']),
                datetime.strptime(x['last_updated'], "%Y-%m-%d %H:%M:%S-%f")
            ), reverse=True)

            return JsonResponse({
                "count": len(active_series),
                "series": active_series
            })

        except requests.RequestException as e:
            return JsonResponse({"error": str(e)}, status=500)
        

class SeriesDataView(View):
    def get(self, request, series_id):
        base_url = "https://api.stlouisfed.org/fred/series/observations"
        params = {
            "series_id": series_id,
            "api_key": settings.FRED_API_KEY,
            "file_type": "json",
            "sort_order": "desc",
            "limit": 100  
        }

        try:
            response = requests.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()
            return JsonResponse(data)
        except requests.RequestException as e:
            return JsonResponse({"error": str(e)}, status=500)