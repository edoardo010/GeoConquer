# 💾 Admin Database - File-Based Storage

## 📋 Panoramica

GeoConquer utilizza un sistema di **archiviazione basato su file JSON** per il database admin. **Nessun database esterno è necessario** - tutti i dati vengono salvati direttamente sul PC dell'admin in formato JSON.

### Dove sono i dati?

```
/path/to/project/data/
├── activities.json           # Attività registrate
├── conquests.json           # Conquiste territoriali
├── clans.json               # Clan creati
├── territories.json         # Territori conquistati
├── bans.json                # Ban attivi
├── users.json               # (Futuro) Dati utenti
└── backups/                 # Backup automatici
    ├── activities.json.TIMESTAMP
    ├── conquests.json.TIMESTAMP
    ├── clans.json.TIMESTAMP
    └── territories.json.TIMESTAMP
```

---

## ✅ Vantaggi

✅ **Nessun database esterno**
- Non serve PostgreSQL, MongoDB, o altri servizi
- Nessuna configurazione complessa
- Nessun server DB da mantenere

✅ **Dati locali e privati**
- Tutti i dati rimangono sul PC dell'admin
- Massima privacy e controllo
- Backup facile (copia i file)

✅ **Persistenza garantita**
- I dati sopravvivono ai riavvii del server
- Nessuna perdita di dati
- Salvataggio automatico dopo ogni operazione

✅ **Debugging facile**
- Puoi aprire i file JSON e leggere i dati direttamente
- Perfetto per testing e troubleshooting
- Nessuna query SQL complicata

---

## 📊 Admin Dashboard Database

Nel pannello admin, accedi alla sezione **💾 Database** per:

### 1. Visualizzare Informazioni

```
📊 Informazioni Database
├─ Tipo: File-Based (JSON)
├─ Percorso: /home/engine/project/data
├─ Spazio Totale: 2.51 KB
├─ Backup Disponibili: 5
└─ Status: ✅ ACTIVE

📦 Collezioni
├─ Utenti: 0
├─ Attività: 3
├─ Conquiste: 5
└─ Clan: 1
```

### 2. Creare Backup

```
[💾 Crea Backup] → Salva copia di tutti i dati
```

**Cosa fa:**
- Copia tutti i file JSON in `backups/`
- Aggiunge timestamp per tracciare quando è stato creato
- Perfetto per punti di recupero

### 3. Visualizzare Backup Disponibili

```
[📋 Visualizza Backup] → Elenco di tutti i backup
```

**Mostra:**
- Nome file backup
- Data/ora creazione
- Spazio occupato

---

## 🔧 API Endpoints

### Ottenere Informazioni Database

```bash
GET /api/admin/database/info
Headers:
  admin-id: <admin-id>

Response:
{
  "type": "File-Based (JSON)",
  "location": "/home/engine/project/data",
  "collections": {
    "users": { "count": 0 },
    "activities": { "count": 3 },
    "conquests": { "count": 5 },
    "clans": { "count": 1 }
  },
  "storage": {
    "totalSize": "2.51 KB",
    "backupCount": 5
  }
}
```

### Ottenere Statistiche

```bash
GET /api/admin/database/stats
Headers:
  admin-id: <admin-id>

Response:
{
  "storage": {
    "path": "/home/engine/project/data",
    "totalSize": "2.51 KB"
  },
  "collections": {
    "users": 0,
    "activities": 3,
    "conquests": 5,
    "clans": 1
  }
}
```

### Visualizzare Backup Disponibili

```bash
GET /api/admin/database/backups
Headers:
  admin-id: <admin-id>

Response:
{
  "backups": [
    {
      "filename": "activities.json.2025-11-22T21-00-21-536Z",
      "size": 2048,
      "created": "2025-11-22T21:00:21.536Z"
    }
  ]
}
```

### Creare Backup

```bash
POST /api/admin/database/backup
Headers:
  admin-id: <admin-id>

Response:
{
  "message": "Backup created successfully",
  "timestamp": "2025-11-22T21-00-21-536Z",
  "backupPath": "/home/engine/project/data/backups"
}
```

### Eliminare Tutti i Dati (ATTENZIONE!)

```bash
POST /api/admin/database/clear
Headers:
  admin-id: <admin-id>
Body: {
  "confirm": "DELETE_ALL_DATA"
}

Response:
{
  "message": "All data cleared successfully",
  "backupCreated": "backup BEFORE_CLEAR.TIMESTAMP"
}
```

⚠️ **Attenzione**: Questa operazione elimina TUTTI i dati, ma crea un backup prima di farlo.

---

## 📁 Struttura File JSON

### activities.json

```json
{
  "activity-id-1": {
    "id": "uuid",
    "userId": "user-001",
    "username": "mario",
    "type": "running",
    "title": "Corsa mattutina",
    "distance": 5.5,
    "duration": 45,
    "calories": 350,
    "loggedBy": "user",
    "createdAt": "2025-11-22T18:37:23.822Z"
  }
}
```

