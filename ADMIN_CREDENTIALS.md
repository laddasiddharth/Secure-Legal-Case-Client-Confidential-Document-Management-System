# 🔐 Admin Credentials

## System Administrator Account

**Created:** January 30, 2026

---

### 📋 Login Credentials

```
Username:     admin
Email:        admin@legaldocs.com
Password:     Admin@SecureLegal2026
Role:         Administrator
Full Name:    System Administrator
Phone:        +1-555-0100
```

---

### 🚀 How to Login

1. **Navigate to:** http://localhost:8081/login

2. **Step 1 - Enter Credentials:**
   - Email: `admin@legaldocs.com`
   - Password: `Admin@SecureLegal2026`
   - Click "Sign In"

3. **Step 2 - OTP Verification:**
   - Check your email: `admin@legaldocs.com`
   - Enter the 6-digit OTP code
   - Click "Verify OTP"

4. **Access Dashboard:**
   - You'll be redirected to: `/admin/dashboard`
   - Full system access granted

---

### 🔧 Admin Capabilities

As an administrator, you can:

✅ **User Management**

- Create new users (Lawyer, Client, Admin)
- Edit user details
- Lock/unlock accounts
- Delete users
- View user activity

✅ **System Monitoring**

- View all cases in the system
- Access all documents
- Monitor system health
- View real-time statistics

✅ **Audit & Security**

- View comprehensive audit logs
- Track all user actions
- Monitor failed login attempts
- Review security events

✅ **Full Access**

- All lawyer capabilities
- All client capabilities
- System-wide administration

---

### ⚠️ IMPORTANT SECURITY NOTES

1. **Change Password After First Login**
   - This is a default password
   - Create a unique, strong password
   - Store it securely

2. **Secure Storage**
   - Do NOT store credentials in plain text
   - Use a password manager
   - Keep this file secure

3. **Access Control**
   - Do NOT share admin credentials
   - Create separate admin accounts for other administrators
   - Use principle of least privilege

4. **Two-Factor Authentication**
   - OTP is sent to email for every login
   - Keep email account secure
   - Monitor for unauthorized access

5. **Regular Monitoring**
   - Review audit logs regularly
   - Monitor failed login attempts
   - Check for suspicious activity

---

### 🎯 First Steps After Login

1. **Create Additional Users**
   - Navigate to User Management
   - Create lawyer and client accounts
   - Assign appropriate roles

2. **Review System Settings**
   - Check system health
   - Verify all services running
   - Review security configuration

3. **Set Up Audit Monitoring**
   - Review audit log settings
   - Set up alerts (if available)
   - Monitor system activity

4. **Create Backup Admin**
   - Create a second admin account
   - Store credentials separately
   - Use for emergency access

---

### 📊 Admin Dashboard Features

**Statistics Panel:**

- Total users (by role)
- Active cases
- Total documents
- Recent audit events

**User Management:**

- Create/Edit/Delete users
- Lock/Unlock accounts
- View user details
- Manage permissions

**Audit Logs:**

- View all system events
- Filter by user/action/date
- Export logs
- Security monitoring

**System Health:**

- Database status
- API server status
- Email service status
- Encryption status

---

### 🔒 Security Features Active

✅ **Authentication:**

- Email + Password (SFA)
- OTP via Email (MFA)
- JWT tokens (24-hour expiry)
- Account lockout (5 failed attempts)

✅ **Encryption:**

- AES-256-GCM for documents
- RSA-2048 key pairs
- bcrypt password hashing
- SHA-256 file integrity

✅ **Audit Trail:**

- All actions logged
- IP address tracking
- User agent logging
- Timestamp recording

✅ **Access Control:**

- Role-based permissions (RBAC)
- Resource-level authorization
- Unauthorized access logging

---

### 📞 Support & Help

**For Technical Issues:**

- Check `USER_GUIDE.md` for detailed instructions
- Check audit logs for error details

**For Security Concerns:**

- Review audit logs immediately
- Lock compromised accounts
- Change passwords
- Contact system administrator

---

### 🗑️ Account Deletion

**To delete this admin account:**

⚠️ **WARNING:** Only do this if you have another admin account!

```bash
# Via MongoDB
db.users.deleteOne({ email: "admin@legaldocs.com" })

# Or via Admin API (requires another admin)
DELETE /api/admin/users/:userId
```

---

## 📝 Change Log

| Date       | Action  | Details                                  |
| ---------- | ------- | ---------------------------------------- |
| 2026-01-30 | Created | Initial admin account created via script |

---

**KEEP THIS FILE SECURE - DELETE AFTER SAVING CREDENTIALS ELSEWHERE**

---

_Last Updated: January 30, 2026_
