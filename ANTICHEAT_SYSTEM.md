# 🚨 Sistema Anti-Cheat - GeoConquer

## 📋 Panoramica

GeoConquer implementa un **sistema anti-cheat completamente automatico** che:

- ✅ Riceve conquiste territoriali dagli utenti
- ✅ Calcola la velocità media automaticamente
- ✅ **Scarta automaticamente** report con velocità impossibili
- ✅ **Banna per 24 ore** utenti che tentano cheat
- ✅ **Salva i report flaggati** per review admin (opzionale)
- ✅ **Persiste su file JSON** - niente database esterno

---

## 🎯 Come Funziona

### 1️⃣ Utente Invia Conquista Territoriale
L'utente clicca sulla mappa:
- Punto di partenza (start)
- Punto di fine (end)
- Tempo totale impiegato (minuti)

### 2️⃣ Server Calcola Distanza (Haversine Formula)
```
Distance = distanza reale tra due coordinate GPS (in km)
Duration = tempo impiegato (in ore)
Speed = Distance / Duration (km/h)
```

### 3️⃣ Sistema Anti-Cheat Valida
**Controlli automatici:**

| Controllo | Min | Max | Azione |
|-----------|-----|-----|--------|
| Distanza | 50m | 50km | Scarta se fuori range |
| Velocità | 0.5 km/h | 60 km/h | **BAN 24H** se > 60 |

### 4️⃣ Risultati Possibili

#### ✅ Conquista Valida
```json
{
  "status": "pending",
  "cheatDetected": false,
  "calculatedSpeed": 7.5
}
```
→ Inviata agli admin per review manuale

#### ❌ Velocità Impossibile = BAN AUTOMATICO
```json
{
  "error": "CHEAT RILEVATO! Velocità impossibile (150 km/h > 60 km/h) - Ban di 1 giorno",
  "banned": true,
  "banTimeRemaining": 86400
}
```
→ Utente bannato per 24 ore
→ Non può inviare altre conquiste

#### ⚠️ Violazione Parametri (Scartato, No Ban)
```json
{
  "error": "Distanza troppo lunga (100 km > 50 km)",
  "banned": false
}
```
→ Report scartato
→ Admin non vede niente
→ Nessun ban

---

## 📊 Configurazione Anti-Cheat

### Default Config (in antiCheatService)

```typescript
{
  maxSpeedKmh: 60,      // Massimo velocità ragionevole a piedi
  minSpeedKmh: 0.5,     // Minimo velocità possibile
  maxDistanceKm: 50,    // Massimo km per conquista singola
  minDistanceM: 50      // Minimo metri per conquista
}
```

### Logica Valori

**Perché 60 km/h?**
- Persona a piedi: max 7 km/h
- Bicicletta: max 50 km/h
- Auto (ma non dovrebbe correre in auto): 60 km/h max ragionevole
- Chiunque vada più veloce di 60 km/h sta **definitivamente imbrogliando**

**Perché 50 km?**
- Conquista singola massima ragionevole
- Se vuoi conquista più grande: fai più sessioni

**Perché 50 metri minimo?**
- Non vuole spostamenti banali
- Minimo movimento significativo

---

## 🔧 API Endpoints

### Utente: Creare Conquista Territoriale

```bash
POST /api/territory-conquests
Headers:
  user-id: <user-id>
Body: {
  "startLat": 45.4831,       # Latitudine inizio
  "startLon": 9.1747,        # Longitudine inizio
  "endLat": 45.5,            # Latitudine fine
  "endLon": 9.2,             # Longitudine fine
  "durationMinutes": 45      # Tempo impiegato
}

Response (Valido):
{
  "message": "Conquista creata e inviata per approvazione",
  "conquest": {
    "id": "...",
    "distance": 2.72,          # km (calcolato)
    "calculatedSpeed": 3.6,    # km/h (calcolato)
    "status": "pending"        # In attesa review admin
  }
}

Response (Cheat):
{
  "error": "CHEAT RILEVATO! Velocità impossibile (150 km/h > 60 km/h) - Ban di 1 giorno",
  "banned": true,
  "banTimeRemaining": 86400   # Secondi rimasti
}
```

### Utente: Controllare Ban Status

