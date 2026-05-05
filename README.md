# 🏥 MediBook — Clinic Appointment System

A full-stack clinic management system built with React and Spring Boot, featuring role-based dashboards, appointment booking, email notifications, and AI-powered features via Google Gemini.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-green)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![CI](https://github.com/ashfaq-ui/MediBook/actions/workflows/backend.yml/badge.svg)
![CI](https://github.com/ashfaq-ui/MediBook/actions/workflows/frontend.yml/badge.svg)

**Live Demo:** [medi-book-flax.vercel.app](https://medi-book-flax.vercel.app)

---

## 📋 Features

### 🧑‍⚕️ Patient
- Register and login securely with JWT
- Book appointments by selecting department, doctor, date and time slot
- View upcoming, completed and cancelled appointments
- Cancel appointments
- Receive email confirmations for bookings and cancellations
- **AI Health Assistant** — chat with a Gemini-powered assistant for general health questions, symptom guidance, and appointment preparation

### 👨‍⚕️ Doctor
- View all appointments with patient details
- Confirm and complete appointments
- Manage available time slots by date
- Receive email notifications on status updates
- **AI Appointment Summary** — generate a structured clinical summary for any appointment with one click

### 🛡️ Admin
- View all users, doctors, departments and appointments
- Add new departments
- Assign doctor profiles to registered DOCTOR-role users
- Monitor system activity via dashboard stats

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + React Router v7 |
| Backend | Spring Boot 3 + Spring Security |
| Database | PostgreSQL 17 |
| Auth | JWT (JSON Web Tokens) |
| Email | Spring Mail + Gmail SMTP (async) |
| AI | Google Gemini API (gemini-2.5-flash) |
| Build | Maven |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend) · Railway (backend + DB) |

---

## 🏗 Architecture

```
React Frontend (Vite) — Vercel
        ↓  HTTPS + JWT
Spring Boot REST API — Railway
        ↓                    ↓
  PostgreSQL DB         Google Gemini API
     Railway
```

### Backend Layer Structure

```
controller/   ← REST endpoints
service/      ← Business logic (email is async via @Async)
repository/   ← JPA database queries
model/        ← JPA entity classes
dto/          ← Request/Response objects
security/     ← JWT filter + CORS config
enums/        ← Role, AppointmentStatus
ai/           ← Gemini API client, chat service, summary service
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17
- Node.js 20+
- PostgreSQL 17
- Maven
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Backend Setup

```bash
cd backend
```

Create `src/main/resources/application-local.properties` (gitignored):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/medibook
spring.datasource.username=postgres
spring.datasource.password=yourpassword
jwt.secret=your-secret-key
jwt.expiration=86400000
spring.mail.username=your-gmail@gmail.com
spring.mail.password=your-app-password
gemini.api.key=${GEMINI_API_KEY}
gemini.api.url=https://generativelanguage.googleapis.com/v1beta
gemini.model=gemini-2.5-flash
```

Run:

```bash
export GEMINI_API_KEY=your-gemini-api-key
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

> `.env.development` points to the hosted Railway backend by default. To use a local backend, uncomment the localhost line in that file.

---

## 📡 API Endpoints

### Auth & Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/users` | List all users (admin) |

### Departments & Doctors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/departments` | List all departments |
| POST | `/api/departments` | Create department |
| GET | `/api/doctors` | List all doctors |
| POST | `/api/doctors` | Create doctor profile |
| GET | `/api/doctors/department/{id}` | Doctors by department |

### Slots & Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/slots/available` | Available time slots |
| POST | `/api/slots` | Create time slot |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments/patient/{id}` | Patient appointments |
| GET | `/api/appointments/doctor/{id}` | Doctor appointments |
| GET | `/api/appointments/all` | All appointments (admin) |
| PATCH | `/api/appointments/{id}/cancel` | Cancel appointment |
| PATCH | `/api/appointments/{id}/status` | Update status |

### AI Features
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/ai/chat` | PATIENT | Multi-turn health assistant chat |
| POST | `/api/ai/summary/{appointmentId}` | DOCTOR | Generate clinical appointment summary |

---

## 🤖 AI Features

### Patient Health Assistant
Patients can chat with a Gemini-powered AI assistant directly from their dashboard. The assistant:
- Answers general health questions
- Explains medical terms
- Helps patients prepare for appointments
- Advises on which type of doctor to see
- Always recommends seeing a doctor for diagnosis — never diagnoses conditions

The full conversation history is sent on each request so the assistant maintains context across the conversation.

### Doctor Appointment Summary
Doctors can generate a structured clinical summary for any appointment with one click. The summary includes:
- Patient and doctor details
- Chief complaint
- Clinical notes
- Assessment
- Recommended follow-up

Summaries are saved to the database and can be regenerated at any time.

### Gemini Integration
Both features use `GeminiApiClient` which calls the Gemini REST API directly via `RestTemplate`. The system prompt is passed via the `systemInstruction` field (not injected into conversation history) to ensure correct role alternation across multi-turn conversations.

---

## 🗄 Database Schema

```
users
  id, name, email, password, role

departments
  id, name, description

doctors
  id, user_id → users, department_id → departments, specialization, phone

time_slots
  id, doctor_id → doctors, date, start_time, end_time, is_booked

appointments
  id, patient_id → users, doctor_id → doctors, slot_id → time_slots,
  status, notes, ai_summary, created_at
```

---

## 🔄 CI/CD

This project uses **GitHub Actions** for continuous integration:

- **Backend CI** — triggered on changes to `backend/`, runs Maven build and tests
- **Frontend CI** — triggered on changes to `Frontend/`, runs npm install and Vite build

### Deployment

| Service | Platform | Trigger |
|---|---|---|
| Frontend | Vercel | Auto-deploy on push to `main` |
| Backend + DB | Railway | Auto-deploy on push to `main` |

**Railway environment variables required:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRATION` | Token expiry in ms (e.g. 86400000) |
| `MAIL_USERNAME` | Gmail address for sending emails |
| `MAIL_PASSWORD` | Gmail App Password |
| `GEMINI_API_KEY` | Google Gemini API key |

---

## 📧 Email Notifications

Automated emails are sent asynchronously (non-blocking) for:
- Appointment booking confirmation
- Appointment cancellation
- Appointment status updates (confirmed, completed)

> Email uses Gmail App Passwords. Regenerate at myaccount.google.com → Security → App passwords if emails stop arriving.

---

## 🗓 Project Timeline

| Phase | Feature |
|---|---|
| 1 | Spring Boot setup + PostgreSQL connection |
| 2 | User auth + JWT |
| 3 | React frontend + Login/Register |
| 4 | Patient & Doctor dashboards |
| 5 | Department & Doctor management |
| 6 | Time slot management |
| 7 | Appointment booking API |
| 8 | Connect frontend to backend |
| 9 | Admin dashboard + doctor profile assignment |
| 10 | Async email notifications |
| 11 | CI/CD + Vercel + Railway deployment |
| 12 | AI Health Assistant (Patient) + Appointment Summary (Doctor) via Google Gemini |

---

## 🔮 Roadmap

- Doctor ratings and reviews after completed appointments
- SMS notifications via Twilio alongside email
- Appointment rescheduling (not just cancel + rebook)
- Admin analytics dashboard with charts (appointments per day, per department)
- Patient medical history and notes per appointment
- Mobile app (React Native)

---

## 👨‍💻 Author

**Mohamed Ashfaq**
- GitHub: [@ashfaq-ui](https://github.com/ashfaq-ui)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
