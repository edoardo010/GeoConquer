# 💾 Sistema di Persistenza Dati - GeoConquer

## 📋 Panoramica

GeoConquer **NON utilizza database esterni**. Tutti i dati sono salvati come file JSON nella cartella `data/` sul PC dell'admin.

I dati persistono automaticamente e sopravvivono al riavvio del server.

---

## 📁 Struttura Cartelle

```
project/
└── data/                           # Cartella dati (creata automaticamente)
    ├── activities.json            # Attività degli utenti
    ├── conquests.json            # Conquiste territoriali
    ├── clans.json                # Clan e membri
    ├── users.json                # (Futuro) Dati utenti
    └── backups/                  # (Futuro) Backup automatici
        ├── activities.json.2024-11-22T18-30-45-000Z
        ├── conquests.json.2024-11-22T18-30-45-000Z
        └── ...
```

---

## 🔧 Come Funziona

### 1. Salvataggio Automatico
Ogni volta che:
- ✅ Un utente registra un'attività
- ✅ Un admin registra attività per un utente
- ✅ Una conquista viene approvata/rifiutata
- ✅ Un clan viene creato/modificato
- ✅ Un utente aderisce/esce da un clan

**I dati vengono IMMEDIATAMENTE salvati su file JSON.**

### 2. Caricamento all'Avvio
Quando il server si avvia:
1. Controlla la cartella `data/`
2. Se i file JSON esistono, li carica in memoria
3. Se non esistono, crea file vuoti
4. L'applicazione è pronta a usare i dati

### 3. Persistenza
Tutti i dati rimangono nel file anche se:
- ✅ Il server si riavvia
- ✅ Il programma va in crash
- ✅ Il PC si spegne (i file rimangono su disco)

---

## 📊 Formato Dati

### activities.json
```json
{
  "activity-id-1": {
    "id": "activity-id-1",
    "userId": "user-001",
    "username": "mario_rossi",
    "type": "running",
    "title": "Corsa mattutina",
    "distance": 5.5,
    "duration": 45,
    "calories": 350,
    "startTime": "2024-11-22T07:00:00.000Z",
    "endTime": "2024-11-22T07:45:00.000Z",
    "coordinates": [{"latitude": 45.5, "longitude": 9.2}],
    "avgSpeed": 7.3,
    "maxSpeed": 9.5,
    "loggedBy": "user",
    "createdAt": "2025-11-22T18:37:23.822Z",
    "updatedAt": "2025-11-22T18:37:23.822Z"
  }
}
```

### conquests.json
```json
{
  "conquest-id-1": {
    "id": "conquest-id-1",
    "userId": "user-001",
    "username": "mario_rossi",
    "territoryName": "Parco Sempione",
    "area": 15000,
    "distance": 2.5,
    "status": "approved",
    "approvedAt": "2025-11-22T18:40:00.000Z",
    "approvedBy": "admin-123",
    "createdAt": "2025-11-22T18:37:00.000Z"
  }
}
```

### clans.json
```json
{
  "clan-id-1": {
    "id": "clan-id-1",
    "name": "Dragon Slayers",
    "description": "Un clan epico",
    "founderId": "user-001",
    "members": ["user-001", "user-002"],
    "level": 1,
    "experience": 0,
    "totalArea": 0,
    "createdAt": "2025-11-22T18:30:00.000Z",
    "updatedAt": "2025-11-22T18:30:00.000Z"
  }
}
```

---

## 🎯 Vantaggi

✅ **Nessun Database Esterno**
- Non serve installare PostgreSQL, MongoDB, ecc.
- Nessuna configurazione DB complessa
- Nessun server DB da mantenere

✅ **Dati Locali**
- Tutti i dati rimangono sul PC dell'admin
- Massima privacy
- Backup facile (copia la cartella `data/`)

✅ **Persistenza Garantita**
- I dati sopravvivono ai riavvii
- Non si perdono dati
- Backup automatici (quando implementati)

✅ **Lettura Rapida**
- I file JSON si caricano istantaneamente all'avvio
- Nessuna latenza di connessione DB

✅ **Debugging Facile**
- Puoi aprire i file JSON e leggere direttamente i dati
- Nessun query SQL complicato

---

## ⚙️ Gestione Manuale

### Visualizzare Tutti i Dati
```bash
# Attività
cat project/data/activities.json | jq .

# Conquiste
cat project/data/conquests.json | jq .

# Clan
cat project/data/clans.json | jq .
```

### Esportare Dati
```bash
# Copia tutta la cartella data per backup
cp -r project/data project/data.backup.$(date +%Y%m%d-%H%M%S)
```

