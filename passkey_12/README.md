# passkey_12

 Version: 0.9.1

 Author  :

 date    : 2026/11/15

 update  :

***
### Summary

Next.js 16 , Passkey Authrize 2FA PostgreSQL 

* windows11 , Windows hello
* PostgreSQL DB
* node22
* Linux

***
* Table: ./schema.sql

***
* .env
```
DATABASE_URL=postgres://root:admin@localhost:5432/mydb
PORT=3000
#NODE_ENV=production   (HTTPS 配下で secure cookie を有効化)
# WebAuthn (Passkey) 設定
# RP_ID はドメイン名のみ（ポート・スキームなし）。ローカル開発は localhost
RP_ID=localhost
RP_NAME=DemoApp
# ブラウザで開くURLと完全一致させる（スキーム + ホスト + ポート）
ORIGIN=http://localhost:3000
# true: この端末の認証器（Windows Hello / Touch ID など）のみ
# false: スマホ(QR)やセキュリティキーも許可
PLATFORM_ONLY=true
```

***
* start
```
npm install
npm run dev                # http://localhost:3000
```
***
### Blog:

https://zenn.dev/knaka0209/scraps/f7a9a208b935c7

***

