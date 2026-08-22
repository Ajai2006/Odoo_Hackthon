# -*- coding: utf-8 -*-
{
    'name': 'Dayflow HRMS — Attendance & Leave Management',
    'version': '17.0.1.0.0',
    'category': 'Human Resources',
    'summary': 'Real-time shift tracking, RBAC, leave management, and risk analytics',
    'description': """
Dayflow HRMS Odoo Module
========================
- Real-time attendance monitoring & shift check-in validation
- Multi-tier RBAC (Admin, Manager, Employee)
- Leave request workflow and automatic attendance calendar syncing
- Audit logging & workforce risk analytics
    """,
    'author': 'Dayflow HRMS Team',
    'website': 'https://github.com/Ajai2006/Odoo_Hackthon',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'hr',
        'hr_attendance',
        'hr_holidays',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/attendance_views.xml',
    ],
    'demo': [],
    'installable': True,
    'application': True,
    'auto_install': False,
}
