# User Access Control & Course Types

> **Audience:** Frontend developers  
> **Base URL:** `{APP_PREFIX}` (e.g. `/api/v1`)  
> **Auth:** Bearer JWT — include `Authorization: Bearer <token>` header on protected endpoints.

---

## Overview

The platform uses a two-level access model:

1. **Account access** (`is_active`) — can the user log in?  
2. **Course access** (`course_access`) — can the user enroll in courses and view lesson content?

Registration immediately activates the account (`is_active=true`), but course access starts as `NONE`. The user must **request access** and wait for an **admin to approve** before they can enroll in any course.

Courses also have two types:
- **FREE** — users with `APPROVED` access can self-enroll.
- **PAID** — only an admin can enroll a user (payment processing not yet implemented; price is symbolic).

---

## User State Machine

```
Register → course_access = NONE
                │
    POST /users/me/request-access
                │
          course_access = PENDING
                │
        Admin reviews (PATCH /users/{id}/access)
               / \
          APPROVED  REJECTED
              │         │
    Can enroll   Must re-request
    in FREE      (NONE → PENDING again)
    courses
```

### `course_access` values

| Value      | Meaning                                              |
|------------|------------------------------------------------------|
| `NONE`     | No request made yet (initial state after registration) |
| `PENDING`  | User requested access; awaiting admin decision        |
| `APPROVED` | Admin approved; user can enroll in FREE courses       |
| `REJECTED` | Admin rejected; user can re-request                   |

---

## Course Types

| `course_type` | Who can enroll?                                 | Price field |
|---------------|-------------------------------------------------|-------------|
| `FREE`        | Any user with `course_access = APPROVED`        | `null`       |
| `PAID`        | Only via admin (`POST /enrollments/admin`)      | Numeric (symbolic, payments not implemented) |

---

## New Fields in Responses

### `UserResponse` (all user endpoints)

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "Ana",
  "last_name": "García",
  "full_name": "Ana García",
  "document_type": "DNI",
  "document_number": "12345678",
  "phone_number": null,
  "avatar_url": null,
  "bio": null,
  "role_id": "uuid",
  "role_name": "student",
  "is_active": true,
  "course_access": "NONE"   // ← NEW
}
```

### `CourseResponse` / `CourseDetailResponse` (all course endpoints)

```json
{
  "id": "uuid",
  "title": "Python para todos",
  "slug": "python-para-todos",
  "short_description": "Aprende Python desde cero",
  "description": "...",
  "thumbnail_url": null,
  "course_level": "BASIC",
  "course_type": "FREE",    // ← NEW: "FREE" | "PAID"
  "price": null,            // ← NEW: null for FREE, numeric for PAID (symbolic)
  "requirements": [],
  "what_you_will_learn": [],
  "tags": [],
  "is_published": true,
  "instructor_id": "uuid",
  "category_id": "uuid",
  "drive_folder_id": null
}
```

---

## Endpoint Reference

### User Endpoints

#### `POST /users/`
Register a new user. No auth required.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "S3cureP@ss",
  "first_name": "Ana",
  "last_name": "García",
  "document_type": "DNI",
  "document_number": "12345678",
  "phone_number": null
}
```

**Response `201`:** `UserResponse` with `is_active=true`, `course_access="NONE"`.

---

#### `POST /users/me/request-access`
Student requests course access. Requires valid JWT (any active user).

**Request:** No body.

**Response `200`:** `UserResponse` with `course_access="PENDING"`.

**Errors:**
| Code | When |
|------|------|
| `409` | Already `PENDING` or `APPROVED` |

---

#### `GET /users/pending-access` *(admin only)*
List all users waiting for approval.

**Response `200`:** `UserResponse[]` — all users where `course_access="PENDING"`.

---

#### `PATCH /users/{user_id}/access` *(admin only)*
Approve or reject a user's access request.

**Request:**
```json
{ "status": "APPROVED" }
// or
{ "status": "REJECTED" }
```

