from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Employee


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active')
    list_filter   = ('role', 'is_active', 'is_staff')
    fieldsets     = UserAdmin.fieldsets + (
        ('Dayflow Role', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Dayflow Role', {'fields': ('role',)}),
    )


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display  = ('employee_id', 'user', 'department', 'designation', 'is_active')
    list_filter   = ('department', 'is_active')
    search_fields = ('employee_id', 'user__username', 'user__first_name', 'user__last_name')
    raw_id_fields = ('user',)
