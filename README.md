# DUYDODEE PREMIUM
**แพลตฟอร์มสตรีมมิ่ง 4K HDR ระดับพรีเมียม - Cinematic Sport Edition**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.12.2-orange.svg)
![Vite](https://img.shields.io/badge/Vite-8.0.14-purple.svg)

## 🎯 ภาพรวมโปรเจค

DUYDODEE PREMIUM เป็นแพลตฟอร์มสตรีมมิ่งที่ทันสมัย พัฒนาด้วย Modern Web Stack และ Firebase เป็น Backend หลัก ออกแบบมาเพื่อการใช้งานระดับ Production ที่เน้นความปลอดภัย ประสิทธิภาพ และประสบการณ์ผู้ใช้

## ✨ ฟีเจอร์หลัก

### 🎬 ระบบสตรีมมิ่ง
- รองรับภาพยนตร์และซีรีส์ 4K HDR
- ระบบ Hero Slider แบบอัตโนมัติ
- ระบบค้นหาขั้นสูงด้วย Algolia
- ระบบจัดเรียงและกรองเนื้อหา

### 👨‍💼 Admin Dashboard
- จัดการภาพยนตร์และซีรีส์
- จัดการผู้ใช้และสิทธิ์
- จัดการ Hero Slider
- ระบบรายงานและสถิติ
- จัดการการชำระเงิน VIP

### 💎 VIP Membership
- ระบบสมาชิกพรีเมียม
- แผนการชำระเงินหลากหลาย
- ระบบตรวจสอบสถานะ VIP
- ประวัติการชำระเงิน

### 📱 PWA Features
- ติดตั้งได้บน Desktop และ Mobile
- Offline Support ด้วย Service Worker
- Push Notifications
- Background Sync
- App Manifest

### 🔒 ความปลอดภัย
- Firebase Security Rules ขั้นสูง
- Role-based Access Control
- Environment Variables Management
- Input Validation & Sanitization
- Error Monitoring ด้วย Sentry

### 🚀 Performance
- Lazy Loading สำหรับรูปภาพ
- Code Splitting อัตโนมัติ
- Caching Strategy ที่เหมาะสม
- Performance Monitoring
- Error Handling & Retry Logic

### ♿ Accessibility
- ARIA Labels และ Roles
- Keyboard Navigation
- Screen Reader Support
- Color Contrast Optimization
- Focus Management

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **HTML5** - โครงสร้างหน้าเว็บ
- **Vanilla JavaScript** - ตรรกะแอปพลิเคชัน
- **Tailwind CSS** - Styling
- **Vite** - Build Tool

### Backend & Services
- **Firebase** - Authentication, Firestore, Storage
- **Algolia** - Search Engine
- **Google Analytics** - Analytics
- **Sentry** - Error Monitoring

### Development Tools
- **Jest** - Testing
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **PostCSS** - CSS Processing

## 📦 การติดตั้งและใช้งาน

### Prerequisites
- Node.js 18.x หรือสูงกว่า
- npm หรือ yarn
- Firebase Account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/DUYDODEE-HD.git
cd DUYDODEE-HD

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

### Environment Setup

สร้างไฟล์ `.env.local` และกำหนดค่าต่อไปนี้:

```bash
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=duydodeesport.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=duydodeesport
VITE_FIREBASE_STORAGE_BUCKET=duydodeesport.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=30514101130
VITE_FIREBASE_APP_ID=1:30514101130:web:1ec44f2b09367468132e49
VITE_FIREBASE_MEASUREMENT_ID=G-7EC2RQZH22

# Site Configuration
VITE_SITE_URL=https://duydodee.web.app
VITE_SITE_NAME=DUYDODEE PREMIUM

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false
```

## 🚀 Deployment

### Build for Production

```bash
# Build production bundle
npm run build:prod

# Preview production build
npm run preview
```

### Deploy to Firebase

```bash
# Full deployment
npm run deploy

# Deploy hosting only
npm run deploy:hosting
```

### Using Deploy Script (Windows)

```bash
.\deploy.bat
```

## 📂 โครงสร้างโปรเจค

```
DUYDODEE-HD/
├── public/                      # Frontend assets
│   ├── src/                    # Source code
│   │   ├── admin/              # Admin functionality
│   │   ├── components/         # UI components
│   │   ├── config/             # Configuration files
│   │   ├── middleware/         # Auth middleware
│   │   ├── pages/              # Page logic
│   │   ├── services/           # Firebase & other services
│   │   └── utils/              # Utility functions
│   ├── css/                    # Stylesheets
│   ├── assets/                 # Images and static files
│   └── sw.js                   # Service Worker
├── docs/                       # Documentation
├── .github/                    # GitHub workflows
├── .env.example               # Environment template
├── firebase.json              # Firebase configuration
├── firestore.rules            # Firestore security rules
├── package.json               # Project dependencies
└── vite.config.js            # Vite configuration
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔍 Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run security audit
npm audit
```

## 📚 Documentation

- [Full Documentation](docs/README.md) - เอกสารประกอบทั้งหมด
- [API Documentation](docs/API.md) - API Reference
- [Deployment Guide](docs/DEPLOYMENT.md) - คู่มือการ Deploy
- [Backup Strategy](docs/BACKUP_STRATEGY.md) - ยุทธศาสตร์การ Backup
- [Service Account Setup](SERVICE_ACCOUNT_SETUP.md) - การตั้งค่า Service Account

## 🔒 Security Best Practices

1. **Environment Variables** - ไม่ commit ไฟล์ `.env.local` ลง Git
2. **Firebase Rules** - ตรวจสอบ Security Rules อย่างเข้มงวด
3. **Input Validation** - ตรวจสอบข้อมูลทุกครั้งก่อนบันทึก
4. **Error Handling** - ไม่แสดงข้อมูลสำคัญใน error messages
5. **Service Account** - เก็บ Service Account Key อย่างปลอดภัย

## 🎨 Architecture Highlights

### Layered Architecture
- **Presentation Layer** - UI Components
- **Business Logic Layer** - Services & Controllers
- **Data Layer** - Firebase Integration
- **Utility Layer** - Helper Functions

### Key Patterns
- **Service Pattern** - แยก business logic ออกจาก UI
- **Repository Pattern** - Abstraction สำหรับ data access
- **Error Handling** - Centralized error management
- **Validation** - Input validation ทุกจุด

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

ISC License - see LICENSE file for details

## 👥 Team

- **Development Team** - DUYDODEE Development Team
- **Project Lead** - [Your Name]

## 📞 Support

หากมีข้อสงสัยหรือต้องการสนับสนุน กรุณาติดต่อ:
- Email: support@duydodee.com
- GitHub Issues: [Create Issue](https://github.com/yourusername/DUYDODEE-HD/issues)

---

**DUYDODEE PREMIUM** - ก้าวข้ามขีดจำกัด สู่โลกความบันเทิงระดับมาสเตอร์พีซ
