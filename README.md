# 🏥 MediBook — Clinic Appointment System

A full-stack clinic management system built with React and Spring Boot, featuring role-based dashboards, appointment booking, and AI symptom pre-screening (coming soon).

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.5-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![CI](https://github.com/ashfaq-ui/MediBook/actions/workflows/backend.yml/badge.svg)
![CI](https://github.com/ashfaq-ui/MediBook/actions/workflows/frontend.yml/badge.svg)

---

## 📋 Features

### 🧑‍⚕️ Patient
- Register and login securely with JWT
- Book appointments by selecting department, doctor, date and time slot
- View upcoming, completed and cancelled appointments
- Cancel appointments
- Receive email confirmations for bookings and cancellations

### 👨‍⚕️ Doctor
- View all appointments with patient details
- Confirm and complete appointments
- Manage available time slots by date
- Receive email notifications on status updates

### 🛡️ Admin
- View all users, doctors, departments and appointments
- Add new departments
- Monitor system activity via dashboard stats

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + CSS |
| Backend | Spring Boot 4.0.5 + Spring Security |
| Database | PostgreSQL 17 |
| Auth | JWT (JSON Web Tokens) |
| Email | Spring Mail + Gmail SMTP |
| Build | Maven |
| CI/CD | GitHub Actions |

---

## 🏗 Architecture

```
React Frontend (Vite)
        ↓
Spring Boot REST API
        ↓
  PostgreSQL Database
```

### Backend Layer Structure

```
controller/   ← REST endpoints
service/      ← Business logic
repository/   ← Database queries
model/        ← Entity classes
dto/          ← Request/Response objects
security/     ← JWT + CORS config
enums/        ← Role, AppointmentStatus
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17
- Node.js 20+
- PostgreSQL 17
- Maven

### Backend Setup

```bash
cd backend
```

Create `src/main/resources/application-local.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/medibook
spring.datasource.username=postgres
spring.datasource.password=yourpassword
jwt.secret=your-secret-key
jwt.expiration=86400000
spring.mail.username=your-gmail@gmail.com
spring.mail.password=your-app-password
```

Run:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/departments` | List all departments |
| GET | `/api/doctors/department/{id}` | Doctors by department |
| GET | `/api/slots/available` | Available time slots |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments/patient/{id}` | Patient appointments |
| GET | `/api/appointments/doctor/{id}` | Doctor appointments |
| PATCH | `/api/appointments/{id}/cancel` | Cancel appointment |
| PATCH | `/api/appointments/{id}/status` | Update status |

---

## 🗄 Database Schema

```
users
  id, name, email, password, role

departments
  id, name, description

doctors
  id, user_id, department_id, specialization, phone

time_slots
  id, doctor_id, date, start_time, end_time, is_booked

appointments
  id, patient_id, doctor_id, slot_id, status, notes, created_at
```

---

## 🔄 CI/CD

This project uses **GitHub Actions** for continuous integration:

- **Backend CI** — triggered on changes to `backend/`, runs Maven build and tests using H2 in-memory database
- **Frontend CI** — triggered on changes to `Frontend/`, runs npm install and Vite build

---

## 📧 Email Notifications

Automated emails are sent for:
- ✅ Appointment booking confirmation
- ❌ Appointment cancellation
- 🔄 Appointment status updates (confirmed, completed)

---

## 🗓 Project Timeline

This project was built incrementally over 14 days:

| Day | Feature |
|---|---|
| 1-2 | Spring Boot setup + PostgreSQL connection |
| 3-4 | User auth + JWT |
| 5 | React frontend + Login/Register |
| 6 | Patient & Doctor dashboards |
| 7 | Department & Doctor management |
| 8 | Time slot management |
| 9 | Appointment booking API |
| 10-11 | Connect frontend to backend |
| 12 | Admin dashboard |
| 13 | Email notifications |
| 14 | Polish + CI/CD |

---

## 👨‍💻 Author

**Mohamed Ashfaq**
- GitHub: [@ashfaq-ui](https://github.com/ashfaq-ui)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
