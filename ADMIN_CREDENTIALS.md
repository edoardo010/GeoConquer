# 🔐 Credenziali Admin - GeoConquer

## ⚠️ IMPORTANTE - CREDENZIALI UNICHE

Queste sono le credenziali amministrative UNICHE per accedere al sistema di gestione delle conquiste.

### Accesso Admin Panel

**URL**: http://localhost:3000/admin.html

### Credenziali

```
Username: admin_geoconquer
Password: GeoConquer123!@#Admin
```

## ⚡ Funzionalità Admin

### 📊 Dashboard
- Visualizza statistiche in tempo reale:
  - Numero di conquiste in sospeso
  - Numero di conquiste approvate
  - Numero di conquiste rifiutate
  - Area totale conquistata (m²)

### ⏳ Conquiste in Sospeso
- Elenco di tutte le conquiste in attesa di approvazione
- Dettagli: username, territorio, area, distanza, descrizione
- Azioni: Approva o Rifiuta con motivazione

### ✅ Conquiste Approvate
- Elenco di tutte le conquiste approvate
- Dettagli completi con data/ora approvazione

### ❌ Conquiste Rifiutate
- Elenco di tutte le conquiste rifiutate
- Mostra il motivo del rifiuto

### 📋 Tutte le Conquiste
- Vista consolidata di tutte le conquiste (pending + approved + rejected)

## 📝 Workflow di Approvazione

1. **Utente crea conquista**: Registra route GPS e richiesta di conquista
2. **Admin riceve notifica**: Nuova conquista in sospeso nel dashboard
3. **Admin valida**: Controlla descrizione, area, distanza, evidenze
4. **Admin approva o rifiuta**:
   - ✅ **Approva**: Conquista diventa definitiva, utente guadagna punti
   - ❌ **Rifiuta**: Conquista scartata con motivazione, utente riceve feedback

## 🔒 Sicurezza

- ✅ Credenziali hardcoded nel sistema (per sviluppo)
- ✅ Admin ID unico per ogni sessione
- ✅ Token salvato in localStorage (per sessione)
- ⚠️ In produzione, implementare autenticazione robusta via database

## 📊 Endpoint API Admin

```bash
# Visualizzare conquiste in sospeso
GET /api/conquests/admin/pending
Header: admin-id: <admin-id>

# Visualizzare tutte le conquiste
GET /api/conquests/admin/all
Header: admin-id: <admin-id>

# Statistiche
GET /api/conquests/admin/stats
Header: admin-id: <admin-id>

# Filtrare per status
GET /api/conquests/admin/status/:status
Header: admin-id: <admin-id>
Parameters: status = pending | approved | rejected

# Approvare conquista
POST /api/conquests/:id/approve
Header: admin-id: <admin-id>

# Rifiutare conquista
POST /api/conquests/:id/reject
Header: admin-id: <admin-id>
Body: { "reason": "Motivo del rifiuto..." }
```

## 🧪 Test Rapido

```bash
# 1. Creare una conquista (da client)
curl -X POST http://localhost:3000/api/conquests \
  -H "Content-Type: application/json" \
  -H "user-id: test-user-123" \
  -d '{
    "territoryName": "Parco Sempione",
    "coordinates": [{"latitude": 45.4831, "longitude": 9.1747}],
    "area": 15000,
    "distance": 2.5,
    "description": "Ho conquistato il parco con una corsa mattutina"
  }'

# 2. Visualizzare conquiste in sospeso (da admin)
curl http://localhost:3000/api/conquests/admin/pending \
  -H "admin-id: admin-123"

# 3. Approvare conquista (da admin)
curl -X POST http://localhost:3000/api/conquests/<conquest-id>/approve \
  -H "admin-id: admin-123"

# 4. Rifiutare conquista (da admin)
curl -X POST http://localhost:3000/api/conquests/<conquest-id>/reject \
  -H "Content-Type: application/json" \
  -H "admin-id: admin-123" \
  -d '{"reason": "Area non valida per le regole del gioco"}'
```

## 🎯 Note Importanti

1. **Non condividere queste credenziali**: Sono credenziali di amministrazione
2. **Cambiar password in produzione**: Implementare un sistema di autenticazione sicuro
3. **Backup**: Salvare da qualche parte in caso di smarrimento
4. **Audit**: Implementare logging di tutte le azioni admin
5. **Rate limiting**: Aggiungere limiti di rate per prevenire brute-force

---

**Creato**: Novembre 2024
**Versione**: 1.0
**Status**: ✅ Attivo
