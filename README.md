# DUYดูDEE PREMIUM

แพลตฟอร์มบริหารจัดการทรัพยากรกราฟิกฟุตบอลระดับพรีเมียม (Cinematic Sport Edition)

## Features
- ระบบจัดการสตรีมมิ่ง 4K HDR
- ระบบ Admin Dashboard สำหรับจัดการเนื้อหา
- ระบบประวัติการรับชมและ VIP Membership
- ระบบ PWA (Progressive Web App) สำหรับการใช้งาน Offline
- ระบบ SEO และ Analytics ครบถ้วน
- ระบบ Error Monitoring และ Performance Tracking
- ระบบ Accessibility สำหรับผู้พิการทางสายตา
- ระบบ Testing และ Code Quality Automation

## Quick Start
1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
2. ตั้งค่าไฟล์ `.env` (คัดลอกจาก `.env.example`)
3. รันโปรเจกต์:
   ```bash
   npm run dev
   ```
4. Deployment:
   ```bash
   .\deploy.bat
   ```

## Documentation

- [Full Documentation](docs/README.md) - เอกสารประกอบทั้งหมด
- [API Documentation](docs/API.md) - API Reference
- [Deployment Guide](docs/DEPLOYMENT.md) - คู่มือการ Deploy
- [Backup Strategy](docs/BACKUP_STRATEGY.md) - ยุทธศาสตร์การ Backup
- [Service Account Setup](SERVICE_ACCOUNT_SETUP.md) - การตั้งค่า Service Account

## Security
- ระบบสิทธิ์ Admin ผ่าน Firebase Rules
- ข้อมูลสำคัญถูกเก็บไว้ใน Environment Variables (ไม่ถูก Commit ลง Git)
- ระบบ Error Monitoring ด้วย Sentry
- Security Scanning อัตโนมัติใน CI/CD
- Firebase Security Rules ที่ได้รับการทดสอบแล้ว

## Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run security audit
npm audit
```

## Performance Optimization
- Lazy Loading สำหรับรูปภาพ
- Code Splitting อัตโนมัติ
- Caching Strategy ที่เหมาะสม
- Service Worker สำหรับ Offline Support
- Performance Monitoring แบบ Real-time

## PWA Features
- Installable บน Desktop และ Mobile
- Offline Support ด้วย Service Worker
- Push Notifications
- Background Sync
- App Manifest สำหรับการติดตั้ง

## SEO & Analytics
- Google Analytics 4 Integration
- Structured Data (Schema.org)
- Meta Tags และ Open Graph
- Sitemap และ Robots.txt
- Custom Event Tracking

## Accessibility
- ARIA Labels และ Roles
- Keyboard Navigation
- Screen Reader Support
- Color Contrast Optimization
- Focus Management
- Reduced Motion Support

## CI/CD Pipeline
- Automated Testing
- Code Quality Checks
- Security Scanning
- Automated Deployment to Staging/Production
- Database Backups
- Health Checks
- Rollback Capabilities

## Environment Variables

ตั้งค่า Environment Variables ในไฟล์ `.env.local`:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Site Configuration
VITE_SITE_URL=https://duydodee.web.app
VITE_SITE_NAME=DUYDODEE PREMIUM

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS=true

# Error Monitoring
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SENTRY_ENVIRONMENT=production
VITE_ENABLE_ERROR_MONITORING=true

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false
```

## Project Structure

```
DUYDODEE-HD/
├── public/                 # Frontend assets
│   ├── src/               # Source code
│   │   ├── admin/         # Admin functionality
│   │   ├── components/    # UI components
│   │   ├── middleware/    # Auth middleware
│   │   ├── pages/         # Page logic
│   │   ├── services/      # Firebase & other services
│   │   └── utils/         # Utility functions
│   ├── css/              # Stylesheets
│   ├── assets/           # Images and static files
│   └── sw.js             # Service Worker
├── docs/                 # Documentation
├── .github/              # GitHub workflows
└── config files          # Configuration files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC License - see LICENSE file for details
