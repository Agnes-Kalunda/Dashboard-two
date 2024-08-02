import requests
from django.http import JsonResponse
from django.views import View
from django.conf import settings

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

            return JsonResponse(data)

        except requests.RequestException as e:
            return JsonResponse({"error": str(e)}, status=500)