### conquests.json

```json
{
  "conquest-id-1": {
    "id": "uuid",
    "userId": "user-001",
    "username": "mario",
    "status": "approved",
    "approvedAt": "2025-11-22T19:00:00Z",
    "approvedBy": "admin-123",
    "createdAt": "2025-11-22T18:37:00Z"
  }
}
```

### clans.json

```json
{
  "clan-id-1": {
    "id": "uuid",
    "name": "Dragon Slayers",
    "founderId": "user-001",
    "members": ["user-001", "user-002"],
    "level": 1,
    "createdAt": "2025-11-22T18:30:00Z"
  }
}
```

### territories.json

```json
{
  "territory-id-1": {
    "id": "uuid",
    "userId": "user-001",
    "status": "pending",
    "distance": 2.45,
    "calculatedSpeed": 3.27,
    "cheatDetected": false,
    "createdAt": "2025-11-22T18:50:30Z"
  }
}
```

### bans.json

```json
{
  "user-id-1": {
    "id": "uuid",
    "userId": "user-001",
    "username": "hacker",
    "reason": "Velocità impossibile: 150 km/h",
    "bannedAt": "2025-11-22T18:50:42Z",
    "unbannedAt": "2025-11-23T18:50:42Z",
    "active": true
  }
}
```

---

## 🧪 Comandi Utili

### Visualizzare Tutti i Dati

```bash
# Attività
cat data/activities.json | jq .

# Conquiste
cat data/conquests.json | jq .

# Clan
cat data/clans.json | jq .

# Ban
cat data/bans.json | jq .

# Territori
cat data/territories.json | jq .
```

### Contare Record

```bash
# Numero di attività
jq 'length' data/activities.json

# Numero di conquiste
jq 'length' data/conquests.json

# Numero di clan
jq 'length' data/clans.json
```

### Spazio Disco Utilizzato

```bash
# Spazio totale
du -sh data/

# Per file
ls -lah data/*.json

# Backup
du -sh data/backups/
```

### Fare Backup Manuale

```bash
# Backup completo della cartella data
cp -r data data.backup.$(date +%Y-%m-%d_%H-%M-%S)

# O creare il backup via API
curl -X POST http://localhost:3000/api/admin/database/backup \
  -H "admin-id: admin-123"
```

---

## 🔐 Sicurezza

### Proteggere i Dati

```bash
# Rendi cartella leggibile solo dall'admin
chmod 700 data

# Rendi file non modificabili accidentalmente
chmod 644 data/*.json

# Proteggi backup
chmod 700 data/backups
```

### Backup Regolari

```bash
# Script per backup quotidiano
0 2 * * * cp -r /path/to/project/data /path/to/project/data.backup.$(date +\%Y-\%m-\%d)

# Mantieni solo ultimi 30 giorni
find /path/to/project -name 'data.backup.*' -mtime +30 -exec rm -rf {} \;
```

---

## 📈 Performance

### Limiti Attuali

✅ **Ottimale per:**
- < 100k record totali
- Deployment locale
- Testing e development
- Demo e MVP

❌ **Non adatto per:**
- > 1M record
- Query complesse
- Multi-utente concorrente massiccio
- Transazioni ACID

### Dimensione File Tipica

| Scenario | Dimensione | Numero Record |
|----------|-----------|---------------|
| Small app | 1-5 MB | 100-1000 |
| Medium app | 5-50 MB | 1000-10k |
| Large app | 50-500 MB | 10k-100k |

---

## 🔄 Migrazione a Database Reale

Se in futuro vuoi migrare a PostgreSQL/MongoDB:

1. **Export dati attuali**
   ```bash
   cp -r data data.export
   ```

2. **Scrivi script di migrazione**
   ```typescript
   const fs = require('fs');
   const activitiesData = JSON.parse(fs.readFileSync('data/activities.json'));
   
   // Inserisci in database vero
   for (const [id, activity] of Object.entries(activitiesData)) {
     database.insert('activities', activity);
   }
   ```

3. **Aggiorna i servizi**
   - Modifica `activityService`, `conquestService`, etc.
   - Sostituisci `loadFromDisk()` con query DB
   - Sostituisci `saveToDisk()` con INSERT/UPDATE DB

4. **Test completo**
   - Verifica che tutti i dati siano migrati
   - Testa tutta la funzionalità

---

## 🎉 Conclusione

Il sistema di database file-based di GeoConquer è:

✅ **Semplice** - Niente configurazione complessa
✅ **Affidabile** - I dati non vanno persi
✅ **Locale** - Tutto rimane sul PC admin
✅ **Scalabile** - Facile da migrare se necessario

---

**Versione**: 1.0  
**Data**: Novembre 2024  
**Status**: ✅ Production Ready (per deployment locale)
