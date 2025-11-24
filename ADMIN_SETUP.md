# 🔧 Guida Setup Amministratore - GeoConquer

## Introduzione

Questa guida fornisce istruzioni step-by-step per configurare GeoConquer con un database professionale su un PC amministratore.

---

## 📋 Requisiti Preliminari

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **npm** 8+ (incluso con Node.js)
- **Git** (per clonare il repository)
- Un **database** a scelta (PostgreSQL, MongoDB, etc.)

---

## 🚀 Installazione Rapida

### 1. Clonare il Repository

```bash
git clone https://github.com/edoardo010/GeoConquer.git
cd GeoConquer
```

### 2. Installare le Dipendenze

```bash
npm install
```

### 3. Eseguire il Database Setup Wizard

Avvia l'assistente interattivo di configurazione:

```bash
npm run setup:db
```

Oppure, se stai usando TypeScript direttamente:

```bash
npx ts-node src/admin/dbSetup.ts
```

### 4. Seguire i Passaggi del Wizard

L'assistente ti guiderà attraverso:

1. **Configurazione Admin Account**
   - Username amministratore
   - Email amministratore  
   - Password sicura

2. **Selezione del Database**
   - PostgreSQL + PostGIS (CONSIGLIATO) 🏆
   - MongoDB
   - Firebase/Firestore
   - DynamoDB
   - In-Memory (solo test)

3. **Configurazione Specifica del Database**
   - Host e porta
   - Credenziali
   - Nome database

4. **Configurazione Server**
   - Porta del server (default: 3000)

5. **Test della Connessione** (opzionale)
   - Verifica che tutto sia configurato correttamente

---

## 🗄️ Configurazioni Database Dettagliate

### PostgreSQL + PostGIS (CONSIGLIATO)

#### Prerequisiti

**Windows:**
```bash
# Scarica PostgreSQL da https://www.postgresql.org/download/windows/
# Oppure usa Chocolatey:
choco install postgresql
```

**macOS:**
```bash
# Usa Homebrew:
brew install postgresql@14
brew install postgis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis
```

#### Setup nel Wizard

```
Scegli: 1 (PostgreSQL + PostGIS)
Host: localhost
Porta: 5432
Username: postgres
Password: [la tua password]
Database name: geoconquer
```

#### Connessione Manuale (se necessario)

```bash
psql -U postgres -h localhost

# Dentro psql:
CREATE DATABASE geoconquer;
\c geoconquer
CREATE EXTENSION postgis;
```

---

### MongoDB

#### Prerequisiti

**Opzione 1: Locale**
```bash
# Windows
choco install mongodb-community

# macOS
brew install mongodb-community

# Linux
sudo apt install -y mongodb
sudo systemctl start mongod
```

