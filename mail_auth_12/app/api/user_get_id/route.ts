import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../db";
import bcrypt from 'bcryptjs';
import path from 'path';
import { promises as fs } from 'fs';

export async function POST(req: NextRequest) {

    try {
        // POST JSON 取得
        const body = await req.json();
        console.log(body)
        //const userId = body.userId;
        const username = body.username;
        const email = body.username;
        if(!username){
          console.log("error, email = NONE")
            return NextResponse.json({
                ret: -1,
                message: "",
                data: body
            });
        }   
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log(rows[0]);
//        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
//console.log(user);          
        //const name = body.name;
        //const email = body.email;
        //console.log(name);
        //console.log(email);
        // レスポンス
        return NextResponse.json({
            ret: 0,
            message: "OK",
            data: rows[0]
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