# 🔐 Security & Credential Management

## ⚠️ Critical: Never Commit Sensitive Files

This project uses `.gitignore` to prevent accidental commits of:

### 🚫 Files Ignored (Never Committed)
- `.env` - All environment variables with credentials
- `.env.local` - Local development overrides
- `.env.*.local` - Environment-specific secrets
- `.postgres.sql` - Database setup scripts with passwords
- `setup-postgres.ps1` - Database initialization script
- `instruction.md` - Internal documentation
- `logs/` - Application logs
- `node_modules/` - Dependencies
- `coverage/` - Test coverage reports
- `dist/` - Compiled files

### ✅ Files Used Instead (Safe to Commit)
- `.env.example` - Template showing all required variables with dummy values
- `README.md` - Project documentation
- `package.json` - Dependencies list
- `prisma/schema.prisma` - Database schema (no credentials)
- Source code (`src/**/*.js`)
- Routes and configuration templates

---

## 🔑 Credential Management

### 1. **Environment Variables (.env)**

Your `.env` file contains:
```
DATABASE_URL=postgresql://lms_user:secure_password@localhost:5432/lms_db
JWT_SECRET=your_super_secret_jwt_key...
AWS_ACCESS_KEY_ID=(if using S3)
SMTP_PASS=(Gmail app password)
```

**NEVER commit this file!**

### 2. **First Time Setup**

When cloning this project:

```bash
# 1. Copy template to local
cp .env.example .env

# 2. Edit .env with YOUR credentials
nano .env          # Linux/Mac
notepad .env       # Windows

# 3. Update values:
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@host:port/db
JWT_SECRET=<generate secure key>
SMTP_PASS=<your email app password>
```

### 3. **Generating Secure JWT Keys**

```bash
# Generate 32-char hex string for JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate 32-char hex string for JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. **Database Credentials**

Current setup uses:
- **Host**: `localhost:5432`
- **Database**: `lms_db`
- **User**: `lms_user` 
- **Password**: `secure_password` ← Change in production!

**To change database password:**
```sql
ALTER USER lms_user WITH PASSWORD 'new_secure_password';
```

Then update `.env`:
```
DATABASE_URL=postgresql://lms_user:new_secure_password@...
```

### 5. **Email (SMTP) Configuration**

For Gmail:
1. Enable 2FA: https://support.google.com/accounts/answer/185839
2. Generate App Password: https://support.google.com/accounts/answer/185833
3. Copy the 16-character password
4. Update `.env`:
   ```
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

### 6. **AWS S3 (Optional)**

If using file uploads:
1. Get AWS credentials from IAM console
2. Update `.env`:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_BUCKET=your-bucket-name
   ```

---

## 🚀 Production Deployment

### Before Deploying:

✅ **1. Generate Strong JWT Keys**
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

✅ **2. Verify .env is in .gitignore**
```bash
cat .gitignore | grep "^.env"
```

✅ **3. Never Log Credentials**
```javascript
// ❌ DON'T do this:
console.log('Password:', process.env.DB_PASSWORD);

// ✅ DO this:
console.log('Connected successfully');
```

✅ **4. Use Environment-Specific .env Files**
```
.env.development    (local development)
.env.production     (production server) - NEVER in git
.env.staging        (staging/testing)
```

✅ **5. Rotate Secrets Regularly**
- Change JWT_SECRET every 6 months
- Rotate database passwords quarterly
- Update AWS keys if leaked

---

## 🔍 How to Check What's in Git

Before committing, **always check**:

```bash
# List all files that git will track
git status

# Verify .env is NOT included
git ls-files | grep "\.env"     # Should return nothing

# Check what's in last commit
git show HEAD:                  # Should not have .env

# Globally find secrets (use with caution)
git log -p --all -S "password" --
```

---

## 📝 Development Workflow

### Day 1: Clone & Setup
```bash
# 1. Clone repository
git clone <repo>
cd server-side

# 2. Setup environment
cp .env.example .env
# ← Edit .env with YOUR local credentials

# 3. Install & run
npm install
npm run prisma:migrate
npm run dev
```

### Normal Development
```bash
# Just edit code, don't worry about .env
nano src/routes/courses.js

# Commit without touching .env
git add src/
git commit -m "Add course endpoints"
git push
```

---

## 🚨 If You Accidentally Commit Secrets

If sensitive data was committed:

```bash
# 1. Remove from git history
git filter-branch --tree-filter 'rm -f .env' --prune-empty HEAD

# 2. Force push (careful!)
git push --force-with-lease

# 3. IMMEDIATELY change passwords/keys in production
```

---

## ✅ Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] JWT secrets are 32+ characters
- [ ] Database password is strong (12+ chars, mixed case)
- [ ] AWS keys rotated in last 6 months
- [ ] SMTP password is app-specific (not main password)
- [ ] No credentials hardcoded in source files
- [ ] `.env.example` only has dummy values
- [ ] Team members have separate `.env` files
- [ ] Production `.env` stored securely (vault/manager)

---

## 📚 References

- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [PostgreSQL: User Management](https://www.postgresql.org/docs/current/user-manag.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)

---

## 🆘 Emergency Contact

If credentials are compromised:

1. 🚨 Change passwords IMMEDIATELY
2. 📧 Notify your team
3. 🔄 Rotate all secrets
4. 📝 Review git history for breaches
5. 🔐 Update all dependent systems

---

**Last Updated**: April 1, 2026  
**Author**: Security Team  
**Status**: Active
