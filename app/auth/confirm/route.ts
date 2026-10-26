import { NextResponse } from 'next/server';
import { createSessionClient } from '../../../lib/supabase';
import { getConfig } from '../../../lib/config';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const origin=getConfig().origin,params=new URL(request.url).searchParams,token=params.get('token_hash'),type=params.get('type');
 if(token&&token.length<=2048&&['email','signup','recovery'].includes(type||'')){
  try{const client=await createSessionClient();const {error}=await client.auth.verifyOtp({token_hash:token,type:type as 'email'|'signup'|'recovery'});if(!error)return NextResponse.redirect(new URL(type==='recovery'?'/recuperar':'/',origin),{status:303,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});}catch{}
 }
 return NextResponse.redirect(new URL('/entrar?erro=link',origin),{status:303,headers:{'Cache-Control':'no-store'}});
}
