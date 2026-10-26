export function validateCredentials(email:unknown,password:unknown,action:string){
 if(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email))return 'Informe um e-mail válido.';
 if(action==='reset')return null;
 if(typeof password!=='string'||password.length>128||password.length<(action==='signup'?12:1))return action==='signup'?'Use uma senha com 12 a 128 caracteres.':'Informe a senha.';
 return null;
}
export function safeCallbackDestination(next:string|null){return next==='/recuperar'?'/recuperar':'/';}