```bash
GET /api/territory-conquests/my/ban-status
Headers:
  user-id: <user-id>

Response (Bannato):
{
  "banned": true,
  "banInfo": {
    "reason": "Tentativo di cheat: velocità impossibile (150 km/h)",
    "unbannedAt": "2025-11-23T18:50:42.116Z"
  },
  "timeRemaining": 3600  # Secondi (1 ora rimasta es.)
}

Response (Non bannato):
{
  "banned": false,
  "banInfo": null,
  "timeRemaining": 0
}
```

### Admin: Visualizzare Conquiste Flaggate

```bash
GET /api/territory-conquests/admin/flagged
Headers:
  admin-id: <admin-id>

Response:
{
  "count": 5,
  "conquests": [
    {
      "id": "...",
      "userId": "cheat-user-001",
      "username": "hacker",
      "calculatedSpeed": 150.5,
      "status": "flagged_cheat",
      "cheatDetected": true,
      "reason": "CHEAT RILEVATO: Velocità impossibile (150.5 km/h > 60 km/h)"
    }
  ]
}
```

### Admin: Visualizzare Ban Attivi

```bash
GET /api/territory-conquests/admin/bans
Headers:
  admin-id: <admin-id>

Response:
{
  "count": 3,
  "bans": [
    {
      "userId": "cheat-user-001",
      "username": "hacker",
      "reason": "Tentativo di cheat: velocità impossibile (150 km/h)",
      "bannedAt": "2025-11-22T18:50:42.116Z",
      "unbannedAt": "2025-11-23T18:50:42.116Z",  # 24 ore dopo
      "active": true
    }
  ]
}
```

### Admin: Rimuovere Ban Manualmente

```bash
DELETE /api/territory-conquests/admin/ban/:userId
Headers:
  admin-id: <admin-id>

Response:
{
  "message": "Ban rimosso",
  "userId": "cheat-user-001"
}
```

---

## 📁 Struttura Dati

### Territory Conquest
```json
{
  "id": "uuid",
  "userId": "user-123",
  "username": "mario",
  "startPoint": {
    "latitude": 45.4831,
    "longitude": 9.1747
  },
  "endPoint": {
    "latitude": 45.5,
    "longitude": 9.2
  },
  "distance": 2.724,        // km
  "duration": 45,           // minuti
  "calculatedSpeed": 3.6,   // km/h
  "status": "pending" | "approved" | "rejected" | "flagged_cheat",
  "cheatDetected": false,
  "reason": "optional - motivo se cheat",
  "createdAt": "2025-11-22T18:50:30.966Z"
}
```

### User Ban
```json
{
  "id": "uuid",
  "userId": "cheat-user-001",
  "username": "hacker",
  "reason": "Tentativo di cheat: velocità impossibile (150 km/h)",
  "bannedAt": "2025-11-22T18:50:42.116Z",
  "unbannedAt": "2025-11-23T18:50:42.116Z",  // 24 ore dopo
  "active": true
}
```

---

## 🧪 Test del Sistema

### Test 1: Conquista Valida (7.5 km/h - camminata veloce)
```bash
curl -X POST http://localhost:3000/api/territory-conquests \
  -H "Content-Type: application/json" \
  -H "user-id: user-001" \
  -d '{
    "startLat": 45.4831,
    "startLon": 9.1747,
    "endLat": 45.5,
    "endLon": 9.2,
    "durationMinutes": 45
  }'

# ✅ Response: status pending
```

### Test 2: Cheat Rilevato (163 km/h - IMPOSSIBILE!)
```bash
curl -X POST http://localhost:3000/api/territory-conquests \
  -H "Content-Type: application/json" \
  -H "user-id: hacker-001" \
  -d '{
    "startLat": 45.4831,
    "startLon": 9.1747,
    "endLat": 45.5,
    "endLon": 9.2,
    "durationMinutes": 1  # 2.7 km in 1 minuto = 163 km/h!
  }'

# ❌ Response: CHEAT RILEVATO! Ban 24h
```

### Test 3: Verificare Ban è Attivo
```bash
curl http://localhost:3000/api/territory-conquests/my/ban-status \
  -H "user-id: hacker-001"

# ✅ Response: banned = true, timeRemaining = 86400 secondi
```

