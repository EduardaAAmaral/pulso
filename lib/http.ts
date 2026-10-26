export const privateHeaders={'Cache-Control':'private, no-store, max-age=0','Vary':'Cookie','X-Content-Type-Options':'nosniff'};
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:privateHeaders});
export function checkOrigin(request:Request,origin:string){return request.headers.get('origin')===origin&&request.headers.get('sec-fetch-site')!=='cross-site';}
export async function readJSON(request:Request,max=1024*1024){
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new HttpError(415,'Envie dados no formato JSON.');
 const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Corpo vazio.');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new HttpError(413,'Limite de tamanho excedido.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let i=0;for(const c of chunks){bytes.set(c,i);i+=c.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new HttpError(400,'JSON inválido.');}
}
export class HttpError extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
