-- Pulso independente. Execute uma vez no SQL Editor do seu projeto Supabase.
-- Os únicos identificadores de proprietário vêm de auth.uid(), nunca do navegador.
create table public.pulso_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null,
 revision integer not null default 1 check (revision>0),
 updated_at timestamptz not null default now(),
 constraint pulso_payload_shape check (
  jsonb_typeof(payload)='object' and payload ?& array['company','sector','stage','period','records','actions'] and
  jsonb_typeof(payload->'company')='string' and length(payload->>'company')<=80 and
  payload->>'sector' in ('E','F','D') and payload->>'stage' in ('0','1','2') and
  (payload->>'period') ~ '^\d{4}-(0[1-9]|1[0-2])$' and
  jsonb_typeof(payload->'records')='object' and jsonb_typeof(payload->'actions')='array' and
  octet_length(payload::text)<=1048576
 )
);
alter table public.pulso_workspaces enable row level security;
revoke all on public.pulso_workspaces from public, anon, authenticated;
grant select on public.pulso_workspaces to authenticated;
create policy pulso_select_own on public.pulso_workspaces for select to authenticated using ((select auth.uid())=user_id);

-- Gravação atômica com revisão esperada. DML direto permanece bloqueado.
create function public.save_pulso_workspace(p_state jsonb,p_revision integer)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
 v_user uuid:=auth.uid();
 v_row public.pulso_workspaces%rowtype;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501';end if;
 if p_revision is null or p_revision<0 or p_revision>=2147483647 then raise exception 'Invalid revision' using errcode='22023';end if;
 if p_state is null or jsonb_typeof(p_state)<>'object' then raise exception 'Invalid payload' using errcode='22023';end if;
 if p_revision=0 then
  insert into public.pulso_workspaces(user_id,payload,revision,updated_at)
  values(v_user,p_state,1,now()) on conflict(user_id) do nothing returning * into v_row;
 else
  update public.pulso_workspaces set payload=p_state,revision=revision+1,updated_at=now()
  where user_id=v_user and revision=p_revision returning * into v_row;
 end if;
 if found then return jsonb_build_object('ok',true,'revision',v_row.revision,'updatedAt',v_row.updated_at);end if;
 select * into v_row from public.pulso_workspaces where user_id=v_user;
 return jsonb_build_object('ok',false,'state',v_row.payload,'revision',coalesce(v_row.revision,0),'updatedAt',v_row.updated_at);
end;
$$;
revoke all on function public.save_pulso_workspace(jsonb,integer) from public,anon;
grant execute on function public.save_pulso_workspace(jsonb,integer) to authenticated;
