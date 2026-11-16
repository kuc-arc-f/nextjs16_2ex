import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../db";
import bcrypt from 'bcryptjs';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

const DUMMY_HASH = bcrypt.hashSync('dummy-password', 12); // ユーザー存在判定のタイミング差を減らす

export async function POST(req: NextRequest) {

    try {
        // POST JSON 取得
        const body = await req.json();

        console.log(body);
        const name = body.name;
        const email = body.username;

        console.log(name);
        console.log(email);
        //const username = body.username;
        const password = body.password;
        if (typeof email !== 'string' || email.length < 3 || email.length > 64) {
            return NextResponse.json({
                ret: -1,
                message: "email は 3〜64 文字です",
                data:body
            });           
        }

        if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
            return NextResponse.json({
                ret: -1,
                message: "password は 6〜64 文字です",
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
        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${user.id}.json`);
        console.log("filePath=", filePath)
        try {
          const userData = {
            pending: { userId: user.id }
          };            
          await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf-8');
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