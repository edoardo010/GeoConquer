# 🎨 GeoConquer UI Guide - Premium Dark Theme

## 📋 Panoramica dell'Interfaccia

GeoConquer ora ha un design completamente rinato con tema scuro premium, leaderboard globali e sistema di clan integrato.

---

## 🏠 Layout Principale

### Header Sticky (In alto)
- **Logo**: GeoConquer con gradient dorato
- **Auth Buttons**: Accedi / Registrati (non autenticati)
- **User Info**: Avatar, Nome, Livello + Pulsante Esci (autenticati)

### Sezione 1: Mappa & Statistiche (Layout a griglia 2 colonne)

**Colonna Sinistra (Principale)**:
- 🗺️ Mappa interattiva Leaflet
- Mostra tutti i territori conquistati
- Colori: Blu (#667eea) = tuoi, Rosso (#ef4444) = altri

**Colonna Destra (Sidebar)**:
- 📊 **I Tuoi Dati** (card - nascosto se non autenticato)
  - Territori conquistati
  - km percorsi
  - Livello attuale
  - m² conquistati

- ⚡ **Azioni Rapide** (card - nascosto se non autenticato)
  - Pulsante "+ Crea Clan"
  - Pulsante "🏆 Classifica"

- 🏆 **Badge** (card - nascosto se non autenticato)
  - Mostra i badge sbloccati
  - Hover = info del badge

### Sezione 2: Classifica Globale & Clan

**Classifica Globale** (griglia 1 colonna)
- Tab: "Giocatori" (default) / "Clan"
- Mostra top 10 per area conquistata
- Elemento: Rank # | Nome | Dettagli | Score

**Il Tuo Clan** (griglia 1 colonna - se in clan)
- Mostra info del clan dell'utente
- Opzioni: Visualizza membri, Gestisci, Esci

**Scopri Clan** (griglia 1 colonna)
- Elenco dei top clan
- Pulsante "Entra" per aderire

### Sezione 3: Legenda Mappa

- 3 colonne responsive
- Mostra significato dei colori sulla mappa

---

## 🎭 Modali

### 🔓 Login Modal
**Trigger**: Pulsante "Accedi"

**Campi**:
- Username
- Password
- Pulsante "Accedi"
- Link "Registrati" (switch a register modal)

**Validazione**:
- Entrambi i campi obbligatori
- Errori mostrati inline

---

### ✨ Register Modal
**Trigger**: Pulsante "Registrati"

**Campi**:
- Username (3-20 caratteri, alphanumerico + - _)
- Email (formato email valido)
- Password (con requisiti visualizzati)
  - 8+ caratteri
  - Maiuscola
  - Minuscola
  - Numero
  - Carattere speciale
- Conferma Password
- Pulsante "Registrati"
- Link "Accedi" (switch a login modal)

**Validazione Real-time**:
- Password requirements sono aggiornati mentre digiti
- Checkmark per requisiti soddisfatti
- Errori inline se password non combaciano

---

### ⚔️ Crea Clan Modal
**Trigger**: Pulsante "+ Crea Clan" (solo se autenticato)

**Campi**:
- Nome Clan (3-50 caratteri)
- Descrizione Clan (textarea)
- Pulsante "Crea Clan"

**Validazione**:
- Nome non può essere duplicato
- Entrambi i campi obbligatori
- Successo: Clan creato, modal chiuso, lista aggiornata

---

### 🏆 Classifica Modale
**Trigger**: Pulsante "🏆 Classifica"

**Contenuto**:
- Tab: "🎮 Giocatori" (default) / "⚔️ Clan"
- Mostra top 100 per categoria

**Elemento Leaderboard**:
```
#RANK | Avatar/Icona | Nome | Dettagli | Score
```

---

## 🎨 Tema & Colori

### Palette
- **Primary**: #667eea (Blu)
- **Primary Light**: #8a9ff5
- **Secondary**: #764ba2 (Viola)
- **Accent**: #f093fb (Rosa)
- **Background Dark**: #0a0e27
- **Background Card**: #1a1f3a
- **Text Primary**: #ffffff
- **Text Secondary**: #b0b9d4
- **Text Muted**: #7a8495
- **Success**: #10b981 (Verde)
- **Danger**: #ef4444 (Rosso)

### Effetti
- Gradient buttons con hover animation
- Cards con border glow on hover
- Backdrop blur su modali
- Smooth scrollbar con colore primary

---

## ⌨️ Interazioni

### Click Events
- **Tab Switching**: Cambia contenuto senza reload
- **Modal Open/Close**: Smooth animations
- **Clan Join**: Ricarica lista clan
- **Leaderboard Switch**: Carica dati nuovi se non già caricati
- **Logout**: Pulisce tutto e torna a stato anonimo

### Form Events
- **Real-time Validation**: Errori mostrati mentre digiti
- **Submit Disabled**: Durante il caricamento
- **Loader**: Animazione di caricamento
- **Success Message**: Verde per 2 secondi, poi close modal

---

## 📱 Responsive Design

### Desktop (1024px+)
- Layout a 2 colonne (mappa + sidebar)
- Stats grid 2x2
- Tab leaderboard inline

### Tablet (768px - 1023px)
- Layout singola colonna
- Mappa full width
- Sidebar sotto mappa
- Stats grid 1x4 o 2x2
- Modali adattati

### Mobile (<768px)
- Header verticale
- Tutto full width
- Stats grid 1 colonna
- Font ridotto proporzionalmente
- Leaderboard scrollabile

---

## 🐛 Gestione Errori

### Error Messages (Rosso)
```
❌ Username non trovato
❌ Password errata
❌ Email già registrata
❌ Errore di connessione
```

### Success Messages (Verde)
```
✅ Login avvenuto con successo!
✅ Registrazione completa!
✅ Clan creato con successo!
✅ Hai aderito al clan!
```

### Loading States
- Loader: Animazione rotante
- Button disabilitato durante request
- Spinner visualizzato

---

## 🔄 State Management

### Global State (app.js)
```javascript
appState = {
  currentUser: { id, username, email, level, ... }
  authToken: "jwt-token-here"
}
```

### State Observers
```javascript
appState.subscribe(state => {
  // Reagisce a cambiamenti
  updateAuthHeader();
  updateUIForUser();
})
```

### LocalStorage
- `authToken`: Persiste logout
- `currentUser`: Info utente

---

## 📊 Data Loading

### On Page Load
1. Carica mappa
2. Carica territori
3. Carica classifica giocatori
4. Carica lista clan
5. Controlla autenticazione
6. Se autenticato: Carica stats personali

### On User Login
1. Aggiorna header
2. Mostra cards utente
3. Ricarica statistiche
4. Ricarica lista clan
5. Ricarica mappa

### On Tab Switch
1. Se dati non già caricati: Fetch
2. Disegna UI
3. Salva flag "loaded"

---

## 🚀 Ottimizzazioni

- **Lazy Loading**: Classifica clan carica solo quando tab selezionato
- **Debouncing**: Validazione password con delay minimo
- **Memoization**: Classifica non ricarica se già caricata
- **Cache**: LocalStorage per sessione

---

## 🎯 Checklist Funzionalità

- ✅ Login/Logout
- ✅ Registrazione con validazione
- ✅ Mappa interattiva con territori
- ✅ Statistiche utente
- ✅ Classifica globale giocatori
- ✅ Classifica globale clan
- ✅ Creazione clan
- ✅ Adesione clan
- ✅ Badge system
- ✅ Responsive design
- ✅ Dark theme premium
- ✅ Gestione errori
- ✅ Loading states
- ✅ Token persistence

---

## 🔗 File Chiave

- **app.js**: State management + tutte le funzioni
- **index.html**: Struttura HTML e modali
- **styles.css**: Styling completo con theme variables
- **styles.css**: Responsive breakpoints (768px, 1024px, 480px)

---

**Ultima revisione**: Novembre 2024
**Tema**: Dark Premium
**Versione**: 2.0 (Bug-free)
