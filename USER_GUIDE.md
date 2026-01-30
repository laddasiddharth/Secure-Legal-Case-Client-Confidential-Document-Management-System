# 📖 User Guide - Legal Document Management System

## 🚀 Getting Started

### First Time Setup

1. **Start the Application**

   ```bash
   npm run dev:all
   ```

   - Frontend: http://localhost:8081
   - Backend: http://localhost:5000

2. **Register Your Account**
   - Navigate to http://localhost:8081/register
   - Fill in your details
   - Choose your role (Lawyer, Client, or Admin)
   - Create a strong password

3. **Login**
   - Go to http://localhost:8081/login
   - Enter your email and password
   - Check your email for the OTP code
   - Enter the 6-digit OTP
   - You'll be redirected to your role-specific dashboard

---

## 👥 User Roles & Capabilities

### 👨‍⚖️ Lawyer Dashboard

**Access:** `/lawyer/dashboard`

**Capabilities:**

- ✅ Create and manage legal cases
- ✅ Upload encrypted documents to cases
- ✅ Assign cases to clients
- ✅ Update case status and notes
- ✅ Download and view all case documents
- ✅ View client information
- ✅ Track case progress

**Key Features:**

- **Case Management:** Create, update, and close cases
- **Document Upload:** Securely upload files with AES-256-GCM encryption
- **Client Assignment:** Link cases to specific clients
- **Status Tracking:** Monitor case progress (Open, Pending, Closed)

---

### 👤 Client Dashboard

**Access:** `/client/dashboard`

**Capabilities:**

- ✅ View assigned cases (read-only)
- ✅ Download case documents
- ✅ Track case status
- ✅ View case details and notes
- ✅ Access case history

**Key Features:**

- **Case Viewing:** See all cases assigned to you
- **Document Access:** Download encrypted documents securely
- **Progress Tracking:** Monitor your case status
- **Lawyer Contact:** View assigned lawyer information

---

### 🔧 Admin Dashboard

**Access:** `/admin/dashboard`

**Capabilities:**

- ✅ Full user management (Create, Edit, Delete)
- ✅ Lock/unlock user accounts
- ✅ View all cases in the system
- ✅ Access all documents
- ✅ View comprehensive audit logs
- ✅ System-wide statistics
- ✅ Monitor system health

**Key Features:**

- **User Management:** Complete control over all users
- **Audit Logs:** Track all system activity
- **Statistics:** Real-time system metrics
- **Security:** Monitor unauthorized access attempts

---

## 🔐 Security Features

### Password Requirements

Your password must include:

- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (@$!%\*?&)

**Examples of strong passwords:**

- `MyLawFirm@2026`
- `SecureClient#123`
- `Admin$Strong456`

### Two-Factor Authentication (2FA)

Every login requires:

1. **Email & Password** (Something you know)
2. **OTP Code** (Something you have - sent to your email)

**OTP Details:**

- 6-digit code
- Expires in 5 minutes
- Sent to your registered email
- One-time use only

### Account Security

- **Account Lockout:** After 5 failed login attempts
- **Session Timeout:** JWT tokens expire after 24 hours
- **Encryption:** All documents encrypted with AES-256-GCM
- **Audit Trail:** All actions logged with timestamp and IP

---

## 📁 Case Management (Lawyers)

### Creating a New Case

1. Navigate to your Lawyer Dashboard
2. Click "New Case" button
3. Fill in the case details:
   - **Title:** Brief case description
   - **Description:** Detailed case information
   - **Case Type:** Select from dropdown (Civil, Criminal, Corporate, etc.)
   - **Client:** Select the client from your client list
   - **Priority:** Low, Medium, High, or Urgent
4. Click "Create Case"
5. Case number will be auto-generated (e.g., CASE-2026-001)

### Updating a Case

1. Click on the case from your dashboard
2. Click "Edit" or "Update Status"
3. Modify the fields you want to change
4. Add notes if needed
5. Click "Save Changes"

### Closing a Case

1. Open the case details
2. Change status to "Closed"
3. Add final notes
4. Click "Save"
5. Closed date will be automatically recorded

---

## 📄 Document Management

### Uploading Documents (Lawyers)

1. Open a case
2. Click "Upload Document"
3. Select file from your computer
4. Choose document type:
   - Evidence
   - Contract
   - Agreement
   - Certificate
   - Report
   - Other
5. Add description (optional)
6. Click "Upload"

**Supported File Types:**

