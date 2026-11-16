import { NextRequest, NextResponse } from "next/server";
//import { db } from "../../db";
import { db, q } from "../../db";
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';

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
        const existing = q.userByName.get(username);
        console.log(existing)
        //@ts-ignore
        let excludeCredentials = [];
        if (existing) {
          // 既存ユーザーへの Passkey 追加は、そのユーザーでログイン済みの場合のみ許可
          //@ts-ignore
          if (userId !== existing.id){
            //@ts-ignore
            return Response.json({
              success: false,
              message: 'error, このユーザー名は使用されています',
              data: body,
            })
          }
          //@ts-ignore
          userId = existing.id;
          //@ts-ignore
          excludeCredentials = q.credsByUser.all(userId).map((c) => ({
            //@ts-ignore
            id: c.id,
            //@ts-ignore
            transports: c.transports ? JSON.parse(c.transports) : undefined,
          }));
        } else {
          userId = crypto.randomBytes(32).toString('base64url');
        }
        const options = await generateRegistrationOptions({
          rpName: RP_NAME,
          rpID: RP_ID,
          userName: username,
          userID: Buffer.from(userId, 'base64url'),
          attestationType: 'none',
          //@ts-ignore
          excludeCredentials,
          authenticatorSelection: {
            residentKey: 'required',        // 探索可能な Passkey (ユーザー名入力なしログイン用)
            userVerification: 'required',   // Windows Hello (PIN/顔/指紋) を必須化
          },
        });
        console.log("#options");
        console.log(options);
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