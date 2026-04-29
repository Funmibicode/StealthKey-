# 🔐 StealthKey — Hacker-Themed Password Manager

A secure, browser-based password manager built with vanilla JavaScript, Supabase, and the Web Crypto API. StealthKey lets users store, manage, and retrieve passwords with real AES-GCM encryption — wrapped in a dark, hacker aesthetic.

![Live](https://img.shields.io/badge/Live-Deployed-00ff9d?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![WebCrypto](https://img.shields.io/badge/Web_Crypto_API-000000?style=for-the-badge&logo=shield&logoColor=white)

---

## 🌐 Live Demo

👉 [stealth-key.vercel.app](https://stealth-key.vercel.app)

---

## 📌 About the Project

StealthKey was built to go beyond typical frontend projects. It combines real authentication, client-side encryption, and persistent cloud storage — making it a full-stack capable project using only vanilla JavaScript on the frontend.

---

## ✨ Features

- 🔑 **User Authentication** — Email/password register & login via Supabase Auth
- 🟢 **Google OAuth** — One-click sign-in with Google
- 🔒 **AES-GCM Encryption** — Passwords encrypted in the browser before being stored
- ☁️ **Cloud Storage** — Encrypted entries synced with Supabase database
- 🔐 **Session Management** — Auto-lock vault on inactivity, persistent login state
- 💀 **Hacker UI** — Dark theme with terminal-style aesthetics

---

## 🛠️ Built With

- **HTML5 / CSS3** — Structure and dark hacker-themed styling
- **Vanilla JavaScript** — All logic, DOM handling, and crypto operations
- **Supabase** — Authentication (email + Google OAuth) and database
- **Web Crypto API** — Native browser AES-GCM encryption/decryption

---

## 🔐 How Encryption Works

1. A master key is derived from the user's credentials using the Web Crypto API
2. Each password entry is encrypted with **AES-GCM** before leaving the browser
3. Only the encrypted ciphertext is stored in Supabase — never plaintext
4. Decryption only happens client-side, on the user's device

---

## 📁 Project Structure

```
stealthkey/
├── index.html        # Auth screen (login/register)
├── app.html          # Main vault UI
├── style.css         # Hacker-themed styles
├── app.js            # Core logic — auth, encryption, CRUD
└── supabase.js       # Supabase client config
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/Funmibicode/StealthKey-.git
cd StealthKey-
# Add your Supabase URL and anon key to supabase.js
# Open index.html in your browser
```

> ⚠️ You'll need a Supabase project with Auth enabled (email + Google OAuth) and a `passwords` table in your database.

---

## 🗄️ Supabase Table Schema

```sql
create table passwords (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  site text,
  username text,
  encrypted_password text,
  iv text,
  created_at timestamp default now()
);
```

---

## 👤 Author

**Funmibi** — [Funmibitech](https://funmibitech.netlify.app)
