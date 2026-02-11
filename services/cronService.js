// services/cronService.js
import cron from 'node-cron';
import knex from '../config/knex.js';
import notificationService from './notificationService.js';

/**
 * Cron Service - Scheduled Notifications
 * Manages all automated notification jobs
 */
class CronService {
    constructor() {
        this.jobs = [];
    }

    /**
     * Initialize all cron jobs
     */
    initialize() {
        console.log('📅 Initializing cron jobs for automated notifications...');

        // Daily 08:00 AM - Class Reminders for Tomorrow
        this.jobs.push(
            cron.schedule('0 8 * * *', this.sendClassReminders.bind(this), {
                scheduled: true,
                timezone: 'America/Caracas'
            })
        );

        // Daily 08:00 AM - Expiration Warnings (3 days before)
        this.jobs.push(
            cron.schedule('0 8 * * *', this.sendExpirationWarnings.bind(this), {
                scheduled: true,
                timezone: 'America/Caracas'
            })
        );

        // Daily 08:00 AM - Notify Admin of Today's Expirations
        this.jobs.push(
            cron.schedule('0 8 * * *', this.notifyAdminExpirationsToday.bind(this), {
                scheduled: true,
                timezone: 'America/Caracas'
            })
        );

        // Daily 09:00 PM - Remind Teachers to Submit Attendance
        this.jobs.push(
            cron.schedule('0 21 * * *', this.remindTeachersAttendance.bind(this), {
                scheduled: true,
                timezone: 'America/Caracas'
            })
        );

        // Weekly Sunday 08:00 AM - Student Absenteeism Alerts
        this.jobs.push(
            cron.schedule('0 8 * * 0', this.sendAbsenteeismAlerts.bind(this), {
                scheduled: true,
                timezone: 'America/Caracas'
            })
        );

        // Monthly 1st at 08:00 AM - Send Recovery Messages
        this.jobs.push(
            cron.schedule('0 8 1 * *', this.sendRecoveryMessages.bind(this), {
                scheduled: true,
                timezone: 'America/Caracas'
            })
        );

        // Monthly Last Day at 08:00 PM - Recognize Top Teachers
        this.jobs.push(
            cron.schedule('0 20 28-31 * *', this.recognizeTopTeachers.bind(this), {
                scheduled: true,
                timezone: 'America/Caracas'
            })
        );

        console.log(`✅ ${this.jobs.length} cron jobs initialized successfully`);
    }

    /**
     * Daily 08:00 AM - Send class reminders for tomorrow
     */
    async sendClassReminders() {
        try {
            console.log('🔔 Running: Class Reminders for Tomorrow');

            // Get tomorrow's date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            // Get all classes scheduled for tomorrow
            const classes = await knex('classes')
                .whereRaw('DATE(date) = ?', [tomorrowStr])
                .whereNull('deleted_at')
                .select('id', 'name', 'date', 'time', 'teacher_id');

            console.log(`   Found ${classes.length} classes for tomorrow`);

            for (const classItem of classes) {
                // Get enrolled students for this class
                const enrolledStudents = await knex('registrations')
                    .where('class_id', classItem.id)
                    .where('status', 'active')
                    .whereNull('deleted_at')
                    .select('student_id');

                // Notify each student
                for (const enrollment of enrolledStudents) {
                    await notificationService.notifyUser(enrollment.student_id, {
                        title: '¡Mañana bailamos!',
                        message: `Tienes programada tu clase de ${classItem.name} a las ${classItem.time}. ¡Te esperamos!`,
                        category: 'CLASS',
                        related_entity_id: classItem.id,
                        deep_link: `/classes/${classItem.id}`
                    });
                }

                console.log(`   ✓ Sent ${enrolledStudents.length} reminders for ${classItem.name}`);
            }
        } catch (error) {
            console.error('❌ Error in sendClassReminders:', error);
        }
    }