### Test 4: Admin Vede Cheat
```bash
curl http://localhost:3000/api/territory-conquests/admin/flagged \
  -H "admin-id: admin-123"

# ✅ Response: lista conquiste flaggate con velocità calcolata
```

---

## 🛡️ Protezioni Implementate

✅ **Cheat Detection Automatico**
- Velocità impossibile = instant ban
- Nessuna revisione admin necessaria per ban

✅ **Ban Temporaneo (24 ore)**
- Utente non può inviare conquiste durante ban
- Ban automaticamente rimosso dopo 24 ore
- Admin può rimuovere manualmente se necessario

✅ **Persistenza**
- Ban salvati su file `bans.json`
- Sopravvivono ai riavvii del server
- Ban scaduti puliti automaticamente

✅ **Calcolo Distanza Accurato**
- Formula Haversine per distanza geografica reale
- Non usa distanza euclidea semplice

✅ **Logging Completo**
- Tutte le conquiste salvate (valide e cheat)
- Admin può review conquiste flaggate
- Storico completo disponibile

---

## 📊 Metriche

### Per Admin
```
GET /api/territory-conquests/admin/stats

{
  "total": 42,           // Totale conquiste
  "pending": 5,          // In attesa review
  "approved": 35,        // Approvate
  "rejected": 1,         // Rifiutate
  "flagged": 1,          // Cheat rilevati
  "totalDistance": 128,  // km totali conquistati
  "activeBans": 2        // Ban attivi ora
}
```

---

## 🎓 Esempi Reali di Cheat

### Caso 1: Corsa "velocissima"
**User claims**: "Ho fatto 50 km in 30 minuti"
```
Speed = 50 / 0.5 = 100 km/h
✅ ANTI-CHEAT DETECTION: > 60 km/h → BAN!
```

### Caso 2: Distanza impossibile
**User claims**: "Ho fatto 200 km in 5 ore"
```
Duration = 5 ore = 300 minuti
IF distance > 50 km → SCARTATO (no ban, solo rifiuto)
```

### Caso 3: Velocità minima non raggiunta
**User claims**: "Ho fatto 50m in 2 ore"
```
Speed = 0.05 km / 2 h = 0.025 km/h
✅ ANTI-CHEAT DETECTION: < 0.5 km/h → SCARTATO (no ban)
```

---

## 🔄 Flusso Completo

```
┌─────────────────────────────┐
│ Utente Invia Conquista      │
│ (start, end, duration)      │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Calcola Distanza (Haversine)│
│ Calcola Speed = Dist/Time   │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Anti-Cheat Validation       │
│ - Check min/max distance    │
│ - Check min/max speed       │
└────────┬──────────────┬─────┘
         │              │
    ✅ VALID        ❌ INVALID
         │              │
         ▼              ▼
    Status:Pending  Is Speeding?
    (Review Admin)     │
                   ┌───┴────┐
                  YES      NO
                   │        │
                   ▼        ▼
             BAN 24H    SCARTATO
             + Log      (No Ban)
```

---

## 🔐 Considerazioni Sicurezza

✅ **Non puoi fare velocità impossibili**
- Limite realistico: 60 km/h
- Anything faster = immediate ban

✅ **Ban è temporaneo**
- 24 ore
- Permette agli utenti di sbagliare una volta
- Repeated offenders saranno ovvi

✅ **Admin può override**
- Rimuovere ban manualmente se falso positivo
- Review log completo di tentativi cheat

---

## 📈 Statistiche d'Uso

Guardando `/admin/stats` puoi vedere:
- Quanti report sono legittimi
- Quanti sono stati flaggati come cheat
- Quanti ban attivi
- Trend di cheat (se aumentano = problema serio)

---

## 🎉 Conclusione

Il sistema anti-cheat è **completamente automatico e robusto**:

✅ Nessun falso positivo (velocità è oggettiva)
✅ Ban istantaneo per tentativi ovvi
✅ Persistenza garantita
✅ Admin ha visibilità completa
✅ Zero database esterno

---

**Versione**: 1.0  
**Data**: Novembre 2024  
**Status**: ✅ Production Ready
