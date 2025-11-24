# 🏆 Sistema di Conquiste - GeoConquer

## 📋 Panoramica

Il sistema di conquiste è il cuore di GeoConquer. Permette agli utenti di registrare le loro attività GPS (corse, camminate) e convertirle in "conquiste territoriali" che devono essere approvate da un amministratore.

## 🎮 Flusso Utente

### 1️⃣ Registrazione Conquista
L'utente, dopo una corsa o camminata, registra una conquista con:
- 📍 Nome del territorio
- 🗺️ Coordinate GPS
- 📏 Area conquistata (m²)
- 📍 Distanza percorsa (km)
- 📝 Descrizione dettagliata

**Status Iniziale**: `pending` ⏳

### 2️⃣ Approvazione Admin
L'amministratore visualizza tutte le conquiste in sospeso e:
- ✅ **Approva**: La conquista diventa ufficiale, l'utente guadagna punti/livelli
- ❌ **Rifiuta**: La conquista viene scartata con spiegazione

### 3️⃣ Conquistaapprovata
Una volta approvata, la conquista:
- Contribuisce al territorio dell'utente sulla mappa
- Aggiunge esperienza al livello
- Viene inclusa nella classifica
- Contribuisce alle statistiche del clan (se in clan)

## 🔧 API Endpoints

### 📝 User Endpoints

#### Creare una Conquista
```bash
POST /api/conquests
Headers:
  user-id: <user-id>
Body: {
  "territoryName": "Parco Sempione",
  "coordinates": [{"latitude": 45.4831, "longitude": 9.1747}],
  "area": 15000,
  "distance": 2.5,
  "description": "Corsa mattutina nel parco",
  "evidenceUrl": "https://..."  // opzionale
}

Response: {
  "message": "Conquest record created and pending approval",
  "conquest": { ... }
}
```

#### Visualizzare Conquiste dell'Utente
```bash
GET /api/conquests/user/:userId

Response: {
  "count": 5,
  "conquests": [ ... ]
}
```

#### Visualizzare Una Conquista
```bash
GET /api/conquests/record/:id

Response: { conquest object }
```

### 👨‍💼 Admin Endpoints (Richiedono Header `admin-id`)

#### Visualizzare Conquiste in Sospeso
```bash
GET /api/conquests/admin/pending
Headers:
  admin-id: <admin-id>

Response: {
  "count": 12,
  "conquests": [ ... ]
}
```

#### Visualizzare Tutte le Conquiste
```bash
GET /api/conquests/admin/all?limit=100
Headers:
  admin-id: <admin-id>
```

#### Visualizzare per Status
```bash
GET /api/conquests/admin/status/:status
Parameters:
  status = "pending" | "approved" | "rejected"
Headers:
  admin-id: <admin-id>
```

#### Statistiche
```bash
GET /api/conquests/admin/stats
Headers:
  admin-id: <admin-id>

Response: {
  "pending": 12,
  "approved": 156,
  "rejected": 8,
  "totalArea": 2456789
}
```

#### Approvare Conquista
```bash
POST /api/conquests/:id/approve
Headers:
  admin-id: <admin-id>

Response: {
  "message": "Conquest approved successfully",
  "conquest": { ... }
}
```

#### Rifiutare Conquista
```bash
POST /api/conquests/:id/reject
Headers:
  admin-id: <admin-id>
Body: {
  "reason": "Area troppo grande per il regolamento"
}

Response: {
  "message": "Conquest rejected successfully",
  "conquest": { ... }
}
```

## 📊 Struttura Dati

```typescript
interface ConquestRecord {
  id: string;
  userId: string;
  username: string;
  territoryName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  area: number;
  distance: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  evidenceUrl?: string;
}
```

## 🔐 Admin Panel

**URL**: `http://localhost:3000/admin.html`

### Funzionalità

- 📊 **Dashboard**: Statistiche in tempo reale
  - Conquiste in sospeso
  - Conquiste approvate
  - Conquiste rifiutate
  - Area totale conquistata

- ⏳ **Conquiste in Sospeso**: Elenco ordinabile
  - Approva con un click
  - Rifiuta con motivazione

- ✅ **Approvate**: Cronologia delle approvazioni

- ❌ **Rifiutate**: Cronologia dei rifiuti con motivi

- 📋 **Tutte**: Vista consolidata

### Credenziali Admin

```
Username: admin_geoconquer
Password: GeoConquer123!@#Admin
```

⚠️ **Importante**: Queste credenziali sono UNICHE. Cambiare in produzione!

## 🧪 Test Rapido

