from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayrollViewSet, PayrollDashboardStatsView

router = DefaultRouter()
router.register(r'', PayrollViewSet, basename='payroll')

urlpatterns = [
    path('stats/', PayrollDashboardStatsView.as_view(), name='payroll-stats'),
    path('', include(router.urls)),
]
