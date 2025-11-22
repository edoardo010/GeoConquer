# 🗺️ Sistema di Territori - GeoConquer

## 📋 Panoramica

Il sistema di territori permette agli utenti di conquistare aree geografiche disegnando quadrilateri (4 punti) sulla mappa. Ogni territorio è soggetto a validazione anti-cheat automatica e review da parte degli admin.

---

## 🎮 Come Funziona

### 1️⃣ Utente Seleziona 4 Punti sulla Mappa

Dalla home page, utente clicca il bottone **🗺️ Nuova Conquista** e:
1. Clicca sulla mappa per il **1° punto** (BLU 🔵)
2. Clicca sulla mappa per il **2° punto** (VERDE 🟢)
3. Clicca sulla mappa per il **3° punto** (ARANCIO 🟠)
4. Clicca sulla mappa per il **4° punto** (ROSSO 🔴)

I 4 punti si collegano automaticamente formando un **quadrilatero** (territorio).

### 2️⃣ Inserisci Tempo Impiegato

L'utente specifica il tempo totale impiegato per attraversare il territorio (in minuti).

### 3️⃣ Sistema Calcola Distanza e Velocità

Il sistema calcola automaticamente:
- **Distanza**: perimetro totale del quadrilatero (km)
- **Velocità media**: distanza / tempo (km/h)

### 4️⃣ Anti-Cheat Automatico

Se la velocità è:
- ✅ **< 60 km/h**: Territorio approvato, inviato per review admin
- ❌ **> 60 km/h**: CHEAT RILEVATO → **BAN 24 ORE** automatico
- ⚠️ **< 0.5 km/h**: Scartato senza ban

### 5️⃣ Admin Review

L'admin visualizza da `/admin.html`:
- **📋 Sezione Territori** → Conquiste in sospeso
- Può approvare o rifiutare
- Può visualizzare conquiste con cheat rilevati

---

## 📱 Interfaccia Utente

### Modal di Conquista Territoriale

```
┌─────────────────────────────────┐
│ 🗺️ Registra Nuova Conquista     │
├─────────────────────────────────┤
│ Istruzioni:                      │
│ 1. Clicca 4 volte per definire   │
│ 2. I punti si collegheranno auto │
│ 3. Inserisci tempo e invia       │
│ [🔄 Resetta Punti]              │
├─────────────────────────────────┤
│ [MAPPA INTERATTIVA - 300px]      │
├─────────────────────────────────┤
│ Tempo Impiegato: [___] minuti    │
│ 📍 Distanza: -- km              │
│ ⚡ Velocità: -- km/h            │
│ [Invia Conquista]               │
└─────────────────────────────────┘
```

### Colori dei Punti

| # | Colore | Esadecimale |
|---|--------|-------------|
| 1️⃣ | BLU | #667eea |
| 2️⃣ | VERDE | #10b981 |
| 3️⃣ | ARANCIO | #f39c12 |
| 4️⃣ | ROSSO | #ef4444 |

---

## 🔧 API Endpoints

### Creare una Conquista Territoriale

```bash
POST /api/territory-conquests
Headers:
  user-id: <user-id>
Body: {
  "points": [
    { "latitude": 45.4831, "longitude": 9.1747 },
    { "latitude": 45.4850, "longitude": 9.1760 },
    { "latitude": 45.4840, "longitude": 9.1780 },
    { "latitude": 45.4820, "longitude": 9.1770 }
  ],
  "durationMinutes": 45
}

Response (Valido):
{
  "message": "Conquista creata e inviata per approvazione",
  "conquest": {
    "id": "...",
    "distance": 2.45,    # perimetro territorio
    "calculatedSpeed": 3.27,  # km/h
    "status": "pending"
  }
}

Response (Cheat):
{
  "error": "CHEAT RILEVATO! Velocità impossibile (150 km/h > 60 km/h) - Ban di 1 giorno",
  "banned": true,
  "banTimeRemaining": 86400
}
```

### Visualizzare Conquiste Pendenti (Admin)

```bash
GET /api/territory-conquests/admin/pending
Headers:
  admin-id: <admin-id>

Response:
{
  "count": 5,
  "conquests": [
    {
      "id": "...",
      "username": "mario",
      "distance": 2.45,
      "calculatedSpeed": 3.27,
      "status": "pending",
      "createdAt": "2025-11-22T18:50:30.966Z"
    }
  ]
}
```

### Visualizzare Conquiste con Cheat Rilevati (Admin)

```bash
GET /api/territory-conquests/admin/flagged
Headers:
  admin-id: <admin-id>

Response:
{
  "count": 2,
  "conquests": [
    {
      "id": "...",
      "username": "hacker",
      "distance": 2.45,
      "calculatedSpeed": 150.5,   # VELOCITÀ IMPOSSIBILE!
      "status": "flagged_cheat",
      "cheatDetected": true,
      "reason": "CHEAT RILEVATO: Velocità impossibile (150.5 km/h > 60 km/h)"
    }
  ]
}
```

### Approvare Conquista (Admin)

```bash
POST /api/territory-conquests/:id/approve
Headers:
  admin-id: <admin-id>

Response:
{
  "message": "Conquista approvata",
  "conquest": { ... }
}
```

