-- =====================================================================
-- BASE DE TREINO SQL PARA REVOPS
-- Schema de CRM sintetico, compativel com PostgreSQL 12+ e Supabase.
-- Rode este arquivo UMA VEZ. Ele apaga e recria tudo do zero.
-- Data de referencia da base: 2026-08-01
-- =====================================================================

drop table if exists activities cascade;
drop table if exists deal_stage_history cascade;
drop table if exists deals cascade;
drop table if exists contacts cascade;
drop table if exists companies cascade;
drop table if exists owners cascade;
drop table if exists stages cascade;

-- ---------------------------------------------------------------------
-- 1. ESTRUTURA
-- ---------------------------------------------------------------------

create table stages (
    stage_order int primary key,
    stage_name  text not null unique,
    is_closed   boolean not null
);

create table owners (
    owner_id   int primary key,
    owner_name text not null,
    team       text not null,
    hired_at   date not null
);

create table companies (
    company_id   int primary key,
    company_name text not null,
    segment      text not null,
    size_band    text not null,
    city         text not null,
    state        text not null,
    created_at   timestamp not null
);

create table contacts (
    contact_id int primary key,
    company_id int references companies(company_id),
    full_name  text,
    email      text,
    job_title  text,
    created_at timestamp
);

create table deals (
    deal_id    int primary key,
    company_id int references companies(company_id),
    owner_id   int references owners(owner_id),
    deal_name  text,
    amount     numeric(12,2),
    stage      text,
    source     text,
    created_at timestamp not null,
    closed_at  timestamp,
    status     text not null
);

create table deal_stage_history (
    history_id bigint primary key,
    deal_id    int references deals(deal_id),
    stage      text,
    entered_at timestamp
);

create table activities (
    activity_id   bigint primary key,
    deal_id       int references deals(deal_id),
    activity_type text,
    created_at    timestamp
);

-- ---------------------------------------------------------------------
-- 2. DADOS FIXOS
-- ---------------------------------------------------------------------

insert into stages (stage_order, stage_name, is_closed) values
    (1, 'Novo',             false),
    (2, 'Qualificado',      false),
    (3, 'Reuniao',          false),
    (4, 'Proposta',         false),
    (5, 'Negociacao',       false),
    (6, 'Fechado Ganho',    true),
    (7, 'Fechado Perdido',  true);

insert into owners (owner_id, owner_name, team, hired_at) values
    (1, 'Renata Alencar',   'Inbound',  '2024-02-12'),
    (2, 'Caio Bittencourt', 'Inbound',  '2024-06-03'),
    (3, 'Marina Prado',     'Outbound', '2023-11-20'),
    (4, 'Tiago Lemos',      'Outbound', '2025-01-15'),
    (5, 'Juliana Rocha',    'Enterprise','2023-08-07'),
    (6, 'Bruno Sanches',    'Enterprise','2025-03-24'),
    (7, 'Patricia Nunes',   'Inbound',  '2025-09-01'),
    (8, 'Rodrigo Vieira',   'Outbound', '2026-02-10');

-- ---------------------------------------------------------------------
-- 3. EMPRESAS
-- ---------------------------------------------------------------------

select setseed(0.42);

insert into companies (company_id, company_name, segment, size_band, city, state, created_at)
select
    g,
    (array['Grupo','Rede','Casa','Ateliê','Studio','Central','Nova','Bom'])[1 + (g % 8)]
      || ' ' ||
    (array['Sabor','Aurora','Vertice','Praia','Serra','Nordeste','Prime','Origem','Vale','Marco'])[1 + (g % 10)]
      || ' ' ||
    (array['LTDA','ME','SA','Comercio','Servicos'])[1 + (g % 5)],
    (array['Alimentacao','Varejo','Servicos','Saude','Educacao'])[1 + floor(random()*5)::int],
    (array['1-9','10-49','50-199','200+'])[
        case
            when random() < 0.45 then 1
            when random() < 0.75 then 2
            when random() < 0.93 then 3
            else 4
        end
    ],
    (array['Sao Paulo','Rio de Janeiro','Belo Horizonte','Recife','Joao Pessoa','Curitiba','Fortaleza','Salvador'])[1 + floor(random()*8)::int],
    (array['SP','RJ','MG','PE','PB','PR','CE','BA'])[1 + floor(random()*8)::int],
    timestamp '2025-02-01' + (random() * 540)::int * interval '1 day'
from generate_series(1, 400) g;

-- ---------------------------------------------------------------------
-- 4. CONTATOS
-- Proposital: alguns emails em maiuscula, alguns nulos, algumas empresas
-- sem nenhum contato. Serve para exercicio de qualidade de dado.
-- ---------------------------------------------------------------------

select setseed(0.17);

insert into contacts (contact_id, company_id, full_name, email, job_title, created_at)
select
    g,
    1 + floor(random()*380)::int,
    (array['Ana','Carlos','Fernanda','Joao','Luciana','Pedro','Camila','Marcos','Beatriz','Rafael'])[1 + (g % 10)]
      || ' ' ||
    (array['Silva','Souza','Costa','Ferreira','Almeida','Barbosa','Ribeiro','Martins'])[1 + (g % 8)],
    case
        when random() < 0.06 then null
        when random() < 0.15 then upper('contato' || g || '@empresa' || (1 + (g % 380)) || '.com.br')
        else 'contato' || g || '@empresa' || (1 + (g % 380)) || '.com.br'
    end,
    (array['Proprietario','Gerente','Diretor','Socio','Coordenador','Analista'])[1 + floor(random()*6)::int],
    timestamp '2025-02-10' + (random() * 530)::int * interval '1 day'
from generate_series(1, 700) g;

