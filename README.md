# Online Survey & Polling System

A full-stack web application designed for creating, administering, and participating in academic and community surveys and polls. Built using **Spring Boot**, **Spring Security + JWT**, **Spring Data JPA**, **MySQL / H2 Database**, and a responsive **React.js** frontend with **pure custom CSS** (zero CSS frameworks).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Database Design](#architecture--database-design)
4. [Roles & Permissions](#roles--permissions)
5. [REST API Endpoints](#rest-api-endpoints)
6. [Getting Started & Running the Application](#getting-started--running-the-application)
7. [Default Seed Accounts & Sample Data](#default-seed-accounts--sample-data)
8. [Viva / College Presentation Guide](#viva--college-presentation-guide)

---

## 1. Project Overview

The **Online Survey & Polling System** allows administrators to design surveys with multiple question types, manage community polls, monitor submitted answers, and visualize live analytics. Participants can register, browse open surveys, submit answers, vote in active polls (strictly enforced once per user), and track their participation history.

### Core Features:
- **Authentication**: JWT token-based authentication with BCrypt password hashing.
- **Surveys**: Support for **Multiple Choice (Single Answer)**, **Checkbox (Multiple Answers)**, and **Text Answer (Open Feedback)**.
- **Polls**: Single-choice instant voting with live percentage distribution bars and duplicate-vote prevention.
- **Analytics & Results**: Aggregate counts, percentages, and response listings.
- **Admin Control**: Complete management of surveys, questions, options, polls, and users.
- **Pure CSS UI**: Clean, responsive, and framework-free design with dashboard cards, tables, badges, and progress bars.

---

## 2. Technology Stack

### Backend
* **Language**: Java 17+ (Java 21 / 25 compatible)
* **Framework**: Spring Boot 3.2.4
* **Web**: Spring MVC (RESTful architecture)
* **Data Access**: Spring Data JPA & Hibernate
* **Security**: Spring Security 6 with JJWT (JSON Web Token)
* **Build Tool**: Apache Maven

### Database
* **Primary / Production**: MySQL 8.0+
* **Fallback / Development**: Embedded H2 Database (with web console at `/h2-console`)
* **Schema**: Relational schema with primary keys, foreign keys, cascading deletes, and unique constraints.

### Frontend
* **Framework**: React.js 18+ (bootstrapped with Vite)
* **Routing**: React Router 6 (`react-router-dom`)
* **HTTP Client**: Axios with automatic JWT Authorization header injection
* **Styling**: Pure CSS3 (Flexbox & Grid, CSS variables, zero Bootstrap / Tailwind dependency)

---

## 3. Architecture & Database Design

### Layered Backend Structure
```text
backend/src/main/java/com/example/survey/
│
├── config/              # CORS and DataInitializer seed configuration
├── controller/          # REST API endpoints (Auth, Survey, Poll, Response, Result, User)
├── dto/                 # Request & Response Data Transfer Objects
├── entity/              # JPA Database Entities
├── exception/           # Global Exception Handling & Custom Exceptions
├── repository/          # Spring Data JPA Repositories
├── security/            # JWT Token Provider, Auth Filter & SecurityConfig
└── service/             # Business Logic Layer
```

### Relational Database Schema

```
+-----------------------------------------------------------------------------------+
|                                     USERS                                         |
+----+----------------------+---------------------------+----------+----------------+
| id | name                 | email                     | role     | created_at     |
+----+----------------------+---------------------------+----------+----------------+
  |                          |
  | (created_by)             | (user_id)
  v                          +----------------------------+
+-----------------------+                                 |
|       SURVEYS         |                                 |
+----+------------------+                                 v
| id | title            |                       +--------------------+
|    | description      |                       |     RESPONSES      |
|    | status           |                       +----+---------------+
|    | start_date       |                       | id | user_id       |
|    | end_date         |                       |    | survey_id     |
+----+------------------+                       |    | submitted_at  |
  |                                             +----+---------------+
  | (survey_id)                                   |
  v                                               | (response_id)
+-----------------------+                         v
|      QUESTIONS        |                       +--------------------+
+----+------------------+                       |      ANSWERS       |
| id | survey_id        |                       +----+---------------+
|    | question_text    |                       | id | response_id   |
|    | question_type    | <------------------- |    | question_id   |
+----+------------------+                       |    | option_id     |
  |                                             |    | text_answer   |
  | (question_id)                               +----+---------------+
  v                                               |
+-----------------------+                         |
|        OPTIONS        | <-----------------------+
+----+------------------+
| id | question_id      |
|    | option_text      |
+----+------------------+

+-----------------------+                       +--------------------+
|        POLLS          |                       |     POLL_VOTES     |
+----+------------------+                       +----+---------------+
| id | title            | <------------------- | id | poll_id       |
|    | description      |                       |    | user_id       |
|    | status           | <------------------- |    | option_id     |
+----+------------------+                       |    | voted_at      |
  |                                             +----+---------------+
  | (poll_id)                                     |
  v                                               |
+-----------------------+                         |
|     POLL_OPTIONS      | <-----------------------+
+----+------------------+
| id | poll_id          |
|    | option_text      |
+----+------------------+
```

---

## 4. Roles & Permissions

| Feature | Participant (`ROLE_PARTICIPANT`) | Administrator (`ROLE_ADMIN`) |
| :--- | :---: | :---: |
| Register & Login | Yes | Yes |
| View Active Surveys & Polls | Yes | Yes |
| Answer Surveys | Yes (Single submission) | Yes |
| Vote in Polls | Yes (Single vote) | Yes |
| View Live Results | Yes | Yes |
| Personal Participation History | Yes | Yes |
| Create / Edit / Delete Surveys | No | Yes |
| Add / Edit / Delete Questions & Options | No | Yes |
| Create / Edit / Delete Polls | No | Yes |
| Change Status (Draft, Publish, Close) | No | Yes |
| Inspect Individual Participant Answers | No | Yes |
| Manage User Roles & Accounts | No | Yes |

---

## 5. REST API Endpoints

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create account (Participant or Admin)
* `POST /api/auth/login` - Authenticate with email/password and receive JWT
* `GET /api/auth/me` - Retrieve current user profile

### Surveys & Questions (`/api/surveys`, `/api/admin/surveys`)
* `GET /api/surveys/active` - List active published surveys
* `GET /api/surveys/{id}` - Get survey details with questions and options
* `GET /api/admin/surveys` - List all surveys (Draft, Published, Closed)
* `POST /api/admin/surveys` - Create new survey
* `PUT /api/admin/surveys/{id}` - Update survey details
* `PATCH /api/admin/surveys/{id}/status` - Change status (`DRAFT`, `PUBLISHED`, `CLOSED`)
* `DELETE /api/admin/surveys/{id}` - Delete survey
* `POST /api/admin/surveys/{id}/questions` - Add question with options
* `PUT /api/admin/questions/{id}` - Update question
* `DELETE /api/admin/questions/{id}` - Delete question

### Responses & Submissions (`/api/surveys`, `/api/participant`, `/api/admin`)
* `POST /api/surveys/{id}/submit` - Submit participant responses (enforces single submission)
* `GET /api/participant/history` - Get user's completed surveys and votes
* `GET /api/admin/surveys/{id}/responses` - List all participant submissions
* `GET /api/admin/responses/{id}` - View exact answers for a submission

### Polls & Voting (`/api/polls`, `/api/admin/polls`)
* `GET /api/polls/active` - List active polls with user's vote status
* `GET /api/polls/{id}` - Get poll details
* `POST /api/polls/{id}/vote` - Cast a vote (enforces single vote per user)
* `GET /api/admin/polls` - List all polls
* `POST /api/admin/polls` - Create new poll
* `PUT /api/admin/polls/{id}` - Update poll
* `PATCH /api/admin/polls/{id}/status` - Update status
* `DELETE /api/admin/polls/{id}` - Delete poll

### Analytics & Results (`/api/surveys`, `/api/polls`, `/api/admin`)
* `GET /api/surveys/{id}/results` - Aggregated counts, percentages, and text feedback
* `GET /api/polls/{id}/results` - Vote counts and percentage distribution
* `GET /api/admin/dashboard/stats` - Total surveys, polls, responses, and users
* `GET /api/admin/users` - List all users
* `PATCH /api/admin/users/{id}/role` - Update user role
* `DELETE /api/admin/users/{id}` - Delete user

---

## 6. Getting Started & Running the Application

### Prerequisites
* **Java**: JDK 17 or higher
* **Maven**: 3.8+
* **Node.js**: 18+ and npm
* **MySQL**: 8.0+ (Optional; H2 database runs seamlessly out-of-the-box)

---

### Option A: One-Click Startup (Recommended)

1. **Start the Backend**:
   Double-click `run-backend.bat` in the project root.
   - The Spring Boot server will start on `http://localhost:8080`.
   - Default profile uses **H2 in-memory database** with sample seed data.
   - The H2 web console is available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:survey_db`, User: `sa`, Password: blank).

2. **Start the Frontend**:
   Double-click `run-frontend.bat` in the project root.
   - The React application will start on `http://localhost:5173`.
   - Open your browser to `http://localhost:5173`.

---

### Option B: Running with MySQL

1. Make sure MySQL Server is running on port `3306`.
2. Ensure database credentials match in `backend/src/main/resources/application-mysql.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/survey_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```
3. Run the backend with the MySQL profile:
   ```powershell
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```
4. Run the frontend:
   ```powershell
   cd frontend
   npm run dev
   ```

---

## 7. Default Seed Accounts & Sample Data

Upon initial startup, `DataInitializer` automatically inserts test accounts and sample content:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@survey.com` | `admin123` | Full access to Admin Panel, surveys, polls, and user accounts |
| **Participant** | `john@survey.com` | `john123` | Can take surveys, vote in polls, view history and profile |
| **Participant** | `jane@survey.com` | `jane123` | Additional test participant |

> **Quick-Fill Button**: On the Login screen, click **"Fill Admin"** or **"Fill User"** for instant 1-click credential entry!

---

## 8. Viva / College Presentation Guide

Key talking points and questions frequently asked during evaluations:

### 1. How does JWT Authentication work?
- When a user logs in via `/api/auth/login`, Spring Security verifies credentials against the database using `BCryptPasswordEncoder`.
- On success, `JwtTokenProvider` generates a signed JSON Web Token containing the user's email, role, and expiration timestamp.
- On subsequent requests, `JwtAuthenticationFilter` intercepts the request header (`Authorization: Bearer <token>`), validates the HMAC signature, loads user details, and sets the Spring Security `SecurityContextHolder`.

### 2. How is duplicate voting prevented in polls?
- **Database Level**: The `poll_votes` table has a composite unique constraint `UNIQUE KEY uk_user_poll (user_id, poll_id)`.
- **Service Level**: Before recording a vote, `PollService.vote()` calls `pollVoteRepository.existsByUserIdAndPollId()`. If true, it throws a `BadRequestException("You have already voted in this poll")`.
- **UI Level**: The frontend checks the `hasVoted` flag returned in `PollDto` and immediately switches the interface from the voting radio buttons to the live results breakdown.

### 3. How are different question types supported in surveys?
- The `questions` table stores a `question_type` column (`MULTIPLE_CHOICE`, `CHECKBOX`, `TEXT`).
- Choice questions link to multiple entries in the `options` table.
- When submitting responses, `ResponseService` inspects the question type:
  - For single choice, it links `option_id`.
  - For checkboxes, it records multiple answer records for each selected option.
  - For text questions, it saves the participant's open response in `text_answer`.

### 4. Why pure CSS instead of Bootstrap or Tailwind?
- Complies strictly with project guidelines to demonstrate custom CSS architecture (Flexbox, CSS Grid, custom variables, responsive media queries, and accessible UI controls) without external framework dependencies.
