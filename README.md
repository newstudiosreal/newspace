# NeW Space 🚀

Social media per post brevi, trend e contenuti virali in tempo reale.

## Stack Tecnologico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Backend & DB**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Deploy**: Vercel + GitHub

---

## Setup Rapido

### 1. Clona il repository

```bash
git clone https://github.com/tuo-username/newspace.git
cd newspace
npm install
```

### 2. Configura Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
2. Vai su **SQL Editor** nel dashboard
3. Copia e incolla tutto il contenuto di `supabase/migrations/001_initial_schema.sql`
4. Eseguilo

### 3. Variabili d'ambiente

Crea un file `.env.local` nella root del progetto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hzwxmtbocgmiwdnrtoji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Trovi queste chiavi nel dashboard Supabase → **Settings → API**.

### 4. Avvia il server

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

---

## Deploy su Vercel

### Via GitHub (consigliato)

1. Crea un repository su GitHub e fai push del codice:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - NeW Space"
   git remote add origin https://github.com/tuo-username/newspace.git
   git push -u origin main
   ```

2. Vai su [vercel.com](https://vercel.com) → **New Project** → importa il repo GitHub

3. Nella sezione **Environment Variables** aggiungi:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → URL del tuo progetto Vercel (es. `https://newspace.vercel.app`)

4. Clicca **Deploy**! ✅

### Configurazione URL in Supabase

Dopo il deploy, vai su Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://newspace.vercel.app`
- **Redirect URLs**: `https://newspace.vercel.app/auth/callback`

---

## Struttura del Progetto

```
newspace/
├── src/
│   ├── app/
│   │   ├── (app)/              # Layout autenticato
│   │   │   ├── feed/           # Home feed (Per te / Seguiti)
│   │   │   ├── explore/        # Esplora e ricerca
│   │   │   ├── trending/       # Trend e hashtag
│   │   │   ├── messages/       # DM real-time
│   │   │   ├── notifications/  # Notifiche
│   │   │   ├── profile/[username]/
│   │   │   ├── post/[id]/
│   │   │   └── settings/
│   │   ├── auth/               # Login / Registrazione
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/             # Sidebar, RightPanel
│   │   ├── post/               # PostCard, ComposePost
│   │   └── ui/                 # FollowButton, ecc.
│   ├── lib/
│   │   ├── supabase/           # Client, Server, Middleware
│   │   └── utils.ts
│   ├── types/
│   │   └── database.ts         # Tipi TypeScript completi
│   └── middleware.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # ⭐ Schema SQL completo
├── .env.local.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Funzionalità

| Feature | Stato |
|--------|-------|
| Auth (login/registrazione) | ✅ |
| Feed algoritmico "Per te" | ✅ |
| Feed cronologico "Seguiti" | ✅ |
| Post (testo + media) | ✅ |
| Like / Repost / Commenti | ✅ |
| Hashtag automatici | ✅ |
| Profili utente | ✅ |
| Followers / Following | ✅ |
| DM real-time | ✅ |
| Notifiche | ✅ |
| Trending & Hashtag live | ✅ |
| Esplora / Ricerca | ✅ |
| Dark mode default | ✅ |
| Upload immagini/video | ✅ |
| Layout 3 colonne | ✅ |

---

## Schema Database

Il database PostgreSQL (Supabase) è composto da:

- **profiles** — Profili utente con contatori
- **posts** — Post con engagement score per l'algoritmo
- **likes** — Like con trigger automatici sui contatori
- **reposts** — Repost con trigger automatici
- **follows** — Sistema follower/following
- **hashtags** — Trending aggiornato in tempo reale
- **conversations** + **conversation_participants** — Chat DM
- **messages** — Messaggi real-time
- **notifications** — Notifiche automatiche

Tutti i contatori sono gestiti da **trigger PostgreSQL** per performance ottimali.
Row Level Security (RLS) attiva su tutte le tabelle.

---

## Variabili d'Ambiente

| Variabile | Descrizione |
|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave pubblica Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chiave privata (solo server) |
| `NEXT_PUBLIC_APP_URL` | URL dell'applicazione |

---

Made with ⚡ by NeW Space Team
