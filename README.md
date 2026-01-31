# ⚖️ Secure Legal Case & Client Confidential Document Management System

### _Enterprise-Grade Confidential Document Management for Modern Jurisprudence_

[![Security](https://img.shields.io/badge/Security-AES--256--GCM-copper)](https://github.com/)
[![Auth](https://img.shields.io/badge/Auth-MFA%20%2B%20RBAC-blue)](https://github.com/)
[![System](https://img.shields.io/badge/System-Legal%20DMS-0f0f0f)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](https://github.com/)

This system is a sophisticated, high-security legal document management platform designed to handle the most sensitive judicial data. Built with a **Security-First** philosophy, the system integrates military-grade encryption, multi-layered authentication, and immutable audit trails within a premium, atmospheric user interface.

---

## 🏛️ Executive Summary

In a landscape of increasing digital threats, this platform provides a "Zero-Trust" environment for legal professionals. Every document uploaded is treated as a critical asset, protected by hybrid encryption (RSA + AES) and verified via cryptographic hashes and digital signatures.

### **Core Security Pillars**

1.  **Identity Control**: Multi-Factor Authentication (MFA) via secure Email OTP.
2.  **Granular Authorization**: Strict Role-Based Access Control (RBAC) preventing unauthorized lateral movement.
3.  **Data Sovereignty**: End-to-end encryption at rest and in transit.
4.  **Proof of Integrity**: SHA-256 hashing and RSA-PSS Digital Signatures for non-repudiation.
5.  **Chain of Custody**: Immutable system-wide audit logging for every sensitive operation.

---

## ✨ Primary Features

### 🛡️ **Military-Grade Encryption**

- **Hybrid Architecture**: Utilizes **RSA-2048** for secure key exchange and **AES-256-GCM** for high-speed, authenticated document encryption.
- **Zero-Knowledge Storage**: Even database administrators cannot view document contents without user-specific private keys.

### 🔑 **Secure Access & RBAC**

- **MFA**: Mandatory 6-digit OTP verification for every login.
- **Role Hierarchy**:
  - **Admins**: System health, User lifecycle management, and Full Audit Review.
  - **Lawyers**: Case creation, Document management, and Digital Signing.
  - **Clients**: Secure, Read-Only access to their specific case files.

### 🔍 **Verification & Encoding**

- **QR Verification**: Every legal case generates a unique, encrypted QR code for physical-to-digital authenticity verification.
- **Base64 Transport**: Binary-safe data handling for reliable document retrieval across all browsers.

### ✍️ **Integrity Verification**

- **Digital Signatures**: Lawyers can apply verifiable RSA signatures to evidence, ensuring authenticity in court.
- **Hash Integrity**: Real-time SHA-256 checks on every download ensure documents haven't been tampered with at rest.

---

## 🛠️ Technical Stack

| Category         | Technologies                                                   |
| :--------------- | :------------------------------------------------------------- |
| **Frontend**     | React 18, TypeScript, Vite, Vanilla CSS (Dark Aesthetic Theme) |
| **Backend**      | Node.js, Express.js, Multer                                    |
| **Database**     | MongoDB Atlas, Mongoose ODM                                    |
| **Security**     | bcryptjs, JWT, Node Crypto API, RSA/AES-GCM                    |
| **Integrations** | Nodemailer (OTP Service), QRCode.js                            |

---

## 🚀 Deployment & Installation

The project follows a modern monorepo structure with separated `frontend` and `backend` directories.

### **1. Prerequisites**

- Node.js (v18.x or higher)
- MongoDB Atlas Account (or local MongoDB)
- SMTP Server (e.g., Gmail App Password) for MFA

### **2. Repository Setup**

```bash
git clone https://github.com/yourusername/secure-legal-dms.git
cd secure-legal-dms
npm run install:all
```

### **3. Environment Configuration**

Navigate to `backend/` and create a `.env` file:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_complex_security_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
PORT=5000
FRONTEND_URL=http://localhost:8080
```

### **4. Launching the System**

From the **root folder**, execute:

```bash
npm run dev:all
```

- **Frontend**: `http://localhost:8080`
- **Backend**: `http://localhost:5000`

---

## 📊 API Architecture

### **Authentication**

- `POST /api/auth/register` - Create new identities.
- `POST /api/auth/login` - Initiate MFA session.
- `POST /api/auth/verify-otp` - Complete secure login.

### **Legal Operations**

- `GET /api/cases` - Retrieve role-filtered case lists.
- `POST /api/documents/upload` - Encrypt and store new evidence.
- `GET /api/documents/:id` - Decrypt and download verified files.
- `GET /api/cases/:id/qr` - Generate verification QR codes.

### **System Control**

- `GET /api/admin/audit-logs` - Access the system audit trail.
- `PUT /api/admin/users/:id/lock` - Instantly revoke user access.

---

## 🔒 Security Compliance Note

This system utilizes FIPS-compliant encryption standards (AES-256-GCM) and follows NIST SP 800-63-2 guidelines for digital identity. All cryptographic operations are performed using the native Node.js Crypto module for maximum performance and security.

---

**Developed for Secure Legal Systems**
_"Providing the Digital Seal of Trust for the Legal Industry"_