- PDF (.pdf)
- Word Documents (.doc, .docx)
- Text Files (.txt)
- Images (.jpg, .jpeg, .png)

**File Size Limit:** 10MB per file

**Security:**

- Files are encrypted with AES-256-GCM before storage
- SHA-256 hash generated for integrity verification
- Encryption keys securely stored

### Downloading Documents

1. Navigate to case documents
2. Click the download icon next to the document
3. File will be decrypted and downloaded
4. Integrity check performed automatically

**Note:** All downloads are logged in the audit trail.

---

## 👥 User Management (Admin)

### Creating a New User

1. Go to Admin Dashboard
2. Click "Add User"
3. Fill in user details:
   - Username
   - Email
   - Password (temporary - user should change)
   - Full Name
   - Phone Number
   - Role (Lawyer, Client, Admin)
4. Click "Create User"
5. User receives auto-generated RSA key pair

### Locking/Unlocking Accounts

1. Go to User Management
2. Find the user
3. Click the lock/unlock icon
4. Confirm action
5. User will be unable to login when locked

### Deleting Users

1. Go to User Management
2. Find the user
3. Click delete icon
4. Confirm deletion
5. **Warning:** This action cannot be undone

**Note:** You cannot delete your own admin account.

---

## 📊 Audit Logs (Admin)

### Viewing Audit Logs

1. Navigate to Admin Dashboard
2. Click "View Audit Logs"
3. Use filters to narrow down:
   - User
   - Action type
   - Date range
4. View detailed information:
   - Timestamp
   - User who performed action
   - Action type
   - Resource affected
   - IP address
   - User agent

### Common Audit Events

- `USER_REGISTERED` - New user registration
- `LOGIN_SUCCESS` - Successful login
- `LOGIN_FAILED` - Failed login attempt
- `CASE_CREATED` - New case created
- `CASE_UPDATED` - Case modified
- `DOCUMENT_UPLOADED` - Document added
- `DOCUMENT_DOWNLOADED` - Document accessed
- `UNAUTHORIZED_ACCESS_ATTEMPT` - Security violation

---

## 🔧 Troubleshooting

### Cannot Login

**Issue:** Login fails or OTP not received

**Solutions:**

1. Check your email spam/junk folder
2. Verify email address is correct
3. Wait 5 minutes for OTP to expire, then try again
4. Check if account is locked (contact admin)
5. Verify password is correct

### Account Locked

**Issue:** "Account is locked" message

**Solutions:**

1. Contact system administrator
2. Admin can unlock your account from User Management
3. Wait for automatic unlock (if configured)

### Document Upload Fails

**Issue:** Cannot upload document

**Solutions:**

1. Check file size (must be under 10MB)
2. Verify file type is supported
3. Ensure you have permission (Lawyer/Admin only)
4. Check internet connection
5. Try a different file

### Cannot Access Case

**Issue:** "Access denied" error

**Solutions:**

1. Verify you're assigned to the case
2. Check your role permissions
3. Contact the lawyer who created the case
4. Contact system administrator

---

## 📞 Support

### Getting Help

1. **Technical Issues:** Contact your system administrator
2. **Account Issues:** Email admin or use contact form
3. **Security Concerns:** Report immediately to admin

### Reporting Security Issues

If you notice:

- Unauthorized access attempts
- Suspicious activity
- Data integrity issues
- System vulnerabilities

**Immediately contact your system administrator.**

---

## 🎯 Best Practices

### For Lawyers

1. ✅ Always use strong, unique passwords
2. ✅ Keep case information up-to-date
3. ✅ Add detailed notes to cases
4. ✅ Verify document integrity after upload
5. ✅ Regularly review assigned cases
6. ✅ Log out when finished

### For Clients

1. ✅ Check your cases regularly
2. ✅ Download important documents
3. ✅ Keep your contact information updated
4. ✅ Report any discrepancies immediately
5. ✅ Never share your login credentials

### For Admins

1. ✅ Regularly review audit logs
2. ✅ Monitor failed login attempts
3. ✅ Keep user accounts up-to-date
4. ✅ Remove inactive users
5. ✅ Backup system regularly
6. ✅ Monitor system health

---

## 🔒 Security Reminders

- 🔐 Never share your password
- 📧 OTP codes are single-use only
- 🚫 Log out when using shared computers
- ✅ Enable email notifications
- 🔍 Report suspicious activity
- 💾 Backup important documents
- 🔄 Change password periodically

---

**For additional help, contact your system administrator.**

**Built with 🔒 for secure legal operations**
