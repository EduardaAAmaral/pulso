export class ConfigurationError extends Error{}
export function getConfig(){
 const app=process.env.APP_URL,url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!app||!url||!key||url.includes('SEU-PROJETO')||key.includes('SUBSTITUA'))throw new ConfigurationError('Login e banco ainda não foram configurados.');
 const origin=new URL(app),supabase=new URL(url);
 if(origin.origin!==app.replace(/\/$/,''))throw new ConfigurationError('APP_URL deve conter somente a origem do site.');
 const local=['localhost','127.0.0.1','[::1]'].includes(origin.hostname);
 if(origin.protocol!=='https:'&&!local)throw new ConfigurationError('Use HTTPS no endereço público.');
 if(supabase.protocol!=='https:'&&!['localhost','127.0.0.1','[::1]'].includes(supabase.hostname))throw new ConfigurationError('Endereço do banco inválido.');
 if(key.startsWith('sb_secret_'))throw new ConfigurationError('Configure a chave publicável, nunca uma chave secret.');
 return {origin:origin.origin,supabaseUrl:url,supabaseKey:key,secure:origin.protocol==='https:'};
}
