"""
payroll/serializers.py

PayrollReadSerializer  — employee-facing read-only view (no write fields).
PayrollWriteSerializer — admin-facing create/update, requires 'reason' on updates.
PayrollAuditLogSerializer — for admin view of audit history.
"""
from decimal import Decimal
from rest_framework import serializers
from .models import Payroll, PayrollAuditLog


# ── Read-only (employee) ───────────────────────────────────────────────────────
class PayrollReadSerializer(serializers.ModelSerializer):
    employee_name  = serializers.SerializerMethodField()
    employee_id    = serializers.SerializerMethodField()
    month_name     = serializers.CharField(source='get_month_display', read_only=True)

    class Meta:
        model  = Payroll
        fields = [
            'id', 'employee', 'employee_name', 'employee_id',
            'month', 'month_name', 'year',
            'base_salary', 'house_allowance', 'medical_allowance', 'transport_allowance',
            'tax_deduction', 'provident_fund',
            'gross_salary', 'total_deductions', 'net_salary',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields  # employees: zero write access

    def get_employee_name(self, obj):
        u = obj.employee.user
        return u.get_full_name() or u.username

    def get_employee_id(self, obj):
        return obj.employee.employee_id


# ── Write (admin) ──────────────────────────────────────────────────────────────
class PayrollWriteSerializer(serializers.ModelSerializer):
    """
    Used by admins for POST and PUT.
    'reason' is required on updates (validated at view layer since it is
    context-dependent: not required for initial creation, required for edits).
    """
    reason = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=False,
        min_length=5,
        help_text='Required on update: reason for salary change',
    )
    # Calculated fields are read-only — server always recomputes
    gross_salary     = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_deductions = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    net_salary       = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model  = Payroll
        fields = [
            'id', 'employee', 'month', 'year',
            'base_salary', 'house_allowance', 'medical_allowance', 'transport_allowance',
            'tax_deduction', 'provident_fund',
            'gross_salary', 'total_deductions', 'net_salary',
            'reason',
        ]

    # ── Validators ─────────────────────────────────────────────
    def _validate_non_negative(self, value, field_name):
        if value is not None and value < Decimal('0'):
            raise serializers.ValidationError(f'{field_name} must be non-negative.')
        return value

    def validate_base_salary(self, v):       return self._validate_non_negative(v, 'base_salary')
    def validate_house_allowance(self, v):   return self._validate_non_negative(v, 'house_allowance')
    def validate_medical_allowance(self, v): return self._validate_non_negative(v, 'medical_allowance')
    def validate_transport_allowance(self, v): return self._validate_non_negative(v, 'transport_allowance')
    def validate_tax_deduction(self, v):     return self._validate_non_negative(v, 'tax_deduction')
    def validate_provident_fund(self, v):    return self._validate_non_negative(v, 'provident_fund')

    def validate(self, data):
        # On updates, reason is mandatory
        is_update = self.instance is not None
        if is_update and not data.get('reason', '').strip():
            raise serializers.ValidationError(
                {'reason': 'A reason is required when updating a payroll record.'}
            )

        # Preview net salary to ensure it is positive
        instance = self.instance
        base    = data.get('base_salary',         getattr(instance, 'base_salary', Decimal('0')))
        house   = data.get('house_allowance',     getattr(instance, 'house_allowance', Decimal('0')))
        med     = data.get('medical_allowance',   getattr(instance, 'medical_allowance', Decimal('0')))
        trans   = data.get('transport_allowance', getattr(instance, 'transport_allowance', Decimal('0')))
        tax     = data.get('tax_deduction',       getattr(instance, 'tax_deduction', Decimal('0')))
        pf      = data.get('provident_fund',      getattr(instance, 'provident_fund', Decimal('0')))

        gross   = base + house + med + trans
        net     = gross - tax - pf

        if net <= Decimal('0'):
            raise serializers.ValidationError(
                {'net_salary': f'Net salary must be positive. Computed value: {net}'}
            )
        return data

    def create(self, validated_data):
        validated_data.pop('reason', None)  # not a model field
        return super().create(validated_data)

    def update(self, instance, validated_data):
        reason = validated_data.pop('reason')
        # Snapshot BEFORE change
        snapshot = PayrollReadSerializer(instance).data
        # Apply update
        updated = super().update(instance, validated_data)
        # Write audit log
        PayrollAuditLog.objects.create(
            payroll    = updated,
            changed_by = self.context['request'].user,
            reason     = reason,
            snapshot   = {k: str(v) for k, v in snapshot.items()},
        )
        return updated


# ── Audit log ─────────────────────────────────────────────────────────────────
class PayrollAuditLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = PayrollAuditLog
        fields = ['id', 'payroll', 'changed_by', 'changed_by_name', 'reason', 'snapshot', 'changed_at']

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return obj.changed_by.get_full_name() or obj.changed_by.username
        return 'Unknown'
