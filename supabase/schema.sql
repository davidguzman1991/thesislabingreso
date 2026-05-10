create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  token text not null,
  nombre_cliente_1 text not null,
  nombre_cliente_2 text,
  cedula_cliente_1 text not null default '',
  cedula_cliente_2 text,
  whatsapp text not null default '',
  email text not null default '',
  gmail_drive text not null default '',
  provincia text not null default '',
  ciudad text not null default '',
  estado_formulario text not null default 'pendiente'
    check (estado_formulario in ('pendiente', 'completo')),
  estado_cliente text not null default 'activo'
    check (estado_cliente in ('activo', 'en_pausa', 'cerrado', 'archivado')),
  closed_at timestamp with time zone,
  archived_at timestamp with time zone,
  deleted_at timestamp with time zone,
  acepta_comunicaciones boolean not null default false,
  drive_url text,
  drive_estado text not null default 'pendiente'
    check (drive_estado in ('pendiente', 'compartido', 'activo')),
  drive_confirmado_cliente boolean not null default false,
  drive_compartido_at timestamp with time zone,
  drive_observaciones text,
  created_at timestamp with time zone not null default now()
);

alter table public.clients
  add column if not exists drive_estado text not null default 'pendiente';

alter table public.clients
  add column if not exists drive_confirmado_cliente boolean not null default false;

alter table public.clients
  add column if not exists drive_compartido_at timestamp with time zone;

alter table public.clients
  add column if not exists drive_observaciones text;

alter table public.clients
  add column if not exists closed_at timestamp with time zone;

alter table public.clients
  add column if not exists archived_at timestamp with time zone;

alter table public.clients
  add column if not exists deleted_at timestamp with time zone;

alter table public.clients
  add column if not exists acepta_comunicaciones boolean not null default false;

do $$
begin
  update public.clients
  set estado_cliente = 'en_pausa'
  where estado_cliente = 'inactivo';

  alter table public.clients
    drop constraint if exists clients_estado_cliente_check;

  alter table public.clients
    add constraint clients_estado_cliente_check
    check (estado_cliente in ('activo', 'en_pausa', 'cerrado', 'archivado'));
end;
$$;

do $$
begin
  alter table public.clients
    drop constraint if exists clients_drive_estado_check;

  alter table public.clients
    add constraint clients_drive_estado_check
    check (drive_estado in ('pendiente', 'compartido', 'activo'));
end;
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_stage text not null default 'registro_completado'
    check (project_stage in ('registro_completado', 'documentos_recibidos', 'desarrollo_academico', 'revision', 'entrega_final')),
  project_status text not null default 'a_tiempo'
    check (project_status in ('a_tiempo', 'proximo_entrega', 'pendiente_datos', 'en_pausa', 'finalizado')),
  universidad text not null default '',
  facultad text not null default '',
  carrera text not null default '',
  nivel text not null default '',
  tipo_trabajo text not null default '',
  tutor text not null default '',
  titulo text not null default '',
  anteproyecto_aprobado boolean not null default false,
  fecha_limite date,
  base_datos boolean not null default false,
  tipo_citas text not null default '',
  paginas text not null default '',
  observaciones text,
  created_at timestamp with time zone not null default now()
);

alter table public.projects
  add column if not exists project_stage text not null default 'registro_completado';

alter table public.projects
  add column if not exists project_status text not null default 'a_tiempo';

do $$
begin
  update public.projects
  set project_stage = case
    when lower(project_stage) in ('registro completado', 'registro_completado') then 'registro_completado'
    when lower(project_stage) in ('documentos recibidos', 'documentos_recibidos') then 'documentos_recibidos'
    when lower(project_stage) in ('desarrollo academico', 'desarrollo académico', 'desarrollo_academico') then 'desarrollo_academico'
    when lower(project_stage) in ('revision', 'revisión') then 'revision'
    when lower(project_stage) in ('entrega final', 'entrega_final') then 'entrega_final'
    else 'registro_completado'
  end
  where project_stage not in ('registro_completado', 'documentos_recibidos', 'desarrollo_academico', 'revision', 'entrega_final');

  update public.projects
  set project_status = case
    when lower(project_status) in ('a tiempo', 'a_tiempo') then 'a_tiempo'
    when lower(project_status) in ('proximo entrega', 'próximo a entrega', 'proximo a entrega', 'proximo_entrega') then 'proximo_entrega'
    when lower(project_status) in ('pendiente de datos', 'pendiente_datos') then 'pendiente_datos'
    when lower(project_status) in ('en pausa', 'en_pausa') then 'en_pausa'
    when lower(project_status) = 'finalizado' then 'finalizado'
    else 'a_tiempo'
  end
  where project_status not in ('a_tiempo', 'proximo_entrega', 'pendiente_datos', 'en_pausa', 'finalizado');

  alter table public.projects
    drop constraint if exists projects_project_stage_check;

  alter table public.projects
    add constraint projects_project_stage_check
    check (project_stage in ('registro_completado', 'documentos_recibidos', 'desarrollo_academico', 'revision', 'entrega_final'));

  alter table public.projects
    drop constraint if exists projects_project_status_check;

  alter table public.projects
    add constraint projects_project_status_check
    check (project_status in ('a_tiempo', 'proximo_entrega', 'pendiente_datos', 'en_pausa', 'finalizado'));
