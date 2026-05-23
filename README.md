# 🚼 DevPulse – Internal Tech Issue Tracker

A collaborative backend system for reporting bugs, suggesting features, and managing software development issues using role-based access control.

---

## 🚀 Live URL
https://your-deployed-link.com

---

## 🧰 Tech Stack

- Node.js (LTS 24+)
- TypeScript
- Express.js (Modular Architecture)
- PostgreSQL (Raw SQL using pg)
- JWT Authentication
- bcrypt Password Hashing

---

## ✨ Features

- User Registration & Login
- JWT Authentication
- Role-based Access Control (Contributor & Maintainer)
- Create, Read, Update, Delete Issues
- Issue Filtering & Sorting
- Secure Password Storage

---

## 👥 Roles

### Contributor
- Create issues
- View issues

### Maintainer
- Update any issue
- Delete any issue
- Manage issue status

---

## 📡 API Endpoints

### Auth
- POST /api/auth/signup
- POST /api/auth/login

### Issues
- POST /api/issues
- GET /api/issues
- GET /api/issues/:id
- PATCH /api/issues/:id
- DELETE /api/issues/:id

---

## ⚙️ Setup
```

```


## Dependencies
```bash
npm install
npm install bcrypt
npm install cors
npm install dotenv
npm install express
npm install jsonwebtoken
npm install pg
npm install tsup
npm install tsx
npm run dev
```
## devDependencies
```bash
npm install -D @types/bcrypt
npm install -D @types/cors
npm install -D @types/express
npm install -D @types/jsonwebtoken
npm install -D @types/node
npm install -D @types/pg
npm install -D typescript
```
---

## 🔐 Env

PORT=8000  
DATABASE_URL=your_db_url  
JWT_SECRET=your_secret

---

## 👨‍💻 Author

MD Al Jihad Sawon
