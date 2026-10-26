export const sectorIds:Record<string,string[]>={E:['operacao','cac','fixos','margem','lucro','ticket','atendimento','reclamacao','base','conversao','nps','equipe','satisfacao','prazo','qualidade','eficiencia','site','marketing','confianca','seguranca'],F:['operacao','cac','fixos','margem','lucro','caixa','retorno','atendimento','reclamacao','base','equipe','produtividade','prazo','qualidade','tempo','site','marketing','confianca','dados','seguranca'],D:['qualcust','producao','operacao','fixos','margem','lucro','ticket','pd','retorno','nps','equipe','integracao','produtividade','riscos','prazo','qualidade','manutencao','desenvolvimento','equipamentos','seguranca']};
const object=(v:any)=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const finite=(v:any)=>typeof v==='number'&&Number.isFinite(v);
const text=(v:any,max:number)=>typeof v==='string'&&v.length<=max;
const month=(v:any)=>typeof v==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v);
const date=(v:any)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v));
export function validateWorkspace(s:any):string|null{
 if(!object(s)||!text(s.company,80)||!Object.hasOwn(sectorIds,s.sector)||![0,1,2].includes(s.stage)||!month(s.period)||!object(s.records)||!Array.isArray(s.actions))return 'Dados do espaço inválidos.';
 if(Object.keys(s).some(k=>!['company','sector','stage','period','records','actions'].includes(k)))return 'Campos desconhecidos no espaço.';
 if(Object.keys(s.records).length>5000||s.actions.length>2000)return 'Limite de registros excedido. Exporte um backup para arquivar períodos antigos.';
 for(const [key,r]of Object.entries(s.records) as [string,any][]){
  const parts=key.split(':');
  if(parts.length!==3||!Object.hasOwn(sectorIds,parts[0])||!sectorIds[parts[0]].includes(parts[1])||!month(parts[2])||!object(r)||!finite(r.value)||!Array.isArray(r.inputs)||r.inputs.length<1||r.inputs.length>6||!r.inputs.every(finite)||!(r.goal===null||finite(r.goal))||!['up','down'].includes(r.direction)||!text(r.notes,1500)||!text(r.updatedAt??'',40))return 'Um dos indicadores contém dados inválidos.';
  if(Object.keys(r).some(k=>!['inputs','value','goal','direction','notes','updatedAt'].includes(k)))return 'Campos desconhecidos em um indicador.';
 }
 for(const a of s.actions){if(!object(a)||!text(a.id,80)||!/^[-a-zA-Z0-9_]+$/.test(a.id)||!text(a.title,200)||!a.title.trim()||!text(a.owner,80)||!a.owner.trim()||!Object.hasOwn(sectorIds,a.sector)||typeof a.done!=='boolean'||!date(a.due))return 'Uma das ações contém dados inválidos.';if(Object.keys(a).some(k=>!['id','sector','title','owner','due','done'].includes(k)))return 'Campos desconhecidos em uma ação.';}
 if(new Set(s.actions.map((a:any)=>a.id)).size!==s.actions.length)return 'Identificadores de ações repetidos.';
 return null;
}