### Eliminare Dati Specifici
```bash
# Elimina il file (i dati si ricreeranno vuoti al riavvio)
rm project/data/activities.json
```

### Modificare Dati Manualmente
```bash
# ATTENZIONE: Modifica solo se sai cosa fai!
# Apri con editor e modifica il JSON
nano project/data/activities.json
```

---

## 📈 Statistiche Dati

### Verificare Quanto Spazio Occupano
```bash
du -sh project/data/
# es: 2.5M	project/data/
```

### Contare Numero di Record
```bash
# Attività
jq 'length' project/data/activities.json

# Conquiste
jq 'length' project/data/conquests.json

# Clan
jq 'length' project/data/clans.json
```

---

## 🔒 Sicurezza

### Proteggere i Dati
```bash
# Rendi cartella leggibile solo dall'admin
chmod 700 project/data

# Rendi file non modificabili accidentalmente
chmod 644 project/data/*.json
```

### Backup Regolari
```bash
# Crea backup giornaliero
cp -r project/data "project/data.backup.$(date +%Y-%m-%d_%H-%M-%S)"

# O usa uno script cron per automatizzare
```

---

## 🚨 Limitazioni

Questo sistema è ideale per:
- ✅ Sviluppo locale
- ✅ Testing e QA
- ✅ Demo e MVP
- ✅ Piccoli deployment (<10k utenti)

Non è ideale per:
- ❌ Grandi dataset (>100k utenti)
- ❌ Multi-utente concorrente
- ❌ Transazioni complesse
- ❌ Query avanzate

---

## 🔄 Migrazione a Database Reale

Se in futuro vuoi migrare a un database vero (PostgreSQL, MongoDB):

1. **Export dati JSON**
   ```bash
   cp -r project/data project/data.backup
   ```

2. **Aggiorna i servizi** (activityService, conquestService, clanService)
   - Sostituisci `loadFromDisk()` con query DB
   - Sostituisci `saveToDisk()` con INSERT/UPDATE DB

3. **Importa dati**
   - Script Python per leggere JSON e inserire in DB

4. **Test**
   - Verifica che tutti i dati siano migrati correttamente

---

## 💡 Esempio: Come Funziona l'Attività Persistenza

### Scenario 1: Utente Registra Attività

```
1. User invia POST /api/activities
2. Server riceve richiesta
3. activityService.createActivity() crea oggetto in memoria
4. activities.set(id, activity) aggiunge alla Map
5. saveToDisk() salva la Map come JSON su activities.json
6. Server risponde al client
```

### Scenario 2: Server Si Riavvia

```
1. Server si avvia
2. activityService constructor si esegue
3. loadFromDisk() legge activities.json
4. JSON viene convertito in Map
5. activityService è pronto con i dati precedenti
6. Client fa GET /api/activities/user/123
7. Riceve le attività salvate prima del riavvio ✅
```

---

## 📋 Checklist File Dati

- [x] `activities.json` - Attività registrate
- [x] `conquests.json` - Conquiste territoriali
- [x] `clans.json` - Clan creati
- [ ] `users.json` - Dati utenti (non ancora salvato)
- [ ] `backups/` - Backup automatici (non ancora implementato)

---

## 🎓 Test Persistenza

Prova tu stesso:

### Test 1: Registra Attività
```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -H "user-id: test-user" \
  -d '{"type":"running","title":"Test","distance":5,...}'
```

### Test 2: Riavvia Server
```bash
pkill -f "npm start"
sleep 2
npm start
```

### Test 3: Verifica Dati Persistono
```bash
curl http://localhost:3000/api/activities/user/test-user
# Dovresti vedere l'attività registrata prima del riavvio ✅
```

---

## 📞 Troubleshooting

### Problema: File corrotto
**Soluzione**: Elimina il file e ricrea
```bash
rm project/data/activities.json
# Riavvia server, il file verrà ricreato
```

### Problema: Permessi negati
**Soluzione**: Correggi permessi
```bash
chmod 755 project/data
chmod 644 project/data/*.json
```

### Problema: Spazio disco pieno
**Soluzione**: Archivia backup vecchi
```bash
# Mantieni solo ultimi 30 giorni di backup
find project/data/backups -mtime +30 -delete
```

---

## 🎉 Conclusione

GeoConquer usa un sistema di persistenza **semplice, affidabile e locale** basato su file JSON.

✅ **Nessun database esterno necessario**
✅ **Dati salvati localmente sul PC admin**
✅ **Persistenza garantita tra i riavvii**
✅ **Facile backup e gestione**

---

**Versione**: 1.0  
**Data**: Novembre 2024  
**Status**: ✅ Production Ready
