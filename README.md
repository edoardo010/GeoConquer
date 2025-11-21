# GeoConquer 🏃🌍

Geoconquer è un'app innovativa che trasforma il movimento quotidiano in un'avventura di conquista.  
Correndo o camminando, gli utenti possono espandere il proprio territorio virtuale, sfidare amici e creare vere e proprie mappe di dominio personale.

---

## ✨ Funzionalità Implementate

- **✅ Conquista territoriale**: ogni passo conta per espandere il tuo regno
- **✅ Mappe interattive**: visualizza le aree conquistate in tempo reale con Leaflet.js
- **✅ Sfide tra amici**: competi per il controllo di quartieri, parchi o città
- **✅ Gamification completa**: badge, livelli e ricompense per mantenere alta la motivazione
- **✅ Salute e benessere**: integra il movimento con obiettivi fitness

---

## 🚀 Quick Start

### Installazione

```bash
# Clona il repository
git clone https://github.com/edoardo010/GeoConquer.git
cd GeoConquer

# Installa le dipendenze
npm install

# Avvia il server in modalità sviluppo
npm run dev
```

### Demo Rapida

```bash
# Esegui la demo per vedere il sistema in azione
npm run demo
```

### Build per Produzione

```bash
# Compila il progetto
npm run build

# Avvia il server
npm start
```

---

## 📚 API Endpoints

### Users
- `POST /api/users` - Crea nuovo utente
- `GET /api/users/:id` - Ottieni dettagli utente
- `GET /api/users/:id/stats` - Statistiche complete utente
- `GET /api/users/leaderboard` - Classifica globale

### Territories
- `POST /api/territories/activity` - Registra attività e conquista territorio
- `GET /api/territories` - Tutti i territori
- `GET /api/territories/user/:userId` - Territori di un utente
- `GET /api/territories/user/:userId/area` - Area totale conquistata

### Challenges
- `POST /api/challenges` - Crea nuova sfida
- `POST /api/challenges/:id/accept` - Accetta sfida
- `POST /api/challenges/:id/reject` - Rifiuta sfida
- `POST /api/challenges/:id/complete` - Completa sfida
- `GET /api/challenges/user/:userId` - Sfide di un utente

### Badges
- `GET /api/badges` - Lista di tutti i badge disponibili

📖 Documentazione completa: [API.md](./API.md)

---

## 🗺️ Mappa Interattiva

Apri `http://localhost:3000` dopo aver avviato il server per accedere alla mappa interattiva che mostra:

- Territori conquistati da tutti gli utenti
- Statistiche personali in tempo reale
- Badge ottenuti
- Sfide attive
- Classifica globale

---

## 🏗️ Architettura

```
src/
├── types/          # TypeScript interfaces
├── models/         # Database in-memory
├── services/       # Business logic
├── controllers/    # Request handlers
├── routes/         # API routes
├── utils/          # Utility functions (geo calculations)
├── app.ts          # Express app configuration
└── index.ts        # Server entry point

public/
└── index.html      # Interactive map demo
```

---

## 🎮 Sistema di Gamification

### Badge Disponibili

| Badge | Icona | Requisito |
|-------|-------|-----------|
| Primo Passo | 🚶 | Completa la prima attività |
| Esploratore | 🗺️ | Conquista 5 territori |
| Conquistatore | 👑 | Conquista 20 territori |
| Maratoneta | 🏃 | Percorri 42 km in totale |
| Campione | 🏆 | Vinci 10 sfide |

### Sistema di Livelli

- **Esperienza Base**: distanza / 100 metri
- **Bonus Territorio**: 50 XP per ogni territorio conquistato
- **Calcolo Livello**: √(esperienza / 100) + 1

---

## 🛠️ Tecnologie Utilizzate

- **Backend**: Node.js + Express + TypeScript
- **Database**: In-Memory (facilmente estendibile a PostgreSQL/PostGIS)
- **Mappe**: Leaflet.js + OpenStreetMap
- **Calcoli Geo**: Algoritmi custom per distanze Haversine e aree poligonali

---

## 📊 Funzionalità del Sistema

### Conquista Territoriale
- Registrazione automatica di percorsi GPS
- Generazione dinamica di poligoni territoriali
- Calcolo area conquistata con precisione geografica
- Sistema di riconoscimento territori sovrapposti

### Sistema Sfide
- Creazione sfide territorio-specifiche
- Stati: pending, accepted, rejected, completed
- Tracking vincitori e statistiche
- Sistema di notifiche per sfide ricevute

### Leaderboard
- Classifica per area totale conquistata
- Classifica per distanza percorsa
- Sistema di ranking dinamico
- Visualizzazione livelli e badge

---

## 🔮 Future Features

- Integrazione con database PostgreSQL + PostGIS
- Autenticazione JWT
- WebSocket per aggiornamenti real-time
- App mobile nativa (React Native)
- Sistema di team e clan
- Eventi e sfide globali
- Integrazione con smartwatch e fitness tracker
- Modalità offline con sincronizzazione

---

## 📝 Esempio di Utilizzo

```typescript
// Crea un utente
POST /api/users
{
  "username": "mario_rossi",
  "email": "mario@example.com"
}

// Registra un'attività
POST /api/territories/activity
{
  "userId": "user-uuid",
  "route": [
    { "latitude": 45.4642, "longitude": 9.1900 },
    { "latitude": 45.4652, "longitude": 9.1910 }
  ],
  "duration": 1800
}

// Crea una sfida
POST /api/challenges
{
  "challengerId": "user-uuid-1",
  "challengedId": "user-uuid-2",
  "territoryId": "territory-uuid",
  "targetDistance": 5000
}
```

---

## 🤝 Contribuire

Contributi, issues e feature requests sono benvenuti!

---

## 📄 Licenza

ISC

---

## 👨‍💻 Autore

GeoConquer - Turning fitness into conquest

---

**🌍 Inizia ora la tua avventura territoriale! 🏃‍♂️**
