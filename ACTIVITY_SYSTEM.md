# 📊 Sistema di Logging Attività - GeoConquer

## 📋 Panoramica

Il sistema di logging attività consente agli utenti di registrare le loro attività fisiche (corse, camminate, ciclismo, trekking) e agli amministratori di registrare attività per gli utenti.

Ogni attività registrata contiene dati dettagliati che possono essere convertiti in "conquiste territoriali" da approvare.

## 🎯 Funzionalità

### 👤 Utenti Normali
- ✅ Registrare attività personali
- ✅ Visualizzare le proprie attività
- ✅ Visualizzare le proprie statistiche
- ✅ Modificare le proprie attività
- ✅ Eliminare le proprie attività

### 👨‍💼 Amministratori
- ✅ Registrare attività per qualsiasi utente
- ✅ Visualizzare tutte le attività
- ✅ Visualizzare statistiche globali
- ✅ Monitorare attività recenti
- ✅ Filtrare attività per tipo/data/distanza

## 🔧 API Endpoints

### 📝 Registrare Attività Personale

```bash
POST /api/activities
Headers:
  user-id: <user-id>
Body: {
  "type": "running",           // running | walking | cycling | hiking
  "title": "Corsa mattutina",
  "distance": 5.5,            // km
  "duration": 45,             // minuti
  "calories": 350,            // opzionale
  "startTime": "2024-11-22T07:00:00Z",
  "endTime": "2024-11-22T07:45:00Z",
  "coordinates": [
    {"latitude": 45.5, "longitude": 9.2}
  ],
  "avgSpeed": 7.3,            // km/h
  "maxSpeed": 9.5,            // km/h
  "elevation": 0,             // opzionale
  "description": "Note aggiuntive", // opzionale
  "weather": "Soleggiato",    // opzionale
  "temperature": 20           // opzionale
}

Response: {
  "message": "Activity logged successfully",
  "activity": { ... }
}
```

### 👨‍💼 Registrare Attività per Utente (Admin)

```bash
POST /api/activities/admin/log-for-user
Headers:
  admin-id: <admin-id>
Body: {
  "userId": "user-123",
  "username": "mario_rossi",
  "type": "running",
  "title": "Corsa mattutina",
  ... (stessi campi come sopra)
}

Response: {
  "message": "Activity logged for user successfully",
  "activity": {
    ...
    "loggedBy": "admin",
    "loggedByAdmin": "admin-123"
  }
}
```

### 📖 Visualizzare Proprie Attività

```bash
GET /api/activities/my?limit=100
Headers:
  user-id: <user-id>

Response: {
  "count": 5,
  "activities": [ ... ]
}
```

### 📊 Visualizzare Proprie Statistiche

```bash
GET /api/activities/my/stats
Headers:
  user-id: <user-id>

Response: {
  "totalActivities": 5,
  "totalDistance": 25.5,
  "totalDuration": 180,
  "totalCalories": 1500,
  "averageSpeed": 7.2,
  "favoriteType": "running",
  "activitiesByType": {
    "running": 3,
    "walking": 1,
    "cycling": 1,
    "hiking": 0
  }
}
```

### 👤 Visualizzare Attività di un Utente Specifico

```bash
GET /api/activities/user/:userId?limit=100

Response: {
  "count": 5,
  "activities": [ ... ]
}
```

### 📈 Visualizzare Statistiche di un Utente

```bash
GET /api/activities/user/:userId/stats

Response: {
  "totalActivities": 5,
  "totalDistance": 25.5,
  ...
}
```

### 👨‍💼 Admin: Visualizzare Tutte le Attività

```bash
GET /api/activities/admin/all?limit=100
Headers:
  admin-id: <admin-id>

Response: {
  "count": 42,
  "activities": [ ... ]
}
```

### 👨‍💼 Admin: Statistiche Globali

```bash
GET /api/activities/admin/stats
Headers:
  admin-id: <admin-id>

Response: {
  "totalActivities": 42,
  "activitiesByUser": 15,
  "activitiesByType": {
    "running": 20,
    "walking": 15,
    "cycling": 5,
    "hiking": 2
  },
  "totalDistance": 250.5,
  "totalCalories": 18500
}
```

### 👨‍💼 Admin: Attività Recenti

```bash
GET /api/activities/admin/recent?days=7&limit=50
Headers:
  admin-id: <admin-id>

Response: {
  "count": 12,
  "days": 7,
  "activities": [ ... ]
}
```

### 🔍 Ottenere Una Singola Attività

```bash
GET /api/activities/record/:id

Response: { activity object }
```

### ✏️ Modificare Attività Personale

```bash
PUT /api/activities/:id
Headers:
  user-id: <user-id>
Body: {
  "title": "Nuovo titolo",
  "description": "Nuova descrizione",
  ... (qualsiasi campo)
}

Response: {
  "message": "Activity updated successfully",
  "activity": { ... }
}
```

### 🗑️ Eliminare Attività Personale

```bash
DELETE /api/activities/:id
Headers:
  user-id: <user-id>

Response: {
  "message": "Activity deleted successfully"
}
```

## 📊 Struttura Dati