end;
$$;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  plan text not null check (plan in ('Estandar', 'Desarrollo a medida', 'Elite')),
  partes_incluidas jsonb not null default '[]'::jsonb,
  metodo_pago text not null
    check (metodo_pago in ('transferencia', 'tarjeta_credito', 'tarjeta_debito')),
  precio_total numeric not null default 0 check (precio_total >= 0),
  valor_entrada numeric not null default 0 check (valor_entrada >= 0),
  saldo_pendiente numeric not null default 0 check (saldo_pendiente >= 0),
  numero_cuotas integer not null default 1 check (numero_cuotas > 0),
  created_at timestamp with time zone not null default now()
);

create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  numero_cuota integer not null check (numero_cuota > 0),
  monto numeric not null default 0 check (monto >= 0),
  monto_original numeric not null default 0 check (monto_original >= 0),
  fecha_vencimiento date not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'pagado', 'vencido')),
  created_at timestamp with time zone not null default now(),
  unique (client_id, numero_cuota)
);

alter table public.installments
  add column if not exists monto_original numeric not null default 0;

update public.installments
set monto_original = monto
where monto_original = 0;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  monto numeric not null check (monto > 0),
  fecha_pago date not null,
  metodo text not null
    check (metodo in ('transferencia', 'tarjeta_credito', 'tarjeta_debito')),
  comprobante_url text,
  observacion text,
  estado text not null default 'reportado'
    check (estado in ('reportado', 'aprobado', 'rechazado')),
  validated_at timestamp with time zone,
  validated_by text,
  rejection_reason text,
  created_at timestamp with time zone not null default now()
);

alter table public.payments
  add column if not exists validated_at timestamp with time zone;

alter table public.payments
  add column if not exists validated_by text;

alter table public.payments
  add column if not exists rejection_reason text;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'payments_estado_check'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      drop constraint payments_estado_check;
  end if;

  update public.payments
  set estado = 'aprobado'
  where estado = 'confirmado';

  alter table public.payments
    add constraint payments_estado_check
    check (estado in ('reportado', 'aprobado', 'rechazado'));
