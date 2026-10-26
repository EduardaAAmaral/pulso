import { ConfigurationError } from './config';
export const release='pulso-fix-20261026-1';
export function diagnostic(error:unknown){
 if(error instanceof ConfigurationError)return {error:error.message,code:error.code,release};
 const cause=(error as {cause?:{code?:string}})?.cause?.code;
 if(['ENOTFOUND','ECONNREFUSED','ETIMEDOUT','UND_ERR_CONNECT_TIMEOUT'].includes(cause??''))return {error:'Não foi possível alcançar o Supabase. Confira a Project URL e se o projeto está ativo.',code:'SUPABASE_UNREACHABLE',release};
 return {error:'O serviço de dados está indisponível. Consulte o código SERVER_CONNECTION_ERROR nos logs da Vercel.',code:'SERVER_CONNECTION_ERROR',release};
}
export function databaseDiagnostic(code?:string){
 if(['42P01','PGRST205','PGRST202','42883'].includes(code??''))return {error:'A tabela ou a função de salvamento não foi encontrada. Execute a migração SQL no projeto Supabase usado por este app.',code:'DATABASE_SETUP_REQUIRED',release};
 if(code==='42501')return {error:'O banco recusou o acesso. Confira as políticas e permissões criadas pela migração do Pulso.',code:'DATABASE_PERMISSION_DENIED',release};
 return {error:'Não foi possível ler ou salvar os dados. Confira o estado do projeto Supabase.',code:'DATABASE_UNAVAILABLE',release};
}
