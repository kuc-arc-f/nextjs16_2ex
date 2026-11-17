import { NextRequest, NextResponse } from "next/server";
//import { db } from "../../db";
import { pool } from "../../db";
import bcrypt from 'bcryptjs';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

//@ts-ignore
const regenerate = (req) => new Promise((resolve, reject) => req.session.regenerate((e) => (e ? reject(e) : resolve())));
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 12); // ユーザー存在判定のタイミング差を減らす

export async function POST(req: NextRequest) {

    try {
        // POST JSON 取得
        const body = await req.json();

        console.log(body);
        const name = body.name;
        //const email = body.email;
        console.log(name);
        const email = body.username;
        const username = body.username;
        const password = body.password;
        if (typeof email !== 'string' || email.length < 3 || email.length > 64) {
            return NextResponse.json({
                ret: -1,
                message: 'email は 3〜64 文字です',
                data:body
            });           
        }

        if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
            return NextResponse.json({
                ret: -1,
                message: "username は 6〜64 文字です",
                data:body
            });           
        }
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1', 
            [String(email || '').toLowerCase()]
          );
        const user = rows[0];
        const ok = await bcrypt.compare(String(password || ''), user ? user.password_hash : DUMMY_HASH);
        if (!user || !ok) {
          return Response.json({
            success: false,
            message: 'メールアドレスまたはパスワードが違います',
            data: body,
          })
        }
/*
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if(!user){
        return NextResponse.json({
            ret: -1,
            message: 'error, user NONE',
            data:body
        });           
        }     
*/
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