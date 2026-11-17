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
        console.log(body)
        const userId = body.userId;
        if(!userId){
          console.log("error, email = NONE")
            return NextResponse.json({
                ret: -1,
                message: 'error, email = NONE',
                data: body
            });
        }       
        const { rows } = await pool.query(
          'SELECT email, totp_enabled FROM users WHERE id = $1',
            [userId]
        );
        const user = rows[0]          
        // レスポンス
        return NextResponse.json({
            ret: 0,
            message: "OK",
            data: user
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