end;
$$;

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  event_type text not null
    check (event_type in (
      'client_created',
      'client_closed',
      'client_archived',
      'client_reactivated',
      'onboarding_completed',
      'drive_shared',
      'drive_confirmed',
      'payment_reported',
      'payment_approved',
      'payment_rejected',
      'stage_updated',
      'status_updated'
    )),
  description text not null,
  actor text not null check (actor in ('admin', 'cliente')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists clients_codigo_token_idx on public.clients (codigo, token);
create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists services_client_id_idx on public.services (client_id);
create index if not exists installments_client_id_idx on public.installments (client_id);
create index if not exists payments_client_id_idx on public.payments (client_id);
create index if not exists activity_logs_client_id_created_at_idx on public.activity_logs (client_id, created_at desc);

do $$
begin
  alter table public.activity_logs
    drop constraint if exists activity_logs_event_type_check;

  alter table public.activity_logs
    add constraint activity_logs_event_type_check
    check (event_type in (
      'client_created',
      'client_closed',
      'client_archived',
      'client_reactivated',
      'onboarding_completed',
      'drive_shared',
      'drive_confirmed',
      'payment_reported',
      'payment_approved',
      'payment_rejected',
      'stage_updated',
      'status_updated'
    ));
end;
$$;

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.services enable row level security;
alter table public.installments enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;

create or replace function public.create_activity_log(
  p_codigo text,
  p_event_type text,
  p_description text,
  p_actor text,
  p_metadata jsonb default '{}'::jsonb
)
returns public.activity_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  target_client public.clients;
  created_log public.activity_logs;
begin
  if p_event_type not in (
    'client_created',
    'client_closed',
    'client_archived',
    'client_reactivated',
    'onboarding_completed',
    'drive_shared',
    'drive_confirmed',
    'payment_reported',
    'payment_approved',
    'payment_rejected',
    'stage_updated',
    'status_updated'
  ) then
    raise exception 'invalid_activity_event_type';
  end if;

  if p_actor not in ('admin', 'cliente') then
    raise exception 'invalid_activity_actor';
  end if;

  select *
  into target_client
  from public.clients
  where codigo = p_codigo;

  if target_client.id is null then
    raise exception 'client_not_found';
  end if;

  insert into public.activity_logs (
    client_id,
    event_type,
    description,
    actor,
    metadata
  )
  values (
    target_client.id,
    p_event_type,
    p_description,
    p_actor,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into created_log;

  return created_log;
end;
$$;

create or replace function public.create_admin_client(payload jsonb)
returns public.clients
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
  new_code text;
  new_token text;
  created_client public.clients;
  installment jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('thesislab_client_code'));

  select coalesce(max((substring(codigo from 4))::integer), 0) + 1
  into next_number
  from public.clients
  where codigo ~ '^TL-[0-9]{4}$';

  new_code := 'TL-' || lpad(next_number::text, 4, '0');
  new_token := replace(gen_random_uuid()::text, '-', '');

  insert into public.clients (
    codigo,
    token,
    nombre_cliente_1,
    estado_formulario
  )
  values (
    new_code,
    new_token,
    nullif(payload->>'nombre_cliente_1', ''),
    'pendiente'
  )
  returning * into created_client;

  insert into public.services (
    client_id,
    plan,
    partes_incluidas,
    metodo_pago,
    precio_total,
    valor_entrada,
    saldo_pendiente,
    numero_cuotas
  )
  values (
    created_client.id,
    payload->>'plan',
    coalesce(payload->'partes_incluidas', '[]'::jsonb),
    payload->>'metodo_pago',
    coalesce((payload->>'precio_total')::numeric, 0),
    coalesce((payload->>'valor_entrada')::numeric, 0),
    greatest(
      coalesce((payload->>'precio_total')::numeric, 0) -
      coalesce((payload->>'valor_entrada')::numeric, 0),
      0
    ),
    coalesce((payload->>'numero_cuotas')::integer, 1)
  );

  for installment in select * from jsonb_array_elements(coalesce(payload->'installments', '[]'::jsonb))
  loop
    insert into public.installments (
      client_id,
      numero_cuota,
      monto,
      monto_original,
      fecha_vencimiento,
      estado
    )
    values (
      created_client.id,
      (installment->>'numero_cuota')::integer,
      (installment->>'monto')::numeric,
      (installment->>'monto')::numeric,
      (installment->>'fecha_vencimiento')::date,
      coalesce(installment->>'estado', 'pendiente')
    );
  end loop;

  insert into public.projects (
    client_id,
    project_stage,
    project_status
  )
  values (
    created_client.id,
    'registro_completado',
    'a_tiempo'
  );

  insert into public.activity_logs (
    client_id,
    event_type,
    description,
    actor,
    metadata
  )
  values (
    created_client.id,
    'client_created',
    'Cliente creado por admin',
    'admin',
    jsonb_build_object(
      'codigo', created_client.codigo,
      'plan', payload->>'plan',
      'precio_total', coalesce((payload->>'precio_total')::numeric, 0)
    )
  );

  return created_client;
end;
$$;

create or replace function public.complete_client_registration(
  p_codigo text,
  p_token text,
  payload jsonb
)
returns public.clients
language plpgsql
security definer
set search_path = public
as $$
declare
  target_client public.clients;
  existing_project_stage text;
  existing_project_status text;
begin
  select *
  into target_client
  from public.clients
  where codigo = p_codigo
    and token = p_token
    and estado_cliente = 'activo'
  for update;

  if target_client.id is null then
    raise exception 'invalid_client_access';
  end if;

  update public.clients
  set
    nombre_cliente_1 = payload #>> '{client,nombre_cliente_1}',
    nombre_cliente_2 = nullif(payload #>> '{client,nombre_cliente_2}', ''),
    cedula_cliente_1 = payload #>> '{client,cedula_cliente_1}',
    cedula_cliente_2 = nullif(payload #>> '{client,cedula_cliente_2}', ''),
    whatsapp = payload #>> '{client,whatsapp}',
    email = payload #>> '{client,email}',
    gmail_drive = payload #>> '{client,gmail_drive}',
    provincia = payload #>> '{client,provincia}',
    ciudad = payload #>> '{client,ciudad}',
    drive_url = nullif(payload #>> '{documents,drive_url}', ''),
    acepta_comunicaciones = coalesce((payload #>> '{conditions,acepta_comunicaciones}')::boolean, false),
    estado_formulario = 'completo'
  where id = target_client.id
  returning * into target_client;

  select
    project_stage,
    project_status
  into
    existing_project_stage,
    existing_project_status
  from public.projects
  where client_id = target_client.id
  order by created_at desc
  limit 1;

  delete from public.projects where client_id = target_client.id;

  insert into public.projects (
    client_id,
    project_stage,
    project_status,
    universidad,
    facultad,
    carrera,
    nivel,
    tipo_trabajo,
    tutor,
    titulo,
    anteproyecto_aprobado,
    fecha_limite,
    base_datos,
    tipo_citas,
    paginas,
    observaciones
  )
  values (
    target_client.id,
    coalesce(existing_project_stage, 'registro_completado'),
    coalesce(existing_project_status, 'a_tiempo'),
    payload #>> '{academic,universidad}',
    payload #>> '{academic,facultad}',
    payload #>> '{academic,carrera}',
    payload #>> '{academic,nivel}',
    payload #>> '{academic,tipo_trabajo}',
    payload #>> '{academic,tutor}',
    payload #>> '{academic,titulo}',
    coalesce((payload #>> '{projectState,anteproyecto_aprobado}')::boolean, false),
    nullif(payload #>> '{projectState,fecha_limite}', '')::date,
    coalesce((payload #>> '{projectState,base_datos}')::boolean, false),
    payload #>> '{academicFormat,tipo_citas}',
    payload #>> '{academicFormat,paginas}',
    nullif(payload #>> '{projectState,observaciones}', '')
  );

  insert into public.activity_logs (
    client_id,
    event_type,
    description,
    actor,
    metadata
  )
  values (
    target_client.id,
    'onboarding_completed',
    'Cliente completó onboarding',
    'cliente',
    jsonb_build_object(
      'universidad', payload #>> '{academic,universidad}',
      'titulo', payload #>> '{academic,titulo}'
    )
  );

  return target_client;
end;
$$;

create or replace function public.admin_update_project_progress(
  p_codigo text,
  payload jsonb
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  target_client public.clients;
  target_project public.projects;
  next_project_stage text;
  next_project_status text;
  previous_project_stage text;
  previous_project_status text;
begin
  next_project_stage := coalesce(nullif(payload->>'project_stage', ''), 'registro_completado');
  next_project_status := coalesce(nullif(payload->>'project_status', ''), 'a_tiempo');

  if next_project_stage not in ('registro_completado', 'documentos_recibidos', 'desarrollo_academico', 'revision', 'entrega_final') then
    raise exception 'invalid_project_stage';
  end if;

  if next_project_status not in ('a_tiempo', 'proximo_entrega', 'pendiente_datos', 'en_pausa', 'finalizado') then
    raise exception 'invalid_project_status';
  end if;

  select *
  into target_client
  from public.clients
  where codigo = p_codigo;

  if target_client.id is null then
    raise exception 'client_not_found';
  end if;

  select
    project_stage,
    project_status
  into
    previous_project_stage,
    previous_project_status
  from public.projects
  where client_id = target_client.id
  order by created_at desc
  limit 1;

  update public.projects
  set
    project_stage = next_project_stage,
    project_status = next_project_status
  where id = (
    select id
    from public.projects
    where client_id = target_client.id
    order by created_at desc
    limit 1
  )
  returning * into target_project;

  if target_project.id is null then
    insert into public.projects (
      client_id,
      project_stage,
      project_status
    )
    values (
      target_client.id,
      next_project_stage,
      next_project_status
    )
    returning * into target_project;
  end if;

  if previous_project_stage is distinct from next_project_stage then
    insert into public.activity_logs (
      client_id,
      event_type,
      description,
      actor,
      metadata
    )
    values (
      target_client.id,
      'stage_updated',
      'Etapa cambiada: ' || coalesce(previous_project_stage, 'sin_etapa') || ' → ' || next_project_stage,
      'admin',
      jsonb_build_object(
        'estado_anterior', previous_project_stage,
        'estado_nuevo', next_project_stage
      )
    );
  end if;

  if previous_project_status is distinct from next_project_status then
    insert into public.activity_logs (
      client_id,
      event_type,
      description,
      actor,
      metadata
    )
    values (
      target_client.id,
      'status_updated',
      'Estado operativo cambiado: ' || coalesce(previous_project_status, 'sin_estado') || ' → ' || next_project_status,
      'admin',
      jsonb_build_object(
        'estado_anterior', previous_project_status,
        'estado_nuevo', next_project_status
      )
    );
  end if;

  return target_project;
end;
$$;

create or replace function public.admin_update_client_lifecycle(
  p_codigo text,
  p_action text
)
returns public.clients
language plpgsql
security definer
set search_path = public
as $$
declare
  target_client public.clients;
  updated_client public.clients;
  previous_status text;
begin
  if p_action not in ('cerrar', 'archivar', 'reactivar') then
    raise exception 'invalid_lifecycle_action';
  end if;

  select *
  into target_client
  from public.clients
  where codigo = p_codigo
  for update;

  if target_client.id is null then
    raise exception 'client_not_found';
  end if;

  previous_status := target_client.estado_cliente;

  if p_action = 'cerrar' then
    update public.clients
    set
      estado_cliente = 'cerrado',
      closed_at = now()
    where id = target_client.id
    returning * into updated_client;

    update public.projects
    set
      project_stage = 'entrega_final',
      project_status = 'finalizado'
    where id = (
      select id
      from public.projects
      where client_id = target_client.id
      order by created_at desc
      limit 1
    );

    if not found then
      insert into public.projects (
        client_id,
        project_stage,
        project_status
      )
      values (
        target_client.id,
        'entrega_final',
        'finalizado'
      );
    end if;

    insert into public.activity_logs (
      client_id,
      event_type,
      description,
      actor,
      metadata
    )
    values (
      target_client.id,
      'client_closed',
      'Cliente marcado como cerrado',
      'admin',
      jsonb_build_object(
        'estado_anterior', previous_status,
        'estado_nuevo', 'cerrado',
        'project_stage', 'entrega_final',
        'project_status', 'finalizado'
      )
    );
  elsif p_action = 'archivar' then
    update public.clients
    set
      estado_cliente = 'archivado',
      archived_at = now()
    where id = target_client.id
    returning * into updated_client;

    insert into public.activity_logs (
      client_id,
      event_type,
      description,
      actor,
      metadata
    )
    values (
      target_client.id,
      'client_archived',
      'Cliente archivado',
      'admin',
      jsonb_build_object(
        'estado_anterior', previous_status,
        'estado_nuevo', 'archivado'
      )
    );
  else
    update public.clients
    set
      estado_cliente = 'activo',
      closed_at = null,
      archived_at = null,
      deleted_at = null
    where id = target_client.id
    returning * into updated_client;

    insert into public.activity_logs (
      client_id,
      event_type,
      description,
      actor,
      metadata
    )
    values (
      target_client.id,
      'client_reactivated',
      'Cliente reactivado',
      'admin',
      jsonb_build_object(
        'estado_anterior', previous_status,
        'estado_nuevo', 'activo'
      )
    );
  end if;

  return updated_client;
end;
$$;

create or replace function public.report_client_payment(
  p_codigo text,
  p_token text,
  payload jsonb
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  target_client public.clients;
  created_payment public.payments;
begin
  select *
  into target_client
  from public.clients
  where codigo = p_codigo
    and token = p_token
    and estado_cliente = 'activo';

  if target_client.id is null then
    raise exception 'invalid_client_access';
  end if;

  insert into public.payments (
    client_id,
    monto,
    fecha_pago,
    metodo,
    comprobante_url,
    observacion,
    estado
  )
  values (
    target_client.id,
    (payload->>'monto')::numeric,
    (payload->>'fecha_pago')::date,
    payload->>'metodo',
    nullif(payload->>'comprobante_url', ''),
    nullif(payload->>'observacion', ''),
    'reportado'
  )
  returning * into created_payment;

  insert into public.activity_logs (
    client_id,
    event_type,
    description,
    actor,
    metadata
  )
  values (
    target_client.id,
    'payment_reported',
    'Pago reportado — $' || to_char(created_payment.monto, 'FM999999990.00'),
    'cliente',
    jsonb_build_object(
      'monto', created_payment.monto,
      'metodo', created_payment.metodo,
      'payment_id', created_payment.id
    )
  );

  return created_payment;
end;
$$;

create or replace function public.admin_update_client_drive(
  p_codigo text,
  payload jsonb
)
returns public.clients
language plpgsql
security definer
set search_path = public
as $$
declare
  target_client public.clients;
  next_drive_estado text;
  previous_drive_estado text;
begin
  next_drive_estado := coalesce(nullif(payload->>'drive_estado', ''), 'pendiente');

  if next_drive_estado not in ('pendiente', 'compartido', 'activo') then
    raise exception 'invalid_drive_status';
  end if;

  select drive_estado
  into previous_drive_estado
  from public.clients
  where codigo = p_codigo;

  update public.clients
  set
    drive_url = nullif(payload->>'drive_url', ''),
    drive_estado = next_drive_estado,
    drive_compartido_at = nullif(payload->>'drive_compartido_at', '')::timestamp with time zone,
    drive_observaciones = nullif(payload->>'drive_observaciones', '')
  where codigo = p_codigo
  returning * into target_client;

  if target_client.id is null then
    raise exception 'client_not_found';
  end if;

  if next_drive_estado in ('compartido', 'activo')
    and previous_drive_estado is distinct from next_drive_estado then
    insert into public.activity_logs (
      client_id,
      event_type,
      description,
      actor,
      metadata
    )
    values (
      target_client.id,
      'drive_shared',
      'Drive compartido por admin',
      'admin',
      jsonb_build_object(
        'estado_anterior', previous_drive_estado,
        'estado_nuevo', next_drive_estado,
        'drive_url', target_client.drive_url
      )
    );
  end if;

  return target_client;
end;
$$;

create or replace function public.client_confirm_drive_access(
  p_codigo text,
  p_token text
)
returns public.clients
language plpgsql
security definer
set search_path = public
as $$
declare
  target_client public.clients;
begin
  update public.clients
  set
    drive_confirmado_cliente = true,
    drive_estado = 'activo'
  where codigo = p_codigo
    and token = p_token
    and estado_cliente = 'activo'
  returning * into target_client;

  if target_client.id is null then
    raise exception 'invalid_client_access';
  end if;

  insert into public.activity_logs (
    client_id,
    event_type,
    description,
    actor,
    metadata
  )
  values (
    target_client.id,
    'drive_confirmed',
    'Cliente confirmó acceso a Drive',
    'cliente',
    jsonb_build_object('drive_url', target_client.drive_url)
  );

  return target_client;
end;
$$;

create or replace function public.recalculate_client_installments(
  p_client_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  service_record public.services;
  installment_record public.installments;
  remaining_paid numeric;
  next_pending_amount numeric;
begin
  select *
  into service_record
  from public.services
  where client_id = p_client_id
  order by created_at desc
  limit 1;

  if service_record.id is null then
    return;
  end if;

  remaining_paid := greatest(service_record.precio_total - service_record.saldo_pendiente, 0);

  for installment_record in
    select *
    from public.installments
    where client_id = p_client_id
    order by numero_cuota
  loop
    if remaining_paid >= installment_record.monto_original then
      update public.installments
      set
        monto = installment_record.monto_original,
        estado = 'pagado'
      where id = installment_record.id;

      remaining_paid := remaining_paid - installment_record.monto_original;
    elsif remaining_paid > 0 then
      next_pending_amount := greatest(installment_record.monto_original - remaining_paid, 0);

      update public.installments
      set
        monto = next_pending_amount,
        estado = case
          when next_pending_amount = 0 then 'pagado'
          else 'pendiente'
        end
      where id = installment_record.id;

      remaining_paid := 0;
    else
      update public.installments
      set
        monto = installment_record.monto_original,
        estado = case
          when estado = 'vencido' then 'vencido'
          else 'pendiente'
        end
      where id = installment_record.id;
    end if;
  end loop;
end;
$$;

create or replace function public.admin_validate_payment(
  p_codigo text,
  p_payment_id uuid,
  p_decision text,
  p_rejection_reason text default null,
  p_validated_by text default 'admin'
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  target_client public.clients;
  target_payment public.payments;
  updated_payment public.payments;
begin
  if p_decision not in ('aprobado', 'rechazado') then
    raise exception 'invalid_payment_decision';
  end if;

  select *
  into target_client
  from public.clients
  where codigo = p_codigo;

  if target_client.id is null then
    raise exception 'client_not_found';
  end if;

  select *
  into target_payment
  from public.payments
  where id = p_payment_id
    and client_id = target_client.id
  for update;

  if target_payment.id is null then
    raise exception 'payment_not_found';
  end if;

  if target_payment.estado <> 'reportado' then
    raise exception 'payment_already_validated';
  end if;

  if p_decision = 'rechazado' and nullif(trim(coalesce(p_rejection_reason, '')), '') is null then
    raise exception 'rejection_reason_required';
  end if;

  update public.payments
  set
    estado = p_decision,
    validated_at = now(),
    validated_by = coalesce(nullif(p_validated_by, ''), 'admin'),
    rejection_reason = case
      when p_decision = 'rechazado' then nullif(trim(coalesce(p_rejection_reason, '')), '')
      else null
    end
  where id = target_payment.id
  returning * into updated_payment;

  if p_decision = 'aprobado' then
    update public.services
    set saldo_pendiente = greatest(saldo_pendiente - updated_payment.monto, 0)
    where client_id = target_client.id;

    perform public.recalculate_client_installments(target_client.id);

    insert into public.activity_logs (
      client_id,
      event_type,
      description,
      actor,
      metadata
    )
    values (
      target_client.id,
      'payment_approved',
      'Pago aprobado por admin — $' || to_char(updated_payment.monto, 'FM999999990.00'),
      'admin',
      jsonb_build_object(
        'monto', updated_payment.monto,
        'payment_id', updated_payment.id,
        'estado_anterior', target_payment.estado,
        'estado_nuevo', updated_payment.estado
      )
    );
  else
    insert into public.activity_logs (
      client_id,
      event_type,
      description,
      actor,
      metadata
    )
    values (
      target_client.id,
      'payment_rejected',
      'Pago rechazado por admin — $' || to_char(updated_payment.monto, 'FM999999990.00'),
      'admin',
      jsonb_build_object(
        'monto', updated_payment.monto,
        'payment_id', updated_payment.id,
        'estado_anterior', target_payment.estado,
        'estado_nuevo', updated_payment.estado,
        'motivo', updated_payment.rejection_reason
      )
    );
  end if;

  return updated_payment;
end;
$$;

do $$
declare
  client_record record;
begin
  for client_record in select id from public.clients
  loop
    perform public.recalculate_client_installments(client_record.id);
  end loop;
end;
$$;

revoke execute on function public.create_admin_client(jsonb) from public, anon, authenticated;
revoke execute on function public.complete_client_registration(text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.report_client_payment(text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.admin_update_client_drive(text, jsonb) from public, anon, authenticated;
revoke execute on function public.admin_update_project_progress(text, jsonb) from public, anon, authenticated;
revoke execute on function public.admin_update_client_lifecycle(text, text) from public, anon, authenticated;
revoke execute on function public.client_confirm_drive_access(text, text) from public, anon, authenticated;
revoke execute on function public.recalculate_client_installments(uuid) from public, anon, authenticated;
revoke execute on function public.create_activity_log(text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.admin_validate_payment(text, uuid, text, text, text) from public, anon, authenticated;

grant execute on function public.create_admin_client(jsonb) to service_role;
grant execute on function public.complete_client_registration(text, text, jsonb) to service_role;
grant execute on function public.report_client_payment(text, text, jsonb) to service_role;
grant execute on function public.admin_update_client_drive(text, jsonb) to service_role;
grant execute on function public.admin_update_project_progress(text, jsonb) to service_role;
grant execute on function public.admin_update_client_lifecycle(text, text) to service_role;
grant execute on function public.client_confirm_drive_access(text, text) to service_role;
grant execute on function public.recalculate_client_installments(uuid) to service_role;
grant execute on function public.create_activity_log(text, text, text, text, jsonb) to service_role;
grant execute on function public.admin_validate_payment(text, uuid, text, text, text) to service_role;
