"use client";
import Image from "next/image";

export default function Home() {

  const test = async function(){
    const response = await fetch("/api/test", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "TEST",
            email: "test@example.com"
        })
    });

    const result = await response.json();
    console.log(result)    
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-lg font-bold">Test</h1>
        <hr />
        <p>about text</p>
        <hr />
        <button
        onClick={()=>{test()}}
        >Test</button>

      </main>
    </div>
  );
}
