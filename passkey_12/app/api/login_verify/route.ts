import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
//import { db, q } from "../../db";
import Config from '../../config'
import crypto from 'node:crypto';
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
  PLATFORM_ONLY = 'true',
  NODE_ENV,
} = process.env;
const PORT = process.env.PORT || 3000;
const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || `http://localhost:${PORT}`;
const pool = new pg.Pool({ connectionString: DATABASE_URL });

export async function POST(req: NextRequest) {

    try {
        // POST JSON 取得
        const body = await req.json();
        console.log(body);
        //console.log(name);
        const username = body.username;
        const password = body.password;
        let expectedChallenge = null;
        let rowData = null
        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${body.userId}.json`);
        try {
          const sessionData = await fs.readFile(filePath, 'utf8');
          const json1 = JSON.parse(sessionData)
          console.log(json1);
          expectedChallenge = json1.authChallenge;
          console.log("expectedChallenge=", expectedChallenge);
          if (!expectedChallenge) {
            return NextResponse.json(
                {
                    ret: -1,
                    message: "ERROR session none , authChallenge"
                },
                { status: 400 }
            );            
          }
          const { rows } = await pool.query(
            `select c.id, c.user_id, c.public_key, c.counter, c.transports, u.username
              from credentials c join passkey_users u on u.id = c.user_id
              where c.id = $1`,
            [body.id],
          );
          const row = rows[0];
          rowData = row
          console.log("#row");
          console.log(row);          
          if (!row) {
            return NextResponse.json(
                {
                    ret: -1,
                    message: "error, 登録されていない Passkey です。"
                },
                { status: 400 }
            );                      
          }
        } catch (error) {
            console.error(error);
            return NextResponse.json(
                {
                    ret: -1,
                    message: body
                },
                { status: 400 }
            );            
        }       
        let verification;
        try{   
          verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: true,
            credential: {
              id: rowData.id,
              publicKey: new Uint8Array(rowData.public_key),
              counter: Number(rowData.counter),
              transports: rowData.transports ?? undefined,
            },
          }); 
        } catch (err) {
           console.error(err);
           return NextResponse.json(
                {
                    ret: -1,
                    message: '認証に失敗しました。'
                },
                { status: 400 }
            );                       
        }        
        
        // レスポンス
        return NextResponse.json({
            ret: 0,
            message: "OK",
            data: body
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