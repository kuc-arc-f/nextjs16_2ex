import { NextRequest, NextResponse } from "next/server";
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
  let allowCredentials
    try {
        // POST JSON 取得
        const body = await req.json();
        console.log(body);
        const name = body.name;
        console.log(name);
        const username = body.username;
        let userId = body.userId;
        const options = await generateAuthenticationOptions({
          rpID: RP_ID,
          userVerification: 'required',
          allowCredentials,
        });
        console.log("#options")
        console.log(options)
        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${body.userId}.json`);

        try {
          const sessionData = await fs.readFile(filePath, 'utf8');
          const json1 = JSON.parse(sessionData)
          console.log(json1);
          json1.authChallenge = options.challenge;
          await fs.writeFile(filePath, JSON.stringify(json1, null, 2), 'utf-8');
          console.log('ファイルを正常に書き込みました');
        } catch (error) {
          console.error('ファイル書き込みエラー:', error);
          return Response.json({
            success: false,
            message: 'error, login Json file write NG',
            data: body,
          })          
        }  
        return Response.json({
          success: true,
          message: 'LOGIN OK',
          data: options,
        })

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