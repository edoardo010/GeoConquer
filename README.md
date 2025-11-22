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
- **✅ Sistema di Autenticazione**: Registrazione e Login utenti con validazione JWT
- **✅ Database Setup Wizard**: Configurazione guidata per amministratori
- **✅ Supporto Multi-Database**: PostgreSQL, MongoDB, Firebase, DynamoDB
- **✅ Sistema di Clan**: Crea/unisciti a clan, leaderboard clan globale
- **✅ Leaderboard Globale**: Classifica giocatori e clan
- **✅ UI Premium Dark Theme**: Design moderno con tema scuro e gradients
- **✅ Design Responsive**: Mobile-first, works on all devices
- **✅ State Management Centralizzato**: Gestione stato di app coerente
- **✅ Error Handling Robusto**: Validazione e messaggi di errore inline

---

## 🚀 Quick Start

### 1. Installazione

```bash
# Clona il repository
git clone https://github.com/edoardo010/GeoConquer.git
cd GeoConquer

# Installa le dipendenze
npm install
```

### 2. Setup Database (Opzionale per Sviluppo)

Per usare un database reale (PostgreSQL, MongoDB, Firebase, ecc.):

```bash
# Esegui il Database Setup Wizard
npm run setup:db

# Segui i passaggi interattivi:
# 1. Configura account amministratore
# 2. Scegli tipo di database
# 3. Inserisci credenziali
# 4. Configura porta server
```

### 3. Avvia il Server

**Modalità Sviluppo** (con hot reload):
```bash
npm run dev
# Server: http://localhost:3000
```

**Modalità Produzione**:
```bash
npm run build
npm start
```

### 4. Accedi all'Interfaccia

Apri il browser e vai a: **http://localhost:3000**

- 👤 **Registrati**: Crea un nuovo account
- 🔓 **Accedi**: Accedi con le tue credenziali
- 🗺️ **Esplora la Mappa**: Visualizza i territori conquistati
- 🏆 **Classifica**: Consulta la leaderboard globale
- ⚔️ **Clan**: Crea o unisciti a un clan

### Demo Rapida

```bash
npm run demo
```

---

## 📖 Documentazione

- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Guida completa per amministratori (Database Setup, Sicurezza, Troubleshooting)
- **[DATABASE_OPTIONS.md](./DATABASE_OPTIONS.md)** - Opzioni professionali per database (PostgreSQL, MongoDB, Firebase, DynamoDB)
- **[API.md](./API.md)** - Documentazione degli endpoint API
- **[UI_GUIDE.md](./UI_GUIDE.md)** - Guida dell'interfaccia e design premium dark theme

---

## 📚 API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registra nuovo utente
- `POST /api/auth/login` - Accedi con credenziali
- `POST /api/auth/logout` - Esci dalla sessione
- `GET /api/auth/verify` - Verifica token JWT
- `GET /api/auth/password-requirements` - Requisiti password
- `GET /api/auth/username-requirements` - Requisiti username

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

- ✅ **Integrazione con database PostgreSQL + PostGIS** (opzioni disponibili, setup wizard implementato)
- ✅ **Autenticazione con JWT** (implementato nei servizi)
- WebSocket per aggiornamenti real-time
- App mobile nativa (React Native)
- Sistema di team e clan
- Eventi e sfide globali
- Integrazione con smartwatch e fitness tracker
- Modalità offline con sincronizzazione
- Notifiche push per nuove sfide
- Sistema di messaggistica tra giocatori

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
