import { NextRequest, NextResponse } from "next/server";
//import { db, q } from "../../db";
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import Config from '../../config'
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import path from 'path';
import { promises as fs } from 'fs';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
const {
  DATABASE_URL,
  SESSION_SECRET,
  PORT = 3000,
  //RP_ID = 'localhost',
  //RP_NAME = 'Passkey Demo',
  ORIGIN = 'http://localhost:3000',
  PLATFORM_ONLY = 'true',
  NODE_ENV,
} = process.env;

//const isProd = NODE_ENV === 'production';
const USERNAME_RE = /^[a-z0-9_.-]{3,32}$/;
const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';

// ---------- DB ----------
const pool = new pg.Pool({ connectionString: DATABASE_URL });
//const filePath = path.join(process.cwd(), Config.SESSION_DIR , `schema.sql`);
const filePath = path.join(process.cwd(), `schema.sql`);
const schemaData = await fs.readFile(filePath, 'utf8');
await pool.query(schemaData);

export async function POST(req: NextRequest) {

    try {
        // POST JSON 取得
        const body = await req.json();
        console.log(body);
        const name = body.name;
        console.log(name);
        const username = body.username;
        let userId = body.userId;
        if (!/^[\w.@-]{3,64}$/.test(username)) {
          return NextResponse.json({
              ret: -1,
              message: 'error, username は 3〜64 文字です',
              data:body
          });            
        }
        if(!userId){
          return NextResponse.json({
              ret: -1,
              message: 'error, userId = NONE',
              data:body
          });            
        }
        const { rows } = await pool.query('select id from passkey_users where username = $1', [username]);
        const existing = rows[0];
        console.log(existing)
        //@ts-ignore
        let excludeCredentials = [];
        if (existing) {
          // 既存ユーザーへの追加は本人（ログイン済み）のみ。未ログインでの乗っ取りを防ぐ
          if (userId !== existing.id) {
            return Response.json({
              success: false,
              message: 'error, このユーザー名は使用できません。',
              data: body,
            })            
          }
          userId = existing.id;
          const creds = await pool.query('select id, transports from credentials where user_id = $1', [userId]);
          excludeCredentials = creds.rows.map((c) => ({ id: c.id, transports: c.transports ?? undefined }));
        } else {
          userId = crypto.randomUUID();
        }
        console.log("userId=", userId)

        const options = await generateRegistrationOptions({
          rpName: RP_NAME,
          rpID: RP_ID,
          userName: username,
          userID: new TextEncoder().encode(userId),
          attestationType: 'none',
          //@ts-ignore
          excludeCredentials,
          authenticatorSelection: {
            residentKey: 'required', // Passkey (discoverable credential)
            userVerification: 'required', // Windows Hello の PIN/顔/指紋 を必須に
            ...(PLATFORM_ONLY === 'true' && { authenticatorAttachment: 'platform' }),
          },
        });    
        console.log("#options")    
        console.log(options)

        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${body.userId}.json`);

        try {
          const sessionData = { challenge: options.challenge, userId, username, isNew: !existing }     
          await fs.writeFile(filePath, JSON.stringify(sessionData, null, 2), 'utf-8');
          console.log('ファイルを正常に書き込みました');
        } catch (error) {
          console.error('ファイル書き込みエラー:', error);
          return Response.json({
            success: false,
            message: 'error, login Json file write NG',
            data: body,
          })          
        } 

        // レスポンス
        return NextResponse.json({
            ret: 0,
            message: "OK",
            data: options
        });
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {
                ret: -1,
                message: "ERROR"
            },
            { status: 400 }
        );
    }
}