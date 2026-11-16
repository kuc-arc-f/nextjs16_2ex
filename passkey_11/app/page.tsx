"use client";
import React, { useState , useEffect } from 'react';
import Image from "next/image";
import Config from "./config"
import LibAuth from "./lib/LibAuth"

export default function Home() {
  useEffect(() => {
    LibAuth.isValidLogin();
  }, []);

  //@ts-ignore
  const apiHandle = async function(path, body){
    console.log("#apiHandle")
    console.log(body)
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.log(data)
      throw new Error(data.error || 'エラー');
    }
    return data;    
  }

  const logout = async() => {
//    console.log("#enable");
    try{
      const resp  = await apiHandle('/api/delete_cookie', 
        {}
      );
      console.log(resp);
      if(resp.ret < 0){
        alert("error")
      }else{
        location.href = "/login";
      }         
    }catch(e){  console.log(e)}
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div>
          <button onClick={()=>{logout();}} 
          className="w-full my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
          >Logout</button><br />
        </div>


        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            home
          </h1>
        </div>
      </main>
    </div>
  );
}
