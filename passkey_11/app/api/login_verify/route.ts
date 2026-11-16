import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import { db, q } from "../../db";
import Config from '../../config'
import crypto from 'node:crypto';
import path from 'path';
import { promises as fs } from 'fs';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const PORT = process.env.PORT || 3000;
const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || `http://localhost:${PORT}`;

export async function POST(req: NextRequest) {

    try {
        // POST JSON 取得
        const body = await req.json();

        console.log(body);
        const name = body.name;

        console.log(name);
        const username = body.username;
        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${body.userId}.json`);
        try {
          const sessionData = await fs.readFile(filePath, 'utf8');
          const json1 = JSON.parse(sessionData)
          console.log(json1);
          const challenge = json1.authChallenge;
          if (!challenge) {
            return NextResponse.json(
                {
                    ret: -1,
                    message: "ERROR session none , authChallenge"
                },
                { status: 400 }
            );            
          }
          const cred = q.credById.get(body.id);
          if (!cred){
            return NextResponse.json(
                {
                    ret: -1,
                    message: "ERROR 未登録のパスキーです"
                },
                { status: 400 }
            );            
          } 
          const v = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge: challenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: true,
            credential: {
              //@ts-ignore
              id: cred.id,
              //@ts-ignore
              publicKey: new Uint8Array(cred.public_key),
              //@ts-ignore
              counter: cred.counter,
              //@ts-ignore
              transports: cred.transports ? JSON.parse(cred.transports) : undefined,
            },
          });
          if (!v.verified) {
            return NextResponse.json(
                {
                    ret: -1,
                    message: "ERROR 認証に失敗しました"
                },
                { status: 400 }
            );            
          } 
          //@ts-ignore
          q.updateCounter.run(v.authenticationInfo.newCounter, cred.id);

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