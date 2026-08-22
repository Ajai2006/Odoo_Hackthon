# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class DayflowHrAttendance(models.Model):
    _inherit = 'hr.attendance'

    punctuality_status = fields.Selection([
        ('on_time', 'On Time'),
        ('late', 'Late Arrival'),
        ('incomplete', 'Incomplete Shift'),
    ], string='Punctuality Status', compute='_compute_punctuality_status', store=True)

    late_minutes = fields.Integer(string='Late Minutes', compute='_compute_punctuality_status', store=True)

    @api.depends('check_in', 'check_out')
    def _compute_punctuality_status(self):
        for rec in self:
            if not rec.check_in:
                rec.punctuality_status = 'incomplete'
                rec.late_minutes = 0
                continue

            # Standard shift start time: 09:30 AM
            check_in_dt = fields.Datetime.to_datetime(rec.check_in)
            shift_start = check_in_dt.replace(hour=9, minute=30, second=0, microsecond=0)

            if check_in_dt > shift_start:
                diff_secs = (check_in_dt - shift_start).total_seconds()
                rec.late_minutes = int(diff_secs // 60)
                rec.punctuality_status = 'late'
            else:
                rec.late_minutes = 0
                rec.punctuality_status = 'on_time'

    @api.constrains('check_in', 'check_out')
    def _check_valid_timestamps(self):
        for rec in self:
            if rec.check_in and rec.check_out and rec.check_out <= rec.check_in:
                raise ValidationError(_("Clock-out time must be strictly after clock-in time."))
