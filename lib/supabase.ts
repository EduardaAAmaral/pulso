import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getConfig } from './config';
// Used only in Route Handlers: session refreshes can write cookies there.
export async function createSessionClient(){
 const config=getConfig(),jar=await cookies();
 return createServerClient(config.supabaseUrl,config.supabaseKey,{
  cookieOptions:{httpOnly:true,sameSite:'lax',secure:config.secure,path:'/'},
  cookies:{getAll(){return jar.getAll();},setAll(items){for(const {name,value,options}of items)jar.set(name,value,{...options,httpOnly:true,sameSite:'lax',secure:config.secure,path:'/'});}},
 });
}
