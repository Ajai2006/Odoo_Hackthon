import decimal
from django.conf import settings
from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Payroll',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('month', models.IntegerField(choices=[(1, 'January'), (2, 'February'), (3, 'March'), (4, 'April'), (5, 'May'), (6, 'June'), (7, 'July'), (8, 'August'), (9, 'September'), (10, 'October'), (11, 'November'), (12, 'December')])),
                ('year', models.IntegerField()),
                ('base_salary', models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(decimal.Decimal('0'))])),
                ('house_allowance', models.DecimalField(decimal_places=2, default=decimal.Decimal('0'), max_digits=10, validators=[django.core.validators.MinValueValidator(decimal.Decimal('0'))])),
                ('medical_allowance', models.DecimalField(decimal_places=2, default=decimal.Decimal('0'), max_digits=10, validators=[django.core.validators.MinValueValidator(decimal.Decimal('0'))])),
                ('transport_allowance', models.DecimalField(decimal_places=2, default=decimal.Decimal('0'), max_digits=10, validators=[django.core.validators.MinValueValidator(decimal.Decimal('0'))])),
                ('tax_deduction', models.DecimalField(decimal_places=2, default=decimal.Decimal('0'), max_digits=10, validators=[django.core.validators.MinValueValidator(decimal.Decimal('0'))])),
                ('provident_fund', models.DecimalField(decimal_places=2, default=decimal.Decimal('0'), max_digits=10, validators=[django.core.validators.MinValueValidator(decimal.Decimal('0'))])),
                ('gross_salary', models.DecimalField(decimal_places=2, default=decimal.Decimal('0'), editable=False, max_digits=12)),
                ('total_deductions', models.DecimalField(decimal_places=2, default=decimal.Decimal('0'), editable=False, max_digits=12)),
                ('net_salary', models.DecimalField(decimal_places=2, default=decimal.Decimal('0'), editable=False, max_digits=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payroll_records', to='accounts.employee')),
            ],
            options={
                'verbose_name': 'Payroll Record',
                'verbose_name_plural': 'Payroll Records',
                'db_table': 'payroll_payroll',
                'ordering': ['-year', '-month'],
            },
        ),
        migrations.CreateModel(
            name='PayrollAuditLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reason', models.TextField(help_text='Required: reason for this salary change')),
                ('snapshot', models.JSONField(default=dict, help_text='JSON snapshot of the Payroll record BEFORE this change')),
                ('changed_at', models.DateTimeField(auto_now_add=True)),
                ('changed_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payroll_audit_logs', to=settings.AUTH_USER_MODEL)),
                ('payroll', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='audit_logs', to='payroll.payroll')),
            ],
            options={
                'verbose_name': 'Payroll Audit Log',
                'verbose_name_plural': 'Payroll Audit Logs',
                'db_table': 'payroll_audit_log',
                'ordering': ['-changed_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='payroll',
            constraint=models.UniqueConstraint(fields=('employee', 'month', 'year'), name='unique_payroll_employee_month_year'),
        ),
    ]
