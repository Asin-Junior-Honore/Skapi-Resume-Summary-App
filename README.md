# Skapi-Resume-Summary-App

### No Backend Needed: Build a Résumé Summary App with Just HTML + Skapi

Tired of setting up servers, APIs, and databases just to test an idea?

With **[Skapi](https://www.skapi.com/)**, you don’t need any backend setup — it’s a fully serverless backend API service for frontend developers. Think Firebase, but even simpler: **no configurations, no deployments, just straight-to-the-point APIs that work out of the box**.

This project shows how to build a **Résumé Summary App** using **plain HTML + JavaScript**.
Users can:

* Authenticate with Google
* Generate résumé summaries
* (Coming next) Save summaries securely in Skapi records and fetch them per user

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Asin-Junior-Honore/Skapi-Resume-Summary-App.git
cd Skapi-Resume-Summary-App
```

---

### 2. Get Your API Keys

You’ll need credentials from **Skapi**, **Google OAuth**, and **Gemini AI**.

#### 🔑 Skapi (Service + Owner ID)

1. Go to the **[Skapi Dashboard](https://www.skapi.com/)**
2. Create a new service
3. Copy your:

   * `service_id`
   * `owner_id`

📖 More help: [Skapi Docs](https://docs.skapi.com/)

#### 🌐 Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new OAuth 2.0 Client ID (Web Application)
3. Add your **redirect URL** (see below)
4. Copy your `client_id`

#### 🤖 Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Generate a new Gemini API key
3. Copy it

---

### 3. Update Credentials in `app.js`

Open **`app.js`** and replace placeholders with your keys:

```javascript
const SERVICE = "your-service-id";        // From Skapi Dashboard
const OWNER = "your-owner-id";            // From Skapi Dashboard
const GOOGLE_CLIENT_ID = "your-google-client-id";
const CLIENT_SECRET_NAME = "ggltoken";    // Name you'll use in Skapi Dashboard
const OPENID_LOGGER_ID = "google";

// ⚠️ Update this if you use a different local server port!
const REDIRECT_URL = window.location.origin + window.location.pathname;

const GEMINI_API_KEY = "your-gemini-api-key";
```

---

### 4. Run the App Locally

Simply open **`index.html`** in your browser.
Or, if you’re running a local dev server (like VS Code Live Server, Vite, or similar), make sure your **redirect URL matches** the one set in Google Cloud.

Example redirect if running on port 5500:

```
http://localhost:5500/index.html
```
