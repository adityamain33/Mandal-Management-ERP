# 🚀 MandalSetu ERP - 100% Free Hosting Guide (फ्री होस्टिंग गाइड)

MandalSetu ERP प्रोजेक्ट (React + Node.js + MySQL) को **100% फ्री** में होस्ट करने का सबसे आसान और बेस्ट तरीका:

| Component | Free Platform | Features |
|---|---|---|
| **Database (MySQL)** | [TiDB Cloud (Serverless)](https://tidbcloud.com) | 5 GB Free, Always On, MySQL 8.0 Compatible, No Credit Card |
| **Backend (Node.js API)** | [Render](https://render.com) | Free Web Service, HTTPS Included, Auto GitHub Deploy |
| **Frontend (React/Vite)** | [Vercel](https://vercel.com) | Fast Global CDN, Free HTTPS Domain, Auto GitHub Deploy |

---

## 📌 Step 1: Free MySQL Database बनाएं (TiDB Cloud)

1. [https://tidbcloud.com](https://tidbcloud.com) पर जाएं और **Sign Up with GitHub / Google** करें। (कोई क्रेडिट कार्ड नहीं चाहिए)।
2. **Create Cluster** पर क्लिक करके **TiDB Serverless (Free)** चुनें।
3. Cluster बनने के बाद **Connect** बटन दबाएं:
   - Choose connection method: **General**
   - **Password** जनरेट करें और कॉपी करके सुरक्षित रख लें।
   - आपको ये डिटेल्स मिलेंगी:
     - `Host`: (उदा. `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
     - `Port`: `4000`
     - `User`: (उदा. `xxxxxx.root`)
     - `Password`: आपका पासवर्ड
     - `Database`: `test` (या SQL console से `CREATE DATABASE mandalsetu_db;` बना लें)

---

## 📌 Step 2: Backend API को Render पर होस्ट करें

1. [https://render.com](https://render.com) पर जाएं और **Sign Up with GitHub** करें।
2. Dashboard पर **New +** > **Web Service** चुनें।
3. अपना GitHub Repo (`Mandal-Management-ERP`) सिलेक्ट करें।
4. निम्नलिखित सेटिंग्स भरें:
   - **Name**: `mandalsetu-backend`
   - **Region**: Singapore / Frankfurt (TiDB के पास का क्षेत्र)
   - **Root Directory**: `backend` *(⚠️ यह जरूर भरें)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**
5. नीचे **Environment Variables** सेक्शन में ये की (keys) जोड़ें:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DB_HOST` | TiDB का Host |
   | `DB_PORT` | `4000` |
   | `DB_USER` | TiDB का User |
   | `DB_PASSWORD` | TiDB का Password |
   | `DB_NAME` | `test` (या `mandalsetu_db`) |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | `mandalsetu_jwt_secret_key_2026_live` |
6. **Create Web Service** पर क्लिक करें।
7. Deploy पूरा होने पर आपको लाइव API URL मिलेगा, उदा:
   `https://mandalsetu-backend.onrender.com`

---

## 📌 Step 3: Frontend को Vercel पर होस्ट करें

1. [https://vercel.com](https://vercel.com) पर जाएं और GitHub से लॉगिन करें।
2. **Add New...** > **Project** पर क्लिक करें।
3. `Mandal-Management-ERP` रिपॉजिटरी को **Import** करें।
4. **Project Settings** में:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` *(Edit बटन दबाकर `frontend` चुनें)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables** सेक्शन में:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://mandalsetu-backend.onrender.com/api` *(Step 2 का Render URL + `/api`)* |
   | `VITE_BACKEND_URL` | `https://mandalsetu-backend.onrender.com` |
6. **Deploy** बटन पर क्लिक करें।
7. 1 मिनट में आपकी वेबसाइट लाइव हो जाएगी: `https://mandalsetu-frontend.vercel.app`!

---

## 📌 Step 4: डेटाबेस में शुरूआती डेटा (Seed) डालना (Optional)

डिफ़ॉल्ट एडमिन और टेस्ट डेटा भरने के लिए:
1. अपने लोकल कंप्यूटर में `backend/.env` फाइल में TiDB के क्रेडेंशियल्स डालें।
2. लोकल टर्मिनल में रन करें:
   ```bash
   npm run seed
   ```
3. अब आप इस लाइव एडमिन से लॉगिन कर सकते हैं:
   - **Email**: `admin@mandalsetu.com`
   - **Password**: `Password123`

---

## 💡 जरूरी बातें (Free Tier Tips):
- **Render Spin-down**: Render का फ्री बैकएंड 15 मिनट इनएक्टिव रहने पर स्लीप मोड में चला जाता है। जब कोई वेबसाइट खोलेगा तो पहली रिक्वेस्ट में 30-40 सेकंड लग सकते हैं। इसे हमेशा एक्टिव रखने के लिए आप [cron-job.org](https://cron-job.org) या [UptimeRobot](https://uptimerobot.com) पर हर 10 मिनट का फ्री पिंग लगा सकते हैं।
- **SPA Routing**: हमने `frontend/vercel.json` और `_redirects` पहले से जोड़ दिए हैं ताकि पेज रीफ्रेश करने पर 404 एरर न आए।
