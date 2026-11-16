import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    try {
        // POST JSON 取得
        const body = await req.json();

        console.log(body);
        const name = body.name;
        const email = body.email;

        console.log(name);
        console.log(email);

        // レスポンス
        return NextResponse.json({
            ret: 0,
            message: "OK",
            data: {
                name: name,
                email: email
            }
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