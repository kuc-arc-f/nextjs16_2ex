import { NextRequest, NextResponse } from "next/server";
import { db } from "../../db";
import bcrypt from 'bcryptjs';
//import Config from '../../config'
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
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        console.log(user);
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