from django.contrib import admin
from .models import Payroll, PayrollAuditLog


class PayrollAuditLogInline(admin.TabularInline):
    model       = PayrollAuditLog
    extra       = 0
    readonly_fields = ('changed_by', 'reason', 'snapshot', 'changed_at')
    can_delete  = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display   = (
        'employee', 'month', 'year',
        'base_salary', 'gross_salary', 'total_deductions', 'net_salary',
        'created_at',
    )
    list_filter    = ('year', 'month')
    search_fields  = ('employee__employee_id', 'employee__user__first_name', 'employee__user__last_name')
    readonly_fields = ('gross_salary', 'total_deductions', 'net_salary', 'created_at', 'updated_at')
    ordering       = ('-year', '-month')
    inlines        = [PayrollAuditLogInline]

    fieldsets = (
        ('Employee & Period', {
            'fields': ('employee', 'month', 'year'),
        }),
        ('Earnings', {
            'fields': ('base_salary', 'house_allowance', 'medical_allowance', 'transport_allowance'),
        }),
        ('Deductions', {
            'fields': ('tax_deduction', 'provident_fund'),
        }),
        ('Calculated (auto)', {
            'fields': ('gross_salary', 'total_deductions', 'net_salary'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def save_model(self, request, obj, form, change):
        """Recalculate before saving through admin."""
        obj.calculate()
        super().save_model(request, obj, form, change)


@admin.register(PayrollAuditLog)
class PayrollAuditLogAdmin(admin.ModelAdmin):
    list_display   = ('payroll', 'changed_by', 'reason', 'changed_at')
    list_filter    = ('changed_at',)
    search_fields  = ('payroll__employee__user__username', 'reason')
    readonly_fields = ('payroll', 'changed_by', 'reason', 'snapshot', 'changed_at')
    ordering       = ('-changed_at',)

    def has_add_permission(self, request):
        return False  # audit logs are system-generated only

    def has_delete_permission(self, request, obj=None):
        return False  # immutable