**Response `200`:** Updated `UserResponse`.

**Errors:**
| Code | When |
|------|------|
| `404` | User not found |
| `422` | `status` is not `APPROVED` or `REJECTED` |

---

### Course Endpoints

#### `POST /courses/` *(instructor or admin)*
Create a new course draft.

**Request body — new fields:**
```json
{
  "title": "...",
  "slug": "...",
  "instructor_id": "uuid",
  "course_type": "FREE",   // "FREE" | "PAID" — defaults to "FREE"
  "price": null            // numeric or null; required if course_type = "PAID"
}
```

#### `PUT /courses/{course_id}` *(instructor or admin)*
Update a course. Same new fields:
```json
{
  "course_type": "PAID",
  "price": 50.00
}
```

---

### Enrollment Endpoints

#### `POST /enrollments/`
Self-enroll in a FREE course. Requires active user with `course_access=APPROVED`.

**Request:**
```json
{ "course_id": "uuid" }
```

**Response `201`:** `EnrollmentResponse`.

**Errors:**
| Code | When |
|------|------|
| `403` | `course_access` is not `APPROVED` |
| `403` | Course is `PAID` (use admin endpoint instead) |
| `404` | Course not found or not published |
| `409` | Already enrolled |

---

#### `POST /enrollments/admin` *(admin only)*
Enroll any user in any published course (FREE or PAID).

**Request:**
```json
{
  "user_id": "uuid",
  "course_id": "uuid"
}
```

**Response `201`:** `EnrollmentResponse`.

**Errors:**
| Code | When |
|------|------|
| `404` | Course not found or not published |
| `409` | User already enrolled |

---

## Frontend Implementation Guide

### Registration Flow

```
1. POST /users/          → account created, user can log in immediately
2. POST /auth/login      → get JWT
3. User sees dashboard with course_access = "NONE"
4. Show CTA: "Solicitar acceso a los cursos"
```

### Access Request Flow

```
User clicks "Solicitar acceso"
  → POST /users/me/request-access
  → course_access = "PENDING"
  → Show: "Tu solicitud está siendo revisada. Te notificaremos cuando sea aprobada."
```

### Admin Approval Flow

```
Admin visits /users/pending-access
  → GET /users/pending-access   (list of PENDING users)
  → For each user: PATCH /users/{id}/access { "status": "APPROVED" | "REJECTED" }
```

### Enrollment Flow

```
User (APPROVED) browses course list:
  GET /courses/  → shows course_type and price for each course

If course_type = "FREE":
  → Show "Inscribirse" button
  → POST /enrollments/  { course_id }

If course_type = "PAID":
  → Show price and "Contactar administrador" message
  → No self-enrollment option (admin must enroll via POST /enrollments/admin)
```

### UI Recommendations

- Show `course_access` badge on user profile/dashboard:
  - `NONE` → grey "Sin acceso"
  - `PENDING` → yellow "Pendiente de aprobación"
  - `APPROVED` → green "Acceso aprobado"
  - `REJECTED` → red "Acceso rechazado" + "Solicitar nuevamente" button

- On course cards, show a `PAID` badge with the symbolic price when `course_type = "PAID"`.

- On course detail page, show enrollment eligibility:
  - User not logged in → "Inicia sesión para inscribirte"
  - `course_access = NONE/PENDING/REJECTED` → "Necesitas acceso aprobado para inscribirte"
  - `course_access = APPROVED` + FREE → "Inscribirse gratis"
  - `course_access = APPROVED` + PAID → "Precio: S/. {price} — Contacta a un administrador"

---

## Error Codes Summary

| HTTP Code | Domain Cause |
|-----------|-------------|
| `401` | Missing or invalid JWT |
| `403` | User not active, no approved access, or insufficient role |
| `404` | User or course not found |
| `409` | Duplicate (already enrolled, already pending access) |
| `422` | Validation error (invalid field values) |
