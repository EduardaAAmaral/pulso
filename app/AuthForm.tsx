'use client';
import {useState,useEffect,type FormEvent} from 'react';
import './auth.css';
type Mode='login'|'signup'|'reset'|'password';
export default function AuthForm({initial='login'}:{initial?:Mode}){
 const [mode,setMode]=useState<Mode>(initial),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[repeat,setRepeat]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 useEffect(()=>{if(new URLSearchParams(window.location.search).has('erro'))setError('O link é inválido ou expirou. Solicite outro e-mail.');},[]);
 const change=(m:Mode)=>{setMode(m);setPassword('');setRepeat('');setError('');setMessage('');};
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setError('');setMessage('');if((mode==='signup'||mode==='password')&&password!==repeat){setError('As senhas precisam ser iguais.');return;}setBusy(true);
  try{const res=await fetch('/api/auth',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:mode,email,password})});const data=await res.json();if(!res.ok)throw Error(data.error||'Não foi possível continuar.');setPassword('');setRepeat('');if(data.redirect){window.location.assign(data.redirect);return;}setMessage(data.message);}
  catch(e){setError(e instanceof Error?e.message:'Não foi possível conectar. Tente novamente.');}finally{setBusy(false);}}
 const titles={login:'Bem-vinda ao seu próximo passo.',signup:'Crie seu espaço de gestão.',reset:'Vamos recuperar seu acesso.',password:'Defina sua nova senha.'};
 return <main className="authpage"><section className="authstory"><a className="authbrand" href="/">⌁ pulso.</a><div><span className="autheyebrow">CLAREZA PARA EVOLUIR</span><h1>Decisões melhores.<br/>Crescimento<br/>com direção.</h1><p>Os indicadores da sua startup,<br/>em todos os seus dispositivos.</p></div><small>Baseado em Brito, 2025 · FURG</small></section><section className="authformarea"><div className="authcard"><span className="autheyebrow">SEU ESPAÇO DE GESTÃO</span><h2>{titles[mode]}</h2><p className="authintro">{mode==='login'?'Entre com seu e-mail para continuar de onde parou.':mode==='signup'?'Cadastre seu e-mail e confirme o acesso pela mensagem recebida.':mode==='reset'?'Enviaremos um link para você criar uma nova senha.':'Use uma senha nova com pelo menos 12 caracteres.'}</p><form onSubmit={submit}>
 {mode!=='password'&&<label>E-mail<input name="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} required disabled={busy}/></label>}
 {mode!=='reset'&&<label>{mode==='password'?'Nova senha':'Senha'}<input name="password" type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='login'?1:12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} required disabled={busy}/></label>}
 {(mode==='password'||mode==='signup')&&<label>Confirmar senha<input name="repeat" type="password" autoComplete="new-password" minLength={12} maxLength={128} value={repeat} onChange={e=>setRepeat(e.target.value)} required disabled={busy}/></label>}
 {error&&<div className="autherror" role="alert">{error}</div>}{message&&<div className="authsuccess" role="status">{message}</div>}
 <button className="authsubmit" disabled={busy}>{busy?'Aguarde…':mode==='login'?'Entrar →':mode==='signup'?'Criar conta':mode==='reset'?'Enviar link de recuperação':'Salvar nova senha'}</button></form>
 {mode==='login'?<div className="authlinks"><button onClick={()=>change('reset')} disabled={busy}>Esqueci minha senha</button><span>Ainda não tem conta? <button onClick={()=>change('signup')} disabled={busy}>Criar conta</button></span></div>:<div className="authlinks"><button onClick={()=>change('login')} disabled={busy}>← Voltar para entrar</button></div>}
 <p className="authfoot">Seus indicadores ficam vinculados à sua conta.</p></div></section></main>;
}
