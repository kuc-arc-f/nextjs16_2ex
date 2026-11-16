import { NextRequest, NextResponse } from "next/server";
import { db } from "../../db";
import bcrypt from 'bcryptjs';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

export async function POST(req: NextRequest) {

    try {
        // POST JSON 取得
        const body = await req.json();

        console.log(body);
        const name = body.name;
        const email = body.email;

        console.log(name);
        console.log(email);
        const username = body.username;
        const password = body.password;
        if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
            return NextResponse.json({
                ret: -1,
                message: "username は 6〜64 文字です",
                data:body
            });           
        }
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if(!user){
        return NextResponse.json({
            ret: -1,
            message: 'error, user NONE',
            data:body
        });           
        }     
        //@ts-ignore
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!user || !ok) {
          return NextResponse.json({
              ret: -1,
              message: 'error, ID , password NG',
              data:body
          });           
        }
        //@ts-ignore
        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${user.id}.json`);
        console.log("filePath=", filePath)
        try {
          //@ts-ignore
          const userData = {
            //@ts-ignore
            pending: { userId: user.id }
          };            
          await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf-8');
          console.log('ファイルを正常に書き込みました');
        } catch (error) {
          console.error('ファイル書き込みエラー:', error);
            return NextResponse.json({
                ret: -1,
                message: 'error, ファイル書き込みエラー:',
                data:body
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