-- ---------------------------------------------------------------------
-- 5. NEGOCIOS
-- Sinais plantados de proposito (existem para as analises darem resposta):
--   a) Indicacao converte melhor que as demais origens
--   b) Outbound tem ciclo de venda mais longo
--   c) Empresa maior tem ticket maior e ciclo maior
--   d) Uma vendedora tem performance destacada
--   e) ~4% dos deals tem amount nulo (dado sujo real de CRM)
-- ---------------------------------------------------------------------

select setseed(0.73);

create temporary table seed_deals as
select
    g as deal_id,
    1 + floor(random()*400)::int as company_id,
    1 + floor(random()*8)::int   as owner_id,
    (array['Inbound','Outbound','Indicacao','Parceria','Evento'])[
        case
            when random() < 0.34 then 1
            when random() < 0.63 then 2
            when random() < 0.79 then 3
            when random() < 0.92 then 4
            else 5
        end
    ] as source,
    timestamp '2025-02-01' + (random() * 520)::int * interval '1 day' as created_at,
    random() as r_outcome,
    random() as r_stage,
    random() as r_cycle,
    random() as r_amount,
    random() as r_null
from generate_series(1, 900) g;

insert into deals (deal_id, company_id, owner_id, deal_name, amount, stage, source, created_at, closed_at, status)
select
    s.deal_id,
    s.company_id,
    s.owner_id,
    'Deal ' || lpad(s.deal_id::text, 4, '0') || ' - ' || c.company_name,
    -- amount por porte, com ruido, e ~4% nulo
    case when s.r_null < 0.04 then null
         else round(
              ((case c.size_band
                   when '1-9'    then 1200
                   when '10-49'  then 4800
                   when '50-199' then 15000
                   else 46000
               end) * (0.6 + s.r_amount * 0.9))::numeric
         , 2) end,
    -- stage atual
    case
        when outcome.status = 'won'  then 'Fechado Ganho'
        when outcome.status = 'lost' then 'Fechado Perdido'
        else (array['Novo','Qualificado','Reuniao','Proposta','Negociacao'])[1 + floor(s.r_stage*5)::int]
    end,
    s.source,
    s.created_at,
    -- closed_at somente para fechados
    case when outcome.status = 'open' then null
         else s.created_at + (
                round(
                    (case s.source when 'Outbound' then 62 when 'Indicacao' then 24 else 38 end)
                  + (case c.size_band when '200+' then 40 when '50-199' then 18 else 0 end)
                  + s.r_cycle * 30
                )
              )::int * interval '1 day'
    end,
    outcome.status
from seed_deals s
join companies c on c.company_id = s.company_id
cross join lateral (
    select case
        when s.r_outcome < (
            -- probabilidade de ganho, com sinais plantados
            0.16
            + case s.source when 'Indicacao' then 0.17 when 'Parceria' then 0.06 when 'Outbound' then -0.04 else 0 end
            + case s.owner_id when 5 then 0.09 when 8 then -0.05 else 0 end
        ) then 'won'
        when s.r_outcome < 0.62 then 'lost'
        else 'open'
    end as status
) outcome;

-- ---------------------------------------------------------------------
-- 6. HISTORICO DE ETAPAS
-- Cada deal percorre as etapas 1..N ate onde chegou.
-- Deal perdido registra a etapa onde morreu e depois 'Fechado Perdido'.
-- ---------------------------------------------------------------------

select setseed(0.91);

create temporary table seed_progress as
select
    d.deal_id,
    d.created_at,
    d.status,
    case
        when d.status = 'won'  then 5
        when d.status = 'lost' then 1 + floor(random()*4)::int   -- morreu entre etapa 1 e 4
        else (select stage_order from stages st where st.stage_name = d.stage)
    end as max_order
from deals d;

insert into deal_stage_history (history_id, deal_id, stage, entered_at)
select
    row_number() over (order by p.deal_id, st.stage_order),
    p.deal_id,
    st.stage_name,
    p.created_at + ((st.stage_order - 1) * 6 + (p.deal_id % 5))::int * interval '1 day'
from seed_progress p
join stages st on st.stage_order <= p.max_order and st.is_closed = false;

-- acrescenta a etapa de fechamento no historico dos deals fechados
insert into deal_stage_history (history_id, deal_id, stage, entered_at)
select
    (select max(history_id) from deal_stage_history) + row_number() over (order by d.deal_id),
    d.deal_id,
    d.stage,
    d.closed_at
from deals d
where d.status in ('won','lost');

-- ---------------------------------------------------------------------
-- 7. ATIVIDADES
-- ---------------------------------------------------------------------

select setseed(0.55);

insert into activities (activity_id, deal_id, activity_type, created_at)
select
    row_number() over (),
    d.deal_id,
    (array['call','email','meeting','whatsapp'])[1 + floor(random()*4)::int],
    d.created_at + (random() * 45)::int * interval '1 day'
from deals d
cross join generate_series(1, 3 + floor(random()*6)::int) n;

drop table seed_deals;
drop table seed_progress;

-- ---------------------------------------------------------------------
-- 8. INDICES (boa pratica, e assunto da Semana 6)
-- ---------------------------------------------------------------------

create index idx_deals_owner     on deals(owner_id);
create index idx_deals_company   on deals(company_id);
create index idx_deals_created   on deals(created_at);
create index idx_hist_deal       on deal_stage_history(deal_id);
create index idx_act_deal        on activities(deal_id);

-- ---------------------------------------------------------------------
-- 9. CONFERENCIA
-- ---------------------------------------------------------------------

select 'owners' as tabela, count(*) from owners
union all select 'companies', count(*) from companies
union all select 'contacts', count(*) from contacts
union all select 'deals', count(*) from deals
union all select 'deal_stage_history', count(*) from deal_stage_history
union all select 'activities', count(*) from activities
order by 1;
