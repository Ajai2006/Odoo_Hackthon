"""
accounts/models.py — Member 1 owns this file.
Stub provided by Member 4 (Payroll/Dashboards) so payroll app compiles independently.
Member 1: replace this with the real User/Employee implementation.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Extended user with role field.
    role: 'admin' | 'employee'
    """
    ROLE_ADMIN    = 'admin'
    ROLE_EMPLOYEE = 'employee'
    ROLE_CHOICES  = [(ROLE_ADMIN, 'Admin'), (ROLE_EMPLOYEE, 'Employee')]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_EMPLOYEE)

    class Meta:
        db_table = 'accounts_user'

    def __str__(self):
        return f'{self.username} ({self.role})'

    @property
    def is_admin(self):
        return self.role == self.ROLE_ADMIN

    @property
    def is_employee_role(self):
        return self.role == self.ROLE_EMPLOYEE


class Employee(models.Model):
    """
    Employee profile linked 1-to-1 with User.
    Member 1: extend with department, designation, date_joined etc.
    """
    user         = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id  = models.CharField(max_length=20, unique=True)
    department   = models.CharField(max_length=100, blank=True)
    designation  = models.CharField(max_length=100, blank=True)
    date_joined  = models.DateField(null=True, blank=True)
    is_active    = models.BooleanField(default=True)

    class Meta:
        db_table = 'accounts_employee'

    def __str__(self):
        return f'{self.employee_id} — {self.user.get_full_name() or self.user.username}'
