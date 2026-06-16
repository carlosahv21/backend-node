import { Router } from 'express';
import authRoutes from '../domains/security/auth/auth.routes.js';
import userRoutes from '../domains/security/users/user.routes.js';
import roleRoutes from '../domains/security/roles/role.routes.js';
import permissionRoutes from '../domains/security/permissions/permission.routes.js';
import rolePermissionRoutes from '../domains/security/rolePermissions/rolePermission.routes.js';
import routeRoutes from '../domains/security/routes/route.routes.js';

import academyRoutes from '../domains/academy/academies/academy.routes.js';
import studentRoutes from '../domains/academy/students/student.routes.js';
import teacherRoutes from '../domains/academy/teachers/teacher.routes.js';
import classRoutes from '../domains/academy/classes/class.routes.js';
import attendanceRoutes from '../domains/academy/attendance/attendance.routes.js';
import blockRoutes from '../domains/academy/blocks/block.routes.js';
import connectionRoutes from '../domains/academy/connections/connections.routes.js';
import studentStatsRoutes from '../domains/academy/studentStats/studentStats.routes.js';
import teacherReviewsRoutes from '../domains/academy/teacherReviews/teacherReviews.routes.js';
import achievementRoutes from '../domains/academy/achievements/achievements.routes.js';
import userAchievementRoutes from '../domains/academy/userAchievements/userAchievements.routes.js';
import challengeRoutes from '../domains/academy/challenges/challenges.routes.js';
import userChallengeRoutes from '../domains/academy/userChallenges/userChallenges.routes.js';

import planRoutes from '../domains/billing/plans/plan.routes.js';
import paymentRoutes from '../domains/billing/payments/payment.routes.js';
import registrationRoutes from '../domains/billing/registrations/registration.routes.js';

import fieldRoutes from '../domains/fields/fields/field.routes.js';
import moduleRoutes from '../domains/fields/modules/module.routes.js';

import notificationRoutes from '../domains/notifications/notifications/notification.routes.js';

import reportsRoutes from '../domains/reports/reports/reports.routes.js';

import searchRoutes from '../domains/search/search/search.routes.js';

import settingsRoutes from '../domains/settings/settings/settings.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/rolePermissions', rolePermissionRoutes);
router.use('/routes', routeRoutes);

router.use('/academies', academyRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/attendances', attendanceRoutes);
router.use('/blocks', blockRoutes);
router.use('/user-connections', connectionRoutes);
router.use('/student-stats', studentStatsRoutes);
router.use('/teacher-reviews', teacherReviewsRoutes);
router.use('/achievements', achievementRoutes);
router.use('/user-achievements', userAchievementRoutes);
router.use('/challenges', challengeRoutes);
router.use('/user-challenges', userChallengeRoutes);

router.use('/plans', planRoutes);
router.use('/payments', paymentRoutes);
router.use('/registrations', registrationRoutes);

router.use('/fields', fieldRoutes);
router.use('/modules', moduleRoutes);

router.use('/notifications', notificationRoutes);

router.use('/reports', reportsRoutes);

router.use('/search', searchRoutes);

router.use('/settings', settingsRoutes);

export default router;