**Opzione 2: MongoDB Atlas (Cloud)**
1. Crea account su [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster
3. Copia la connection string

#### Setup nel Wizard

```
Scegli: 2 (MongoDB)
Usi MongoDB Atlas? [s/n]

Se locale:
  Host: localhost
  Porta: 27017
  Username: (lasciare vuoto se no auth)
  Password: (lasciare vuoto se no auth)
  Database: geoconquer

Se Atlas:
  Connection String: mongodb+srv://user:pass@cluster.mongodb.net/geoconquer
```

---

### Firebase/Firestore

#### Prerequisiti

1. Crea un progetto su [Firebase Console](https://console.firebase.google.com)
2. Abilita Firestore
3. Copia Project ID e API Key

#### Setup nel Wizard

```
Scegli: 3 (Firebase)
Firebase Project ID: your-project-id
Firebase API Key: AIzaSyDxxxxxxxxxxxx
```

---

### DynamoDB

#### Prerequisiti

1. **AWS Account** con credenziali configurate
2. Installa AWS CLI:

```bash
pip install awscli
aws configure
```

#### Setup nel Wizard

```
Scegli: 4 (DynamoDB)
Usi AWS? [s/n] s

# AWS userà le credenziali locali configurate
```

---

## 📝 File di Configurazione

Dopo il setup, verrà creato un file `.env` con:

```env
PORT=3000
NODE_ENV=production

# Admin Account (hash della password)
ADMIN_USERNAME=your_admin_username
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD_HASH=xxxxxxxxxxxxx

# Database Configuration
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=geoconquer
DATABASE_URL=postgresql://postgres:pass@localhost:5432/geoconquer

# Security
JWT_SECRET=xxxxxxxxxxxxxx
SESSION_SECRET=xxxxxxxxxxxxxx
```

⚠️ **IMPORTANTE**: Non committare il file `.env` su Git! È già nel `.gitignore`.

---

## 🏗️ Creazione dello Schema Database

### PostgreSQL (Automatico con ORM)

Se usi un ORM come TypeORM, le tabelle vengono create automaticamente:

```bash
npm run build
npm run typeorm migration:run
```

### MongoDB (Opzionale)

Le collection vengono create dinamicamente alla prima scrittura.

### Firebase/Firestore

Le collections vengono create tramite il dashboard.

---

## ▶️ Avvio del Server

### Modalità Sviluppo

```bash
npm run dev
```

Output atteso:
```
🌍 GeoConquer API running on port 3000
📍 Server: http://localhost:3000
🗺️  Territory maps and challenges system active
```

### Modalità Produzione

```bash
npm run build
npm start
```

---

## 🧪 Test della Configurazione

### 1. Verifica del Server

```bash
curl http://localhost:3000/api
```

Risposta attesa:
```json
{
  "name": "GeoConquer API",
  "version": "1.0.0",
  "endpoints": {
    "users": "/api/users",
    "territories": "/api/territories",
    "challenges": "/api/challenges",
    "badges": "/api/badges"
  }
}
```

### 2. Test Registrazione Utente

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!",
    "confirmPassword": "Test1234!"
  }'
```

Risposta attesa (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "username": "testuser",
    "email": "test@example.com",
    "level": 1,
    "createdAt": "2024-11-22T10:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

### 3. Accedi all'Interfaccia Web

Apri il browser e vai a:
```
http://localhost:3000
```

Dovresti vedere:
- ✅ Header con pulsanti "Accedi" e "Registrati"
- ✅ Mappa interattiva
- ✅ Panel statistiche
- ✅ Badges e sfide

---

## 🔐 Sicurezza

### Best Practices

1. **Password Forte**
   - ✅ Minimo 8 caratteri
   - ✅ Maiuscole e minuscole
   - ✅ Numeri
   - ✅ Caratteri speciali

2. **Database**
   - ✅ Usa password forte per l'accesso al database
   - ✅ Configura firewall/security groups
   - ✅ Abilita SSL/TLS per le connessioni

3. **Ambiente**
   - ✅ Mai esporre `.env` pubblicamente
   - ✅ Usa variabili d'ambiente in produzione
   - ✅ Ruota le chiavi JWT periodicamente

4. **API**
   - ✅ Abilita HTTPS in produzione
   - ✅ Implementa rate limiting
   - ✅ Valida tutti gli input
   - ✅ Usa CORS correttamente

---

## 🐛 Troubleshooting

### Problema: "Connection refused"

**Soluzione:**
```bash
# Verifica che il database sia in esecuzione
# PostgreSQL:
sudo systemctl status postgresql

# MongoDB:
sudo systemctl status mongod
```

### Problema: "Module not found"

**Soluzione:**
```bash
# Reinstalla le dipendenze
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Port already in use"

**Soluzione:**
```bash
# Cambia porta nel file .env
PORT=3001

# Oppure, trova il processo che usa la porta:
# Windows:
netstat -ano | findstr :3000

# Linux/macOS:
lsof -i :3000
```

### Problema: "Invalid password hash"

**Soluzione:**
```bash
# Rigenera la configurazione:
npm run setup:db
```

---

## 📊 Migrazioni Database

### Per PostgreSQL con TypeORM

```bash
# Crea una migrazione
npm run typeorm migration:generate -- -n CreateUsersTable

# Esegui le migrazioni
npm run typeorm migration:run

# Annulla l'ultima migrazione
npm run typeorm migration:revert
```

---

## 🌐 Deployment

### Heroku

```bash
# Login
heroku login

# Crea app
heroku create my-geoconquer

# Imposta variabili d'ambiente
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET=...

# Deploy
git push heroku main
```

### AWS EC2

```bash
# SSH nell'istanza
ssh -i key.pem ec2-user@your-instance

# Clona il repository
git clone your-repo
cd GeoConquer

# Installa Node e PostgreSQL
sudo yum update
sudo yum install nodejs postgresql

# Configura l'app
npm install
npm run setup:db
npm run build

# Avvia con PM2
npm install -g pm2
pm2 start dist/index.js
pm2 startup
pm2 save
```

---

## 📞 Support

Per problemi o domande:

1. Consulta la documentazione API: `/API.md`
2. Guarda le opzioni di database: `/DATABASE_OPTIONS.md`
3. Apri una issue su GitHub
4. Contatta il team di sviluppo

---

## ✅ Checklist di Setup Completo

- [ ] Node.js e npm installati
- [ ] Database scelto e installato
- [ ] Repository clonato
- [ ] `npm install` eseguito
- [ ] `npm run setup:db` completato
- [ ] File `.env` creato
- [ ] Test di connessione passato
- [ ] Server avviato con `npm run dev`
- [ ] Interfaccia web accessibile
- [ ] Registrazione utente testata
- [ ] Login utente testato

---

**🎉 Setup completato! GeoConquer è pronto per l'uso.**

Visita http://localhost:3000 per iniziare!
