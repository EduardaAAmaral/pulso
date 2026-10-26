import {createSessionClient} from '../../../lib/supabase';
import {getConfig,ConfigurationError} from '../../../lib/config';
import {json,checkOrigin,readJSON,HttpError} from '../../../lib/http';
import {validateWorkspace} from '../../../lib/validation';
export const dynamic='force-dynamic';
export async function GET(){try{
 const client=await createSessionClient(),{data:{user},error}=await client.auth.getUser();
 if(error||!user)return json({error:'Entre para acessar seus dados.'},401);
 const {data:row,error:dbError}=await client.from('pulso_workspaces').select('payload,revision,updated_at').eq('user_id',user.id).maybeSingle();
 if(dbError)return json({error:'Não foi possível carregar seus dados. Tente novamente.'},503);
 return json({state:row?.payload??null,revision:row?.revision??0,updatedAt:row?.updated_at??null,user:{id:user.id,email:user.email??'',name:user.email??''}});
 }catch(error){return json({error:error instanceof ConfigurationError?'Login e banco ainda não foram configurados pelo responsável.':'Não foi possível conectar ao serviço de dados.'},503);}}
export async function PUT(request:Request){try{
 const config=getConfig();if(!checkOrigin(request,config.origin))return json({error:'Origem não permitida.'},403);
 const client=await createSessionClient(),{data:{user},error}=await client.auth.getUser();
 if(error||!user)return json({error:'Sua sessão terminou. Entre novamente.'},401);
 const body=await readJSON(request);
 if(!body||!Number.isSafeInteger(body.revision)||body.revision<0||body.revision>=2147483647)return json({error:'Revisão inválida.'},400);
 if(body.accountId!==user.id)return json({error:'A conta conectada mudou. Entre novamente.'},401);
 const invalid=validateWorkspace(body.state);if(invalid)return json({error:invalid},400);
 const result=await client.rpc('save_pulso_workspace',{p_state:body.state,p_revision:body.revision});
 if(result.error||!result.data)return json({error:'Não foi possível salvar. Seu rascunho foi preservado.'},503);
 return result.data.ok?json(result.data):json({...result.data,error:'Há uma versão mais recente na nuvem. Seu rascunho foi preservado.'},409);
 }catch(error){if(error instanceof HttpError)return json({error:error.message},error.status);return json({error:'Não foi possível salvar na nuvem. Tente novamente.'},503);}}
