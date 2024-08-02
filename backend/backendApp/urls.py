from django.urls import path
from .views import FREDDataView

urlpatterns = [
    path('fred-data/', FREDDataView.as_view(), name='fred_data'),
]