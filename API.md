# GeoConquer API Documentation

API per il sistema di conquista territoriale e sfide di GeoConquer.

## Endpoints

### Autenticazione

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "mario_rossi",
  "email": "mario@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

Response (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "username": "mario_rossi",
    "email": "mario@example.com",
    "level": 1,
    "createdAt": "2024-11-22T10:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "mario_rossi",
  "password": "Password123!"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "username": "mario_rossi",
    "email": "mario@example.com",
    "level": 1
  },
  "token": "jwt-token-here"
}
```

#### Logout User
```
POST /api/auth/logout
Authorization: Bearer jwt-token-here
```

#### Verify Token
```
GET /api/auth/verify
Authorization: Bearer jwt-token-here
```

Response (200):
```json
{
  "valid": true,
  "userId": "user-uuid",
  "message": "Token is valid"
}
```

#### Get Password Requirements
```
GET /api/auth/password-requirements
```

Response (200):
```json
{
  "password_requirements": [
    "Minimum 8 characters",
    "At least one uppercase letter (A-Z)",
    "At least one lowercase letter (a-z)",
    "At least one number (0-9)",
    "At least one special character (!@#$%^&*)"
  ]
}
```

#### Get Username Requirements
```
GET /api/auth/username-requirements
```

Response (200):
```json
{
  "username_requirements": [
    "Minimum 3 characters",
    "Maximum 20 characters",
    "Can only contain letters, numbers, underscores, and hyphens"
  ]
}
```

---

### Users

#### Create User
```
POST /api/users
Content-Type: application/json

{
  "username": "mario_rossi",
  "email": "mario@example.com"
}
```

#### Get User
```
GET /api/users/:id
```

#### Get All Users
```
GET /api/users
```

#### Get User Stats
```
GET /api/users/:id/stats
```

Returns detailed statistics including territories, badges, and challenges.

#### Get Leaderboard
```
GET /api/users/leaderboard
```

Returns users ranked by total area conquered and distance traveled.

---

### Territories

#### Record Activity
```
POST /api/territories/activity
Content-Type: application/json

{
  "userId": "user-uuid",
  "route": [
    { "latitude": 45.4642, "longitude": 9.1900 },
    { "latitude": 45.4652, "longitude": 9.1910 }
  ],
  "duration": 1800
}
```

Creates a new territory based on the activity route and awards experience/badges.

#### Get All Territories
```
GET /api/territories
```

#### Get User Territories
```
GET /api/territories/user/:userId
```

#### Get Total User Area
```
GET /api/territories/user/:userId/area
```

---

### Challenges

#### Create Challenge
```
POST /api/challenges
Content-Type: application/json

{
  "challengerId": "user-uuid-1",
  "challengedId": "user-uuid-2",
  "territoryId": "territory-uuid",
  "targetDistance": 5000
}
```

#### Accept Challenge
```
POST /api/challenges/:id/accept
```

#### Reject Challenge
```
POST /api/challenges/:id/reject
```

#### Complete Challenge
```
POST /api/challenges/:id/complete
Content-Type: application/json

{
  "winnerId": "user-uuid"
}
```

#### Get User Challenges
```
GET /api/challenges/user/:userId
```

#### Get All Challenges
```
GET /api/challenges
```

---

### Badges

#### Get All Badges
```
GET /api/badges
```

## Badge System

- **Primo Passo** 🚶: Complete your first activity
- **Esploratore** 🗺️: Conquer 5 territories
- **Conquistatore** 👑: Conquer 20 territories
- **Maratoneta** 🏃: Travel 42 km total
- **Campione** 🏆: Win 10 challenges

## Gamification

### Experience & Levels
- Base XP: distance / 100
- Territory bonus: 50 XP per territory
- Level calculation: sqrt(experience / 100) + 1

### Territory Creation
Territories are automatically generated from activity routes with a configurable radius.

## Data Models

### User
- id, username, email
- totalDistance, level, experience
- badges, createdAt

### Territory
- id, userId, coordinates[], area
- conqueredAt, lastVisited, name

### Challenge
- id, challengerId, challengedId, territoryId
- status, targetDistance
- startDate, endDate, winnerId

### Activity
- id, userId, route[]
- distance, duration, averageSpeed
- territoriesConquered[], timestamp
