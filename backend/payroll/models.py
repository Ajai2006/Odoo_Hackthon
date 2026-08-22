"""
payroll/models.py

Models:
  Payroll       — monthly salary record per employee
  PayrollAuditLog — immutable audit trail; one entry per admin edit
"""
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings


class Payroll(models.Model):
    """Monthly payroll record for a single employee."""

    MONTH_CHOICES = [
        (1, 'January'), (2, 'February'), (3, 'March'),
        (4, 'April'),   (5, 'May'),      (6, 'June'),
        (7, 'July'),    (8, 'August'),   (9, 'September'),
        (10, 'October'),(11, 'November'),(12, 'December'),
    ]

    employee         = models.ForeignKey(
        'accounts.Employee',
        on_delete=models.CASCADE,
        related_name='payroll_records',
    )
    month            = models.IntegerField(choices=MONTH_CHOICES)
    year             = models.IntegerField()

    # ── Earnings ───────────────────────────────────────────────
    base_salary          = models.DecimalField(max_digits=12, decimal_places=2,
                               validators=[MinValueValidator(Decimal('0'))])
    house_allowance      = models.DecimalField(max_digits=10, decimal_places=2,
                               default=Decimal('0'), validators=[MinValueValidator(Decimal('0'))])
    medical_allowance    = models.DecimalField(max_digits=10, decimal_places=2,
                               default=Decimal('0'), validators=[MinValueValidator(Decimal('0'))])
    transport_allowance  = models.DecimalField(max_digits=10, decimal_places=2,
                               default=Decimal('0'), validators=[MinValueValidator(Decimal('0'))])

    # ── Deductions ─────────────────────────────────────────────
    tax_deduction    = models.DecimalField(max_digits=10, decimal_places=2,
                           default=Decimal('0'), validators=[MinValueValidator(Decimal('0'))])
    provident_fund   = models.DecimalField(max_digits=10, decimal_places=2,
                           default=Decimal('0'), validators=[MinValueValidator(Decimal('0'))])

    # ── Calculated fields (server-side, read-only) ─────────────
    gross_salary     = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=Decimal('0'))
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=Decimal('0'))
    net_salary       = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=Decimal('0'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table          = 'payroll_payroll'
        unique_together   = ('employee', 'month', 'year')
        ordering          = ['-year', '-month']
        verbose_name      = 'Payroll Record'
        verbose_name_plural = 'Payroll Records'

    # ── Auto-calculate on save ─────────────────────────────────
    def calculate(self):
        self.gross_salary     = (self.base_salary + self.house_allowance
                                 + self.medical_allowance + self.transport_allowance)
        self.total_deductions = self.tax_deduction + self.provident_fund
        self.net_salary       = self.gross_salary - self.total_deductions

    def save(self, *args, **kwargs):
        self.calculate()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.employee} — {self.get_month_display()} {self.year}'

    @property
    def month_name(self):
        return self.get_month_display()


class PayrollAuditLog(models.Model):
    """
    Immutable audit trail for payroll edits.
    Created automatically when an admin updates a Payroll record.
    """
    payroll    = models.ForeignKey(Payroll, on_delete=models.CASCADE, related_name='audit_logs')
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='payroll_audit_logs',
    )
    reason     = models.TextField(help_text='Required: reason for this salary change')
    snapshot   = models.JSONField(
        help_text='JSON snapshot of the Payroll record BEFORE this change',
        default=dict,
    )
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table   = 'payroll_audit_log'
        ordering   = ['-changed_at']
        verbose_name = 'Payroll Audit Log'
        verbose_name_plural = 'Payroll Audit Logs'

    def __str__(self):
        return f'Audit: {self.payroll} by {self.changed_by} @ {self.changed_at:%Y-%m-%d %H:%M}'