```bash
# 1. Creare conquista
curl -X POST http://localhost:3000/api/conquests \
  -H "Content-Type: application/json" \
  -H "user-id: user-123" \
  -d '{
    "territoryName": "Parco Centrale",
    "coordinates": [{"latitude": 45.5, "longitude": 9.2}],
    "area": 20000,
    "distance": 3.2,
    "description": "Corsa mattutina"
  }'

# 2. Visualizzare conquiste in sospeso
curl http://localhost:3000/api/conquests/admin/pending \
  -H "admin-id: admin-123"

# 3. Approvare (sostituire con ID reale)
curl -X POST http://localhost:3000/api/conquests/<id>/approve \
  -H "admin-id: admin-123"

# 4. Rifiutare
curl -X POST http://localhost:3000/api/conquests/<id>/reject \
  -H "Content-Type: application/json" \
  -H "admin-id: admin-123" \
  -d '{"reason": "Non valido"}'
```

## 📱 Integrazione Frontend

### Registrare una Conquista da App
```javascript
async function submitConquest(data) {
  const response = await fetch('http://localhost:3000/api/conquests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': currentUser.id
    },
    body: JSON.stringify({
      territoryName: data.name,
      coordinates: data.coordinates,
      area: data.area,
      distance: data.distance,
      description: data.description
    })
  });

  const result = await response.json();
  
  if (response.ok) {
    showAlert('✅ Conquista inviata per approvazione!');
  } else {
    showAlert('❌ Errore: ' + result.error);
  }
}
```

### Visualizzare Conquiste Approvate
```javascript
async function loadMyConquests() {
  const response = await fetch(
    `http://localhost:3000/api/conquests/user/${currentUser.id}`
  );
  
  const data = await response.json();
  const approved = data.conquests.filter(c => c.status === 'approved');
  
  // Mostra sulla mappa
  approved.forEach(conquest => {
    drawConquestOnMap(conquest);
  });
}
```

## 🎯 Regole di Approvazione

L'admin deve controllare:

1. **Coerenza Geografica**: Le coordinate sono dentro una mappa valida?
2. **Dimensione Ragionevole**: L'area è entro limiti ragionevoli?
3. **Distanza Sensata**: La distanza corrisponde all'area?
4. **Descrizione Adeguata**: L'utente ha fornito dettagli sufficienti?
5. **Non Duplicato**: La stessa area è già stata conquistata?

## 📈 Statistiche e Metriche

Le conquiste approvate contribuiscono a:

```
Utente:
- Area totale conquistata
- Distanza totale percorsa
- Livello attuale
- Esperienza accumulata
- Posizione in classifica

Clan:
- Area totale del clan
- Distanza totale percorsa
- Livello del clan
- Posizione in classifica clan
```

## 🔄 Lifecycle di una Conquista

```
[Utente invia conquista]
         ↓
  Status: PENDING ⏳
  (In attesa approvazione admin)
         ↓
    [Admin revisiona]
         ↓
    ┌────┴────┐
    ↓         ↓
APPROVED ✅  REJECTED ❌
    ↓         ↓
[Aggiorna]  [Feedback
 profilo]    all'utente]
    ↓
[Conquista
 attiva]
```

## 🚀 Best Practices

1. **Per Utenti**:
   - Fornire dettagli accurati
   - Includere evidenze fotografiche se possibile
   - Descrivere il percorso chiaramente

2. **Per Admin**:
   - Controllare regolarmente le conquiste in sospeso
   - Fornire motivi chiari per i rifiuti
   - Mantener log delle approvazioni
   - Implementare limiti anti-abuso

3. **Per Developer**:
   - Aggiungere upload foto/video
   - Implementare moderazione AI
   - Aggiungere notifiche per utenti
   - Creare analytics dettagliati

## 🔍 Troubleshooting

### Problema: Admin non vede conquiste
**Soluzione**: Verificare che `admin-id` header sia presente

### Problema: Approva non funziona
**Soluzione**: Verificare che conquest sia in status `pending`

### Problema: Status rimane pending
**Soluzione**: Verificare che admin-id sia valido

## 📝 Changelog

### v1.0 (Novembre 2024)
- ✅ Sistema conquiste completo
- ✅ Admin panel con dashboard
- ✅ Approvazione/Rifiuto
- ✅ Logging e statistiche

## 🔗 Risorse Correlate

- [ADMIN_CREDENTIALS.md](./ADMIN_CREDENTIALS.md) - Credenziali admin
- [API.md](./API.md) - Documentazione API completa
- [README.md](./README.md) - Guida principale

---

**Versione**: 1.0  
**Ultimo aggiornamento**: Novembre 2024  
**Status**: ✅ Production Ready
