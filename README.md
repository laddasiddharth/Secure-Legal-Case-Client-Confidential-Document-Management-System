# 🔒 Secure Legal Document Management System

A production-grade legal document management system with military-grade encryption, designed for law firms and courts to handle extremely sensitive legal data with the highest security standards.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## ✨ Features

### 🔐 **5-Part Security Architecture**

1. **Multi-Factor Authentication (MFA)**
   - Password + Email OTP for enhanced security
   - bcrypt hashing with unique salt per user
   - Account lockout after failed attempts

2. **Role-Based Access Control (RBAC)**
   - Three distinct roles: Lawyer, Client, Admin
   - Access Control Matrix (ACL) for fine-grained permissions
   - Resource-level authorization

3. **Hybrid Encryption**
   - RSA-2048 for secure key exchange
   - AES-256-GCM for document encryption
   - Encryption at rest in MongoDB

4. **Digital Signatures & Hashing**
   - SHA-256 document hashing for integrity
   - RSA-PSS digital signatures
   - Non-repudiation guarantee

5. **Encoding & Verification**
   - QR code generation for case verification
   - Base64 encoding for secure data transfer
   - Quick access to case details

### 🎨 **Noir Legal Design**

A distinctive dark theme with:

- **Typography**: Crimson Text (serif) + JetBrains Mono (monospace)
- **Colors**: Dark charcoal backgrounds with copper/amber accents
- **Effects**: Atmospheric gradients, staggered animations, glow effects
- **UX**: Smooth 60fps performance, responsive design

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/legal-document-management.git
   cd legal-document-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/legal-docs
   JWT_SECRET=your-super-secret-jwt-key-change-this
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   PORT=5000
   FRONTEND_URL=http://localhost:8080
   ```

4. **Run the application**

   ```bash
   # Run both frontend and backend
   npm run dev:all

   # Or run separately
   npm run dev:frontend  # Frontend only (port 8080)
   npm run dev:backend   # Backend only (port 5000)
   ```

5. **Access the application**
   - Frontend: http://localhost:8081 (or 8080 if available)
   - Backend API: http://localhost:5000
   - Security Demo: http://localhost:8081/security-demo

6. **Create your first user**

   Register through the web interface:
   - Go to http://localhost:8081/register
   - Fill in your details
   - Choose your role (Lawyer, Client, or Admin)
   - Complete registration

   **Note:** Demo users have been removed. You'll need to create actual users.

## 📁 Project Structure

```
legal-document-management/
├── server/                      # Backend (Express + MongoDB)
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js             # User authentication & roles
│   │   ├── Case.js             # Legal case management
│   │   ├── Document.js         # Encrypted documents
│   │   └── AuditLog.js         # Security audit trail
│   ├── routes/                  # API endpoints
│   │   ├── auth.js             # Authentication routes
│   │   ├── cases.js            # Case management
│   │   ├── documents.js        # Document handling
│   │   └── admin.js            # Admin operations
│   └── index.js                # Server entry point
├── src/                         # Frontend (React + TypeScript)
│   ├── pages/                   # Page components
│   │   ├── LandingPage.tsx     # Home page
│   │   ├── LoginPage.tsx       # Login with MFA
│   │   ├── RegisterPage.tsx    # User registration
│   │   ├── DashboardPage.tsx   # User dashboard
│   │   └── SecurityDemoPage.tsx # Security showcase
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # React entry point
│   └── index.css               # Global Noir Legal theme
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── vite.config.ts              # Vite configuration
└── README.md                    # This file
```

## 🛡️ Security Features

### Attack Prevention

| Attack Type             | Countermeasure                  |
| ----------------------- | ------------------------------- |
| **Replay Attack**       | JWT expiry + OTP time limits    |
| **Unauthorized Access** | RBAC enforcement + ACL matrix   |
| **Document Tampering**  | Digital signatures (RSA-PSS)    |
| **Man-in-the-Middle**   | HTTPS + End-to-end encryption   |
| **Insider Threats**     | Comprehensive audit logging     |
| **Brute Force**         | Account lockout mechanism       |
| **XSS/Injection**       | Input validation + sanitization |

### Compliance

- **NIST SP 800-63-2** compliant authentication
- **GDPR** ready with audit trails
- **HIPAA** compatible encryption standards

## 🎯 User Roles

### 👨‍⚖️ Lawyer

- Full read/write access to case files
- Upload and manage evidence
- Sign legal documents
- Create and manage cases

### 👤 Client

- Read-only access to their cases
- View evidence and documents
- Track case progress
- Receive notifications

### 🔧 Admin

- Full system access
- User management
- Audit log review
- System configuration

## 🔧 Technology Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM

### Security

- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **crypto** (Web Crypto API) - Encryption
- **nodemailer** - Email OTP delivery
- **qrcode** - QR code generation

## 📊 API Endpoints

### Authentication

```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login + send OTP
POST   /api/auth/verify-otp    # Verify OTP + get JWT
POST   /api/auth/logout        # Logout user
```

### Cases

```
GET    /api/cases              # Get all cases (filtered by role)
POST   /api/cases              # Create new case
GET    /api/cases/:id          # Get case details
PUT    /api/cases/:id          # Update case
```

### Documents

```
POST   /api/documents/upload   # Upload encrypted document
GET    /api/documents/:id      # Download document
POST   /api/documents/sign     # Sign document
POST   /api/documents/verify   # Verify signature
```

### Admin

```
GET    /api/admin/users        # Get all users
GET    /api/admin/audit-logs   # Get audit logs
PUT    /api/admin/users/:id    # Update user
```

## 🎨 Design System

### Color Palette

```css
/* Noir Legal Theme */
--primary-color: #1a1a1a /* Deep charcoal */ --secondary-color: #d4a574
  /* Copper/amber */ --accent-color: #ff6b35 /* Vibrant orange */
  --bg-primary: #0f0f0f /* Almost black */ --text-primary: #e8e8e8
  /* Light gray */;
```

### Typography

- **Headings**: Crimson Text (serif) - Legal authority
- **Labels/Code**: JetBrains Mono (monospace) - Technical precision
- **Body**: Crimson Text - Readability

## 🚧 Development Roadmap

- [x] Phase 1: Project Setup & Foundation
- [ ] Phase 2: Authentication System (SFA + MFA)
- [ ] Phase 3: Authorization (RBAC + ACL)
- [ ] Phase 4: Encryption (RSA + AES)
- [ ] Phase 5: Digital Signatures & Hashing
- [ ] Phase 6: QR Code & Encoding
- [ ] Phase 7: Security Demo & Testing

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

| Variable       | Description                | Example                                |
| -------------- | -------------------------- | -------------------------------------- |
| `MONGODB_URI`  | MongoDB connection string  | `mongodb://localhost:27017/legal-docs` |
| `JWT_SECRET`   | Secret key for JWT signing | `your-secret-key`                      |
| `SMTP_HOST`    | SMTP server hostname       | `smtp.gmail.com`                       |
| `SMTP_PORT`    | SMTP server port           | `587`                                  |
| `SMTP_USER`    | SMTP username              | `your-email@gmail.com`                 |
| `SMTP_PASS`    | SMTP password/app password | `your-app-password`                    |
| `PORT`         | Backend server port        | `5000`                                 |
| `FRONTEND_URL` | Frontend URL for CORS      | `http://localhost:8080`                |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Inspired by real-world legal document management needs
- Security architecture based on NIST guidelines
- Design influenced by modern dark themes and legal aesthetics

## 📞 Support

For support, email your.email@example.com or open an issue on GitHub.

---

**Built with 🔒 for secure legal operations**

_"Where confidentiality meets technology"_