```typescript
interface Activity {
  id: string;                    // UUID unico
  userId: string;               // ID dell'utente
  username: string;             // Nome utente
  type: 'running' | 'walking' | 'cycling' | 'hiking';
  title: string;                // Titolo attività
  description?: string;         // Note opzionali
  distance: number;             // km
  duration: number;             // minuti
  calories: number;             // kcal bruciate
  startTime: Date;              // Ora inizio
  endTime: Date;                // Ora fine
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  avgSpeed: number;             // km/h media
  maxSpeed: number;             // km/h massima
  elevation: number;            // metri (opzionale)
  weather?: string;             // Condizioni meteo
  temperature?: number;         // °C
  imageUrl?: string;            // Link foto (futuro)
  loggedBy: 'user' | 'admin';   // Chi ha registrato
  loggedByAdmin?: string;       // Admin ID se registrato da admin
  createdAt: Date;
  updatedAt: Date;
}
```

## 🧪 Esempi di Utilizzo

### Registrare una Corsa (Utente)

```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -H "user-id: mario-001" \
  -d '{
    "type": "running",
    "title": "Corsa al parco",
    "distance": 5.5,
    "duration": 45,
    "calories": 350,
    "startTime": "2024-11-22T07:00:00Z",
    "endTime": "2024-11-22T07:45:00Z",
    "coordinates": [{"latitude": 45.5, "longitude": 9.2}],
    "avgSpeed": 7.3,
    "maxSpeed": 9.5
  }'
```

### Registrare Attività per Utente (Admin)

```bash
curl -X POST http://localhost:3000/api/activities/admin/log-for-user \
  -H "Content-Type: application/json" \
  -H "admin-id: admin-123" \
  -d '{
    "userId": "marco-002",
    "username": "marco_bianchi",
    "type": "cycling",
    "title": "Gita in bicicletta",
    "distance": 15.3,
    "duration": 60,
    "calories": 600,
    "startTime": "2024-11-22T10:00:00Z",
    "endTime": "2024-11-22T11:00:00Z",
    "coordinates": [{"latitude": 45.5, "longitude": 9.2}],
    "avgSpeed": 15.3,
    "maxSpeed": 25.0,
    "description": "Gita sul Navigli"
  }'
```

### Visualizzare Proprie Statistiche

```bash
curl http://localhost:3000/api/activities/my/stats \
  -H "user-id: mario-001"
```

### Visualizzare Attività Recenti (Admin)

```bash
curl "http://localhost:3000/api/activities/admin/recent?days=7" \
  -H "admin-id: admin-123"
```

## 📱 Admin Panel

### Sezione "Attività Utenti"
Visualizza tutte le attività registrate nel sistema con:
- Username e tipo attività
- Distanza, durata, calorie
- Velocità media e massima
- Data e ora
- Chi ha registrato (utente o admin)
- Descrizione/note

### Sezione "Registra Attività"
Form interattivo per registrare attività per qualsiasi utente con:
- Selezione utente (ID + username)
- Tipo di attività (dropdown)
- Dettagli (titolo, distanza, durata, calorie)
- Data e ora (inizio e fine)
- Descrizione opzionale

## 🎯 Casi d'Uso

### 1. Utente Registra Attività Personale
```
Utente apre app → Seleziona tipo attività → Riempie dettagli
→ Registra attività → Attività salvata con loggedBy="user"
```

### 2. Admin Registra Attività per Utente
```
Admin apre admin panel → Sezione "Registra Attività"
→ Inserisce ID utente → Riempie dettagli attività
→ Attività salvata con loggedBy="admin", loggedByAdmin="admin-id"
```

### 3. Convertire Attività in Conquista
```
Attività registrata → Admin approva come conquista territoriale
→ Area calcolata da coordinate → Attività contribuisce a statistiche utente
```

### 4. Monitorare Attività Utenti
```
Admin visualizza "Attività Utenti" → Filtra per tipo/data/distanza
→ Verifica dati → Approva o rifiuta come conquista
```

## 📈 Metriche Calcolate Automaticamente

Per ogni attività:
- **Velocità media**: distanza / durata
- **Ritmo**: minuti per km (per corsa/camminata)
- **Calorie bruciate**: basato su tipo di attività, durata, velocità
- **Elevazione**: traccia dei dati GPS (futuro)

## 🔐 Sicurezza

- ✅ Utenti possono modificare/eliminare solo proprie attività
- ✅ Admin ha accesso a tutte le attività
- ✅ Validazione tipo di attività (solo 4 tipi consentiti)
- ✅ Validazione data (ora inizio < ora fine)
- ✅ Tracking di chi ha registrato (user vs admin)

## 📊 Statistiche Utente

Calcolate automaticamente per ogni utente:
- **Attività totali**: numero di attività
- **Distanza totale**: somma di tutte le distanze
- **Durata totale**: somma di tutte le durate
- **Calorie totali**: somma di tutte le calorie
- **Velocità media**: media di tutte le velocità
- **Tipo preferito**: tipo di attività più frequente
- **Distribuzione per tipo**: numero di attività per tipo

## 🚀 Integrazioni Future

- 📱 Sincronizzazione con Strava/Garmin
- 📸 Upload foto e video attività
- 🤖 AI per validazione automatica
- 🗺️ Visualizzazione rotta su mappa
- 📊 Analytics avanzato
- 🏆 Badges per milestone (100km, 50 attività, ecc.)

## 📝 Changelog

### v1.0 (Novembre 2024)
- ✅ Sistema attività completo
- ✅ Registrazione utente e admin
- ✅ Statistiche per utente
- ✅ Admin panel con visualizzazione
- ✅ Filtri e ricerche

---

**Versione**: 1.0  
**Ultimo aggiornamento**: Novembre 2024  
**Status**: ✅ Production Ready