    /**
     * Daily 08:00 AM - Warn users about expiring plans (3 days before)
     */
    async sendExpirationWarnings() {
        try {
            console.log('🔔 Running: Expiration Warnings (3 days)');

            // Get date 3 days from now
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            const targetDate = threeDaysFromNow.toISOString().split('T')[0];

            // Get plans expiring in 3 days
            const expiringPlans = await knex('user_plan as up')
                .join('users as u', 'up.user_id', 'u.id')
                .join('plans as p', 'up.plan_id', 'p.id')
                .whereRaw('DATE(up.end_date) = ?', [targetDate])
                .where('up.status', 'active')
                .select('u.id as user_id', 'u.first_name', 'p.name as plan_name', 'up.end_date');

            console.log(`   Found ${expiringPlans.length} plans expiring in 3 days`);

            for (const userPlan of expiringPlans) {
                await notificationService.notifyUser(userPlan.user_id, {
                    title: 'Plan por vencer',
                    message: `Tu plan ${userPlan.plan_name} vence en 3 días. Renueva hoy para mantener tu cupo en las clases.`,
                    category: 'PAYMENT',
                    deep_link: '/plans/renew'
                });
            }

            console.log(`   ✓ Sent ${expiringPlans.length} expiration warnings`);
        } catch (error) {
            console.error('❌ Error in sendExpirationWarnings:', error);
        }
    }

    /**
     * Daily 08:00 AM - Notify admin/receptionist of today's expirations
     */
    async notifyAdminExpirationsToday() {
        try {
            console.log('🔔 Running: Admin Notifications - Expirations Today');

            const today = new Date().toISOString().split('T')[0];

            const expiringToday = await knex('user_plan as up')
                .join('users as u', 'up.user_id', 'u.id')
                .join('plans as p', 'up.plan_id', 'p.id')
                .whereRaw('DATE(up.end_date) = ?', [today])
                .where('up.status', 'active')
                .select('u.first_name', 'u.last_name', 'p.name as plan_name');

            if (expiringToday.length > 0) {
                const studentNames = expiringToday.map(s => `${s.first_name} ${s.last_name}`).join(', ');

                await notificationService.notifyRole('ADMIN', {
                    title: 'Vencimientos de hoy',
                    message: `${expiringToday.length} plan(es) vencen hoy: ${studentNames}`,
                    category: 'PAYMENT'
                });

                await notificationService.notifyRole('RECEPTIONIST', {
                    title: 'Vencimientos de hoy',
                    message: `${expiringToday.length} plan(es) vencen hoy: ${studentNames}`,
                    category: 'PAYMENT'
                });

                console.log(`   ✓ Notified admin/receptionist of ${expiringToday.length} expirations`);
            } else {
                console.log('   No expirations today');
            }
        } catch (error) {
            console.error('❌ Error in notifyAdminExpirationsToday:', error);
        }
    }

    /**
     * Daily 09:00 PM - Remind teachers to submit attendance
     */
    async remindTeachersAttendance() {
        try {
            console.log('🔔 Running: Teacher Attendance Reminders');

            const today = new Date().toISOString().split('T')[0];

            // Get classes that occurred today
            const classesToday = await knex('classes as c')
                .whereRaw('DATE(c.date) = ?', [today])
                .whereNull('c.deleted_at')
                .select('c.id', 'c.name', 'c.teacher_id');

            for (const classItem of classesToday) {
                // Check if attendance was recorded
                const attendanceCount = await knex('attendances')
                    .where('class_id', classItem.id)
                    .whereRaw('DATE(date) = ?', [today])
                    .count('* as count')
                    .first();

                // If no attendance recorded, remind teacher
                if (attendanceCount.count === 0 && classItem.teacher_id) {
                    await notificationService.notifyUser(classItem.teacher_id, {
                        title: 'Clase terminada',
                        message: `No olvides registrar la asistencia de ${classItem.name}. ¡Es importante para el seguimiento de los estudiantes!`,
                        category: 'ATTENDANCE',
                        related_entity_id: classItem.id,
                        deep_link: `/classes/${classItem.id}/attendance`
                    });

                    console.log(`   ✓ Reminded teacher for class: ${classItem.name}`);
                }
            }
        } catch (error) {
            console.error('❌ Error in remindTeachersAttendance:', error);
        }
    }

