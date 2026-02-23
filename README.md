# 🏥 MedMate — Full-Stack Healthcare Appointment System

A modern healthcare booking platform that allows patients to schedule appointments with doctors via **form** or **voice commands**. Built using **Next.js**, **Node.js**, and **MongoDB**, with **JWT authentication**, **email confirmations**, and **AI-powered voice booking**.  

**Live Demo:** [[medmate.vercel.app](#)](https://med-mate-config.vercel.app/)  

---

## 🚀 Overview

MedMate enables patients to **book appointments easily** through a web interface or AI voice commands (powered by Eleven Labs). Admins and doctors manage **availability, appointments, and analytics** through role-based dashboards.

---

## 👥 User Roles

### 🛠️ Admin
- Full control of the system  
- Add / edit / delete doctors  
- Enable / disable accounts  
- View analytics (doctor count, top specializations)

### 👨‍⚕️ Doctor
- JWT-protected login  
- View & manage own appointments  
- Track completed or missed visits  
- Manage daily availability slots (30-min blocks)  
- Prevent double booking in real-time  

### 👩‍💻 Patient
- Open access (no login required)  
- Browse doctors by **specialization**, **date**, or **time**  
- Book appointments via **form** or **voice**  
- Receive instant email confirmation  

---

## 📅 Appointment Flow

1. **Browse Doctors** → Filter by specialization, date, or time  
2. **Book Appointment** → Fill form or use voice AI  
3. **Backend Processing** → Validates slot and saves data  
4. **Email Confirmation** → Sent via Nodemailer / Resend  

---

## 🔐 Authentication & Authorization

| Role    | Auth Type | Access           |
|--------|-----------|----------------|
| Admin  | JWT       | Full system      |
| Doctor | JWT       | Own dashboard    |
| Patient| None      | Public access    |

- Secure JWT tokens (access + refresh)  
- Role-protected routes:  
  - `/admin/dashboard`  
  - `/doctor/dashboard`  

---

## 📧 Email Notifications
- Automated confirmation on booking  
- Sent via **Nodemailer** or **Resend API**  
- Includes appointment details (doctor, date, time)  

---

## 🎙️ Voice Booking (Eleven Labs AI Integration)
- Voice-based booking via AI widget  
- Collects user details: name, email, time, symptoms  
- Sends payload to backend webhook `/book-appointment`  
- Checks slot availability → books or prompts reselect  

---

## 🧱 Tech Stack

| Layer      | Stack                                   |
|-----------|----------------------------------------|
| Frontend  | Next.js + TypeScript + Tailwind + ShadCN |
| Backend   | Node.js + Express.js                     |
| Database  | MongoDB + Mongoose                       |
| Auth      | JWT (access + refresh tokens)            |
| Email     | Nodemailer / Resend                       |
| Voice     | Vapi AI                                   |
| Deployment| Vercel (Frontend), Render / Railway (Backend) |

---

## 🧩 Key Features
- Responsive full-stack web app  
- Role-based dashboards (Admin / Doctor / Patient)  
- Voice + form appointment booking  
- Email confirmation system  
- Secure REST APIs  
- Real-time slot management  
- Fully deployed (Frontend + Backend)  

---

## 💡 About the Project

MedMate is part of a **Full-Stack Development Bootcamp** final project by **Laiba Mushtaq**. It demonstrates secure, full-stack development skills, integration of **AI voice assistants**, and deployment best practices.  
