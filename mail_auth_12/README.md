# mail_auth_12

 Version: 0.9.1

 Author  :

 date    : 2026/11/16

 update  :

***
### Summary

Next.js 16 , mail Authrize 2FA PostgreSQL

* PostgreSQL DB
* mail auth
* node22
* Linux

***
* .env
```
# .env にコピーして使用してください
DATABASE_URL=postgres://root:admin@localhost:5432/mydb
# 32バイト(hex 64文字): node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TOTP_ENC_KEY=
TOTP_ISSUER=DemoApp
PORT=3000
# NODE_ENV=production   (HTTPS 配下で secure cookie を有効化)
NODE_ENV=development
# --- SMTP ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-name
SMTP_PASS=your-pass
MAIL_FROM="MyApp <no-reply@example.com>"
# --- OTP / セッション設定 ---
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SEC=60
SESSION_TTL_DAYS=7

```
***
* start
```
npm install
npm run dev                # http://localhost:3000
```
***
### Blog:


***

