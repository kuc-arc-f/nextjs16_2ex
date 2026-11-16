import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../db";
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {

    try {
        // POST JSON 取得
        const body = await req.json();

        console.log(body);
        const name = body.name;
        const email = body.username;

        console.log(name);
        console.log(email);
        const username = body.username;
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
                message: "username は 6〜64 文字です",
                data:body
            });           
        }
        const hash = await bcrypt.hash(password, 12);
        await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)',
            [email.toLowerCase(), hash]
        );

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