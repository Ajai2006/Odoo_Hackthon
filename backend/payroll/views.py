"""
payroll/views.py

Endpoints:
  GET  /api/payroll/my/?month=&year=   IsEmployee — own record only
  GET  /api/payroll/                   IsAdmin — all records
  GET  /api/payroll/{id}/              IsAdmin — specific record
  POST /api/payroll/                   IsAdmin — create
  PUT  /api/payroll/{id}/              IsAdmin — update (reason required)
  GET  /api/payroll/{id}/audit/        IsAdmin — audit log for one record
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsEmployee
from .models import Payroll, PayrollAuditLog
from .serializers import (
    PayrollReadSerializer,
    PayrollWriteSerializer,
    PayrollAuditLogSerializer,
)


class PayrollViewSet(viewsets.ModelViewSet):
    """
    Admin: full CRUD on all payroll records.
    Employees: read-only access to their own record via /my/.
    """

    def get_queryset(self):
        return Payroll.objects.select_related('employee__user').order_by('-year', '-month')

    def get_permissions(self):
        # /my/ is available to any authenticated user
        if self.action == 'my_payslip':
            return [IsEmployee()]
        # All other actions require admin
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return PayrollWriteSerializer
        return PayrollReadSerializer

    # ── Employee: own payslip ──────────────────────────────────
    @action(detail=False, methods=['get'], url_path='my', permission_classes=[IsEmployee])
    def my_payslip(self, request):
        """GET /api/payroll/my/?month=&year="""
        try:
            employee = request.user.employee_profile
        except Exception:
            return Response({'detail': 'No employee profile linked to this user.'}, status=404)

        qs = Payroll.objects.filter(employee=employee)
        month = request.query_params.get('month')
        year  = request.query_params.get('year')

        if month:
            qs = qs.filter(month=int(month))
        if year:
            qs = qs.filter(year=int(year))

        qs = qs.order_by('-year', '-month')
        serializer = PayrollReadSerializer(qs, many=True)
        return Response(serializer.data)

    # ── Admin: audit log for a specific record ─────────────────
    @action(detail=True, methods=['get'], url_path='audit', permission_classes=[IsAdmin])
    def audit_log(self, request, pk=None):
        """GET /api/payroll/{id}/audit/"""
        payroll = self.get_object()
        logs    = PayrollAuditLog.objects.filter(payroll=payroll).order_by('-changed_at')
        serializer = PayrollAuditLogSerializer(logs, many=True)
        return Response(serializer.data)

    # ── Override destroy: disallow permanent deletion ──────────
    def destroy(self, request, *args, **kwargs):
        return Response(
            {'detail': 'Payroll records cannot be deleted. Archive via employee status instead.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


# ── Admin dashboard stats endpoint ────────────────────────────────────────────
class PayrollDashboardStatsView(APIView):
    """GET /api/payroll/stats/ — counts for admin dashboard StatCards."""
    permission_classes = [IsAdmin]

    def get(self, request):
        from accounts.models import Employee
        from django.db.models import Sum
        import datetime

        today       = datetime.date.today()
        total_emp   = Employee.objects.filter(is_active=True).count()
        this_month  = Payroll.objects.filter(month=today.month, year=today.year)
        paid_count  = this_month.count()
        total_net   = this_month.aggregate(total=Sum('net_salary'))['total'] or 0

        return Response({
            'total_active_employees': total_emp,
            'payroll_records_this_month': paid_count,
            'total_net_salary_this_month': str(total_net),
        })