    /**
     * Weekly (Sundays) - Alert students and admin about absenteeism
     */
    async sendAbsenteeismAlerts() {
        try {
            console.log('🔔 Running: Absenteeism Alerts');

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Find students with 3+ consecutive absences
            const absentStudents = await knex('registrations as r')
                .join('users as u', 'r.student_id', 'u.id')
                .join('classes as c', 'r.class_id', 'c.id')
                .leftJoin('attendances as a', function () {
                    this.on('a.student_id', '=', 'r.student_id')
                        .andOn('a.class_id', '=', 'r.class_id')
                        .andOnVal('a.status', '=', 'present')
                        .andOn('a.date', '>=', knex.raw('?', [sevenDaysAgo]));
                })
                .where('r.status', 'active')
                .whereNull('a.id') // No attendance found
                .groupBy('r.student_id', 'u.first_name', 'u.last_name')
                .havingRaw('COUNT(DISTINCT c.id) >= 3')
                .select('r.student_id', 'u.first_name', 'u.last_name', knex.raw('COUNT(DISTINCT c.id) as missed_classes'));

            for (const student of absentStudents) {
                // Notify student
                await notificationService.notifyUser(student.student_id, {
                    title: '¡Te extrañamos en DanceFlow!',
                    message: `Tienes clases disponibles en tu plan. ¡Vuelve a la pista y sigue mejorando!`,
                    category: 'ATTENDANCE'
                });

                // Notify admin about at-risk student
                await notificationService.notifyRole('ADMIN', {
                    title: 'Riesgo de Retención',
                    message: `${student.first_name} ${student.last_name} ha faltado a ${student.missed_classes} clases en la última semana.`,
                    category: 'ATTENDANCE',
                    related_entity_id: student.student_id,
                    deep_link: `/students/${student.student_id}`
                });
            }

            console.log(`   ✓ Sent ${absentStudents.length} absenteeism alerts`);
        } catch (error) {
            console.error('❌ Error in sendAbsenteeismAlerts:', error);
        }
    }

    /**
     * Monthly (1st) - Send recovery messages to inactive students
     */
    async sendRecoveryMessages() {
        try {
            console.log('🔔 Running: Recovery Messages');

            const fifteenDaysAgo = new Date();
            fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

            // Find students with active plans but no attendance in 15+ days
            const inactiveStudents = await knex('user_plan as up')
                .join('users as u', 'up.user_id', 'u.id')
                .leftJoin('attendances as a', function () {
                    this.on('a.student_id', '=', 'up.user_id')
                        .andOn('a.date', '>=', knex.raw('?', [fifteenDaysAgo]));
                })
                .where('up.status', 'active')
                .where('up.end_date', '>=', new Date())
                .whereNull('a.id')
                .groupBy('up.user_id', 'u.first_name')
                .select('up.user_id', 'u.first_name');

            for (const student of inactiveStudents) {
                await notificationService.notifyUser(student.user_id, {
                    title: '¿Listo para volver a la pista?',
                    message: `${student.first_name}, te extrañamos en clase. Tu plan sigue activo, ¡ven a bailar!`,
                    category: 'SYSTEM'
                });
            }

            console.log(`   ✓ Sent ${inactiveStudents.length} recovery messages`);
        } catch (error) {
            console.error('❌ Error in sendRecoveryMessages:', error);
        }
    }

    /**
     * Monthly (Last day) - Recognize teachers with high retention
     */
    async recognizeTopTeachers() {
        try {
            console.log('🔔 Running: Teacher Recognition');

            // Check if today is last day of month
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (tomorrow.getMonth() === today.getMonth()) {
                return; // Not last day of month
            }

            // Get teachers and calculate retention (simplified version)
            const teachers = await knex('classes as c')
                .join('users as u', 'c.teacher_id', 'u.id')
                .where('c.teacher_id', '!=', null)
                .whereNull('c.deleted_at')
                .groupBy('c.teacher_id', 'u.first_name', 'u.last_name')
                .select('c.teacher_id', 'u.first_name', 'u.last_name');

            for (const teacher of teachers) {
                // Count renewals for teacher's students this month
                const stats = await knex('registrations as r')
                    .join('classes as c', 'r.class_id', 'c.id')
                    .join('user_plan as up', 'r.student_id', 'up.user_id')
                    .where('c.teacher_id', teacher.teacher_id)
                    .where('up.status', 'active')
                    .whereRaw('MONTH(up.start_date) = MONTH(NOW())')
                    .count('* as renewals')
                    .first();

                // If high retention (>5 renewals as simple threshold)
                if (stats.renewals >= 5) {
                    await notificationService.notifyUser(teacher.teacher_id, {
                        title: '¡Gran trabajo!',
                        message: `${teacher.first_name}, tus estudiantes están renovando. ¡Sigue así!`,
                        category: 'SYSTEM'
                    });

                    console.log(`   ✓ Recognized teacher: ${teacher.first_name} ${teacher.last_name}`);
                }
            }
        } catch (error) {
            console.error('❌ Error in recognizeTopTeachers:', error);
        }
    }

    /**
     * Stop all cron jobs (for graceful shutdown)
     */
    stop() {
        console.log('🛑 Stopping all cron jobs...');
        this.jobs.forEach(job => job.stop());
        console.log('✅ All cron jobs stopped');
    }
}

export default new CronService();
