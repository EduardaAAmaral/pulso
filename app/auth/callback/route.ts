import { NextResponse } from 'next/server';
import { createSessionClient } from '../../../lib/supabase';
import { getConfig } from '../../../lib/config';
import {safeCallbackDestination} from '../../../lib/auth-validation';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const origin=getConfig().origin,params=new URL(request.url).searchParams,code=params.get('code');
 if(code&&code.length<=4096){try{const client=await createSessionClient();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(safeCallbackDestination(params.get('next')),origin),{status:303,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});}catch{}}
 return NextResponse.redirect(new URL('/entrar?erro=link',origin),{status:303,headers:{'Cache-Control':'no-store'}});
}
