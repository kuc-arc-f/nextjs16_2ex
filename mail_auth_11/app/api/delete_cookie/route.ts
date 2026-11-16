import { NextRequest, NextResponse } from "next/server";
import Config from "../../config"
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        // POST JSON 取得
        const body = await req.json();
        const cookieStore = await cookies();

        // 指定Cookieを削除
        cookieStore.delete(Config.COOKIE_AUTH_1_KEY);
        cookieStore.delete(Config.COOKIE_AUTH_2_KEY);
        // レスポンス
        return NextResponse.json({
            ret: 0,
            message: "OK",
            data: {}
        });
    } catch (error) {

        return NextResponse.json(
            {
                ret: -1,
                message: "ERROR"
            },
            { status: 400 }
        );
    }
}