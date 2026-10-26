export class ConfigurationError extends Error {
 code:string;
 constructor(message:string,code='CONFIG_INVALID'){super(message);this.code=code;}
}
function address(value:string,name:string){
 let parsed:URL;try{parsed=new URL(value);}catch{throw new ConfigurationError(`A variável ${name} não contém uma URL válida. Copie somente o endereço completo.`,'CONFIG_URL_INVALID');}
 const local=['localhost','127.0.0.1','[::1]'].includes(parsed.hostname);
 if(parsed.username||parsed.password||parsed.search||parsed.hash||parsed.pathname!=='/'||(!local&&parsed.protocol!=='https:')||(local&&!['http:','https:'].includes(parsed.protocol)))throw new ConfigurationError(`A variável ${name} deve conter somente a origem do site, sem caminhos, com HTTPS em produção.`,'CONFIG_URL_INVALID');
 return parsed;
}
export function getConfig(){
 const app=process.env.APP_URL?.trim(),url=process.env.SUPABASE_URL?.trim(),key=process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
 for(const [name,value]of Object.entries({APP_URL:app,SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:key}))if(!value)throw new ConfigurationError(`A variável ${name} não está configurada em Production. Salve e faça Redeploy.`,'CONFIG_MISSING');
 const origin=address(app!,'APP_URL'),supabase=address(url!,'SUPABASE_URL');
 if(['abcde.supabase.co','seu-projeto.supabase.co'].includes(supabase.hostname.toLowerCase()))throw new ConfigurationError('SUPABASE_URL contém um exemplo. Use a Project URL real do projeto Pulso.','CONFIG_EXAMPLE');
 if(key!.startsWith('sb_secret_'))throw new ConfigurationError('SUPABASE_PUBLISHABLE_KEY deve conter uma chave publishable, não uma chave secret.','CONFIG_KEY_INVALID');
 if(!key!.startsWith('sb_publishable_')&&!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key!))throw new ConfigurationError('SUPABASE_PUBLISHABLE_KEY tem formato inválido. Copie somente a chave publishable completa.','CONFIG_KEY_INVALID');
 if(key!.includes('SUBSTITUA')||key!.includes('...')||key!.includes('…'))throw new ConfigurationError('A chave contém um exemplo ou está incompleta. Copie a chave publishable completa.','CONFIG_KEY_INVALID');
 if(!key!.startsWith('sb_publishable_')){try{const claims=JSON.parse(Buffer.from(key!.split('.')[1],'base64url').toString());if(claims.role!=='anon')throw Error();}catch{throw new ConfigurationError('Use a chave publishable ou anon, nunca uma chave administrativa.','CONFIG_KEY_INVALID');}}
 return {origin:origin.origin,supabaseUrl:supabase.origin,supabaseKey:key!,secure:origin.protocol==='https:'};
}
