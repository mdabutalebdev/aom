import cors, { CorsOptions } from 'cors';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import config from './app/config';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { AuthRoutes } from './app/modules/auth/auth.routes';
import { UserRoutes } from './app/modules/user/user.routes';
import { ContactRoutes } from './app/modules/contact/contact.routes';
import { SettingsRoutes } from './app/modules/settings/settings.routes';
import { AdmissionRoutes } from './app/modules/admission/admission.routes';
import { ClassRoutes } from './app/modules/class/class.routes';
import { TestimonialRoutes } from './app/modules/testimonial/testimonial.routes';
import { AchievementRoutes } from './app/modules/achievement/achievement.routes';
import { PresentationRoutes } from './app/modules/presentation/presentation.routes';
import { TeacherRoutes } from './app/modules/teacher/teacher.routes';
import { StudentRoutes } from './app/modules/student/student.routes';
import { GroupRoutes } from './app/modules/group/group.routes';
import { PaymentRoutes } from './app/modules/payment/payment.routes';
import { SalaryRoutes } from './app/modules/salary/salary.routes';
import { ScheduleRoutes } from './app/modules/schedule/schedule.routes';
import { AttendanceRoutes } from './app/modules/attendance/attendance.routes';
import { NotificationRoutes } from './app/modules/notification/notification.routes';
import { ProgressRoutes } from './app/modules/progress/progress.routes';
import { MaterialRoutes } from './app/modules/material/material.routes';
import { AnalyticsRoutes } from './app/modules/analytics/analytics.routes';
import { TeacherApplicationRoutes } from './app/modules/teacherApplication/teacherApplication.routes';
import { CertificateRoutes } from './app/modules/certificate/certificate.routes';
import { MessageRoutes } from './app/modules/message/message.routes';
import { HomeworkRoutes } from './app/modules/homework/homework.routes';
import { ExamResultRoutes } from './app/modules/examResult/examResult.routes';

const app: Application = express();

// ✅ Security: Helmet (HTTP headers)
app.use(helmet());

// ✅ Security: CORS
// Production client origin(s) come from CLIENT_URL. Multiple domains can be
// listed comma-separated (e.g. "https://aom.com,https://www.aom.com"). Local
// dev ports and any *.vercel.app preview stay allowed.
// Whichever form of the domain is configured, accept the other one too — a
// visitor arriving on the www host would otherwise be blocked by CORS.
const withWwwVariant = (origin: string): string[] => {
  try {
    const url = new URL(origin);
    const swapped = new URL(origin);
    swapped.hostname = url.hostname.startsWith('www.')
      ? url.hostname.slice(4)
      : `www.${url.hostname}`;
    return [url.origin, swapped.origin];
  } catch {
    return [origin];
  }
};

const envOrigins = [
  ...new Set(
    (config.client_url || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .flatMap(withWwwVariant),
  ),
];

const corsOptions: CorsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5005', ...envOrigins, /\.vercel\.app$/],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Security: Rate Limiting (global — 500 req per 15min per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // increase for dev — reduce to 100 in production
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

// ✅ Security: Auth Rate Limiting (stricter — failed attempts per 15min)
// Prepared for '/api/auth/login' & '/api/auth/register' (wired up when the auth module lands).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // dev-friendly; reduce to ~10 in production
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts toward the limit
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ✅ Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Serve Static Files (For local development fallback when Cloudinary is missing)
import path from 'path';
app.use(
  '/uploads',
  // helmet()'s default Cross-Origin-Resource-Policy: same-origin blocks the
  // client (a different origin/port) from loading these images — relax it
  // only for this public static route, leaving the rest of the app's
  // security headers untouched.
  (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    // Allow the client (different origin) to fetch these public assets as a
    // blob — needed to download an uploaded certificate image as-is.
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(path.join(process.cwd(), 'uploads')),
);

// ✅ Security: NoSQL Injection Prevention
app.use(mongoSanitize());

// Health check
app.get('/', (req: Request, res: Response) => {
  res
    .status(200)
    .json({ success: true, message: 'AOM Online Madrasa Server is running 🚀' });
});

// ─── Application Routes (added per phase) ───────────────────
app.use('/api/auth', AuthRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/contacts', ContactRoutes);
app.use('/api/settings', SettingsRoutes);
app.use('/api/admissions', AdmissionRoutes);
app.use('/api/classes', ClassRoutes);
app.use('/api/testimonials', TestimonialRoutes);
app.use('/api/achievements', AchievementRoutes);
app.use('/api/presentations', PresentationRoutes);
app.use('/api/teachers', TeacherRoutes);
app.use('/api/students', StudentRoutes);
app.use('/api/groups', GroupRoutes);
app.use('/api/payments', PaymentRoutes);
app.use('/api/salaries', SalaryRoutes);
app.use('/api/schedules', ScheduleRoutes);
app.use('/api/attendance', AttendanceRoutes);
app.use('/api/notifications', NotificationRoutes);
app.use('/api/progress', ProgressRoutes);
app.use('/api/materials', MaterialRoutes);
app.use('/api/analytics', AnalyticsRoutes);
app.use('/api/teacher-applications', TeacherApplicationRoutes);
app.use('/api/certificates', CertificateRoutes);
app.use('/api/messages', MessageRoutes);
app.use('/api/homework', HomeworkRoutes);
app.use('/api/exam-results', ExamResultRoutes);

// Global error handler
app.use(globalErrorHandler);

export default app;