### Rifiutare Conquista (Admin)

```bash
POST /api/territory-conquests/:id/reject
Headers:
  admin-id: <admin-id>
Body: {
  "reason": "Territorio sovrappo ad area protetta"
}

Response:
{
  "message": "Conquista rifiutata",
  "conquest": { ... }
}
```

---

## 🏛️ Admin Dashboard

### Nuove Sezioni

L'admin ha accesso a 5 sezioni dedicate ai territori e ai ban:

#### 1. 🗺️ Sezione Territori
- Visualizza tutte le conquiste territoriali
- Filtri: In Sospeso | Approvate | Cheat Rilevati
- Mostra: distanza, durata, velocità calcolata, data
- Azioni: Approva | Rifiuta (con motivazione)

#### 2. 🚫 Sezione Ban
- Elenco di tutti i ban attivi (24 ore)
- Mostra: username, motivo, tempo rimanente
- Azione: Rimuovi Ban manualmente (se falso positivo)

#### 3. 🏃 Sezione Attività
- Visualizza attività registrate dagli utenti
- Filtri per tipo: Running | Walking | Cycling | Hiking
- Mostra: distanza, durata, calorie, velocità

#### 4. 📝 Sezione Log Attività
- Form per registrare attività per un utente
- Campi: username, tipo, distanza, durata, calorie, tempo
- L'attività risulta "registrata da admin"

#### 5. 📊 Dashboard
- Statistiche totali:
  - Conquiste in sospeso
  - Conquiste approvate
  - Cheat rilevati
  - Ban attivi
  - Area totale conquistata

---

## 📊 Dati Struttura

### TerritoryConquest

```typescript
{
  id: string;
  userId: string;
  username: string;
  startPoint: { latitude: number; longitude: number };
  endPoint: { latitude: number; longitude: number };
  points?: Array<{ latitude: number; longitude: number }>;  // 4 punti
  distance: number;           // km (perimetro)
  duration: number;           // minuti
  calculatedSpeed: number;    // km/h
  status: 'pending' | 'approved' | 'rejected' | 'flagged_cheat';
  cheatDetected: boolean;
  reason?: string;           // se cheat
  rejectionReason?: string;  // se rifiutato
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🧪 Esempi Pratici

### Test 1: Conquista Valida

```bash
curl -X POST http://localhost:3000/api/territory-conquests \
  -H "Content-Type: application/json" \
  -H "user-id: user-001" \
  -d '{
    "points": [
      {"latitude": 45.4831, "longitude": 9.1747},
      {"latitude": 45.4850, "longitude": 9.1760},
      {"latitude": 45.4840, "longitude": 9.1780},
      {"latitude": 45.4820, "longitude": 9.1770}
    ],
    "durationMinutes": 45
  }'

# Risultato: ✅ Conquista inviata per approvazione
```

### Test 2: Cheat Rilevato

```bash
# Stessi punti ma durata 1 minuto = velocità impossibile
curl -X POST http://localhost:3000/api/territory-conquests \
  -H "Content-Type: application/json" \
  -H "user-id: hacker" \
  -d '{
    "points": [...],
    "durationMinutes": 1  # TOO FAST!
  }'

# Risultato: ❌ CHEAT RILEVATO! Ban 24 ore
```

---

## 🎯 Vantaggi Architetturali

✅ **Anti-Cheat Automatico**
- Nessuna review manuale per cheat ovvi
- Ban istantaneo per velocità impossibili
- Riduce carico admin

✅ **Flessibilità Geometrica**
- Supporter 4 punti (quadrilatero)
- In futuro: N punti per poligoni complessi

✅ **Trasparenza Admin**
- Dashboard mostra cheat rilevati
- Admin può rimuovere ban se falso positivo
- Storico completo

✅ **UX Intuitiva**
- Mappa interattiva
- Colori diversi per ogni punto
- Real-time feedback
- Bottone reset per ricominciare

---

## 📈 Statistiche da Admin

L'admin può visualizzare:

```json
{
  "total": 42,
  "pending": 5,
  "approved": 35,
  "rejected": 1,
  "flagged": 1,
  "totalDistance": 128.5,
  "activeBans": 2
}
```

---

## 🔐 Sicurezza

✅ **Validazione**
- 4 punti obbligatori
- Durata tra 1-600 minuti
- Velocità < 0.5 km/h = scartato
- Velocità > 60 km/h = BAN

✅ **Persistenza**
- Tutti i dati salvati su file
- Ban salvati con scadenza
- Storico completo per audit

✅ **Admin Override**
- Può rimuovere ban manualmente
- Può approvare/rifiutare qualsiasi conquista
- Log di tutte le azioni

---

## 🚀 Roadmap Future

- 🗺️ Supporto N punti (poligoni complessi)
- 📸 Upload foto/video evidenza
- 🤖 AI per validazione automatica
- 📊 Analytics avanzati
- 🏆 Badges per territorio più grande
- ⚠️ Overlapping detection (territori sovrapposti)

---

**Versione**: 2.0  
**Data**: Novembre 2024  
**Status**: ✅ Production Ready
