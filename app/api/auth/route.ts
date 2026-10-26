import { createSessionClient } from '../../../lib/supabase';
import { getConfig,ConfigurationError } from '../../../lib/config';
import {json,checkOrigin,readJSON,HttpError} from '../../../lib/http';
import {validateCredentials} from '../../../lib/auth-validation';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const config=getConfig();if(!checkOrigin(request,config.origin))return json({error:'Origem não permitida.'},403);
 const body=await readJSON(request,4096);const action=body?.action;
 if(!['login','signup','reset','password','logout'].includes(action))return json({error:'Operação inválida.'},400);
 if(['login','signup','reset'].includes(action)){const invalid=validateCredentials(body.email,body.password,action);if(invalid)return json({error:invalid},400);}
 if(action==='password'&&(typeof body.password!=='string'||body.password.length<12||body.password.length>128))return json({error:'Use uma senha com 12 a 128 caracteres.'},400);
 const supabase=await createSessionClient();
 if(action==='logout'){const {error}=await supabase.auth.signOut({scope:'local'});return error?json({error:'Não foi possível sair. Tente novamente.'},503):json({ok:true,redirect:'/entrar'});}
 if(action==='login'){
  const {error}=await supabase.auth.signInWithPassword({email:body.email.trim(),password:body.password});
  if(error)return json({error:error.status===429?'Muitas tentativas. Aguarde antes de tentar novamente.':'Não foi possível entrar. Confira o e-mail, a senha e a confirmação do cadastro.'},error.status===429?429:401);
  return json({ok:true,redirect:'/'});
 }
 if(action==='signup'){
  const {error}=await supabase.auth.signUp({email:body.email.trim(),password:body.password,options:{emailRedirectTo:config.origin+'/auth/callback'}});
  if(error)return json({error:error.status===429?'Aguarde antes de solicitar outro e-mail.':'Não foi possível concluir o cadastro. Confira os dados ou tente recuperar a senha.'},error.status===429?429:400);
  return json({ok:true,message:'Se o cadastro puder ser concluído, você receberá um e-mail de confirmação. Depois, entre com sua senha.'});
 }
 if(action==='reset'){
  const {error}=await supabase.auth.resetPasswordForEmail(body.email.trim(),{redirectTo:config.origin+'/auth/callback?next=/recuperar'});
  if(error&&error.status===429)return json({error:'Aguarde antes de solicitar outro e-mail.'},429);
  if(error)return json({error:'Não foi possível solicitar a recuperação agora. Tente novamente mais tarde.'},503);
  return json({ok:true,message:'Se houver uma conta para este e-mail, você receberá as instruções de recuperação.'});
 }
 const {data:{user},error:authError}=await supabase.auth.getUser();
 if(authError||!user)return json({error:'O link expirou. Solicite a recuperação novamente.'},401);
 const {error}=await supabase.auth.updateUser({password:body.password});
 if(error)return json({error:'Não foi possível atualizar a senha. Use uma senha nova e tente novamente.'},400);
 await supabase.auth.signOut({scope:'others'});
 return json({ok:true,redirect:'/',message:'Senha atualizada.'});
 }catch(error){if(error instanceof HttpError)return json({error:error.message},error.status);if(error instanceof ConfigurationError)return json({error:'O acesso ainda não foi configurado. Contate o responsável pelo aplicativo.',code:'CONFIG_MISSING'},503);return json({error:'O serviço de acesso está indisponível. Tente novamente.'},503);}}
