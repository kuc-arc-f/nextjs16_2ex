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

          const v = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: json1.challenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: true,
          });
          if (!v.verified){
            return NextResponse.json({
                ret: -1,
                message: "error, 検証に失敗しました",
                data: body
            });
          } 
          const { credential, credentialDeviceType, credentialBackedUp } = v.registrationInfo;
          db.transaction(() => {
            if (json1.isNew) q.insertUser.run(json1.userId, json1.username);
            q.insertCred.run({
              id: credential.id,
              user_id: json1.userId,
              public_key: Buffer.from(credential.publicKey),
              counter: credential.counter,
              transports: JSON.stringify(credential.transports || []),
              device_type: credentialDeviceType,
              backed_up: credentialBackedUp ? 1 : 0,
            });
          })();
        } catch (err) {
          console.error('エラーが発生しました:', err);
            return NextResponse.json({
                ret: -1,
                message: err,
                data: body
            });
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