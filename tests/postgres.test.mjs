import {test,after} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {PGlite} from '@electric-sql/pglite';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const state=name=>({company:name,sector:'E',stage:1,period:'2026-10',records:{},actions:[]});
const db=await PGlite.create();
await db.exec(`create schema auth;create role anon;create role authenticated;grant usage on schema public,auth to authenticated,anon;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;`);
await db.query('insert into auth.users values($1),($2)',[A,B]);
await db.exec(readFileSync(new URL('../supabase/migrations/001_pulso.sql',import.meta.url),'utf8'));
async function as(id,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec('set role '+role);}
async function save(s,rev){return (await db.query('select public.save_pulso_workspace($1::jsonb,$2) as result',[JSON.stringify(s),rev])).rows[0].result;}
test('PostgreSQL: account ownership comes only from auth.uid()',async()=>{await as(A);assert.equal((await save(state('Empresa A'),0)).ok,true);await as(B);assert.equal((await save(state('Empresa B'),0)).ok,true);assert.deepEqual((await db.query('select user_id,payload from public.pulso_workspaces')).rows.map(r=>r.user_id),[B]);await as(A);assert.equal((await db.query('select payload from public.pulso_workspaces')).rows[0].payload.company,'Empresa A');});
test('PostgreSQL: stale revision and repeated insert cannot overwrite data',async()=>{await as(A);const r=await save(state('Mais recente'),1);assert.equal(r.revision,2);const stale=await save(state('Obsoleta'),1);assert.equal(stale.ok,false);assert.equal(stale.state.company,'Mais recente');assert.equal(stale.revision,2);assert.equal((await save(state('Reinserida'),0)).ok,false);});
test('PostgreSQL: direct writes bypassing revision function are forbidden',async()=>{await as(A);await assert.rejects(db.query('update public.pulso_workspaces set revision=50 where user_id=$1',[A]),/permission denied/);await assert.rejects(db.query('delete from public.pulso_workspaces where user_id=$1',[A]),/permission denied/);});
test('PostgreSQL: anonymous callers and missing identity cannot write',async()=>{await as(null,'anon');await assert.rejects(db.query('select public.save_pulso_workspace($1,0)',[state('Anônimo')]),/permission denied/);await as(null);await assert.rejects(save(state('Sem identidade'),0),/Authentication required/);assert.equal((await db.query('select * from public.pulso_workspaces')).rows.length,0);});
test('PostgreSQL: invalid payload and revisions are rejected',async()=>{await as(A);await assert.rejects(save(state('Inválido'),-1),/Invalid revision/);await assert.rejects(save({company:'Sem campos'},2),/constraint/);const rows=(await db.query('select revision from public.pulso_workspaces')).rows;assert.equal(rows[0].revision,2);});

after(async()=>{await db.close();});
