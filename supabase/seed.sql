-- ============================================================
-- Seed demo — Agenda Mayor
-- Ejecutar en Supabase SQL Editor DESPUÉS de 0001_mvp.sql
-- auth_id fijos de ejemplo: reemplazar por UUID reales de Auth al usar
-- ============================================================

-- Roles
create table if not exists rol (
  id_rol       int generated always as identity primary key,
  nombre       varchar(20) not null unique,
  descripcion  text
);

insert into rol (nombre, descripcion) values
  ('ESTUDIANTE', 'Puede crear proyectos y eventos de comunidad'),
  ('DOCENTE',    'Puede avalar proyectos de su facultad y publicar eventos EAFI'),
  ('ADMIN',      'Control total: modera, publica eventos oficiales, administra avisos');

-- Usuarios (tabla plana, sin herencia)
create table if not exists usuario (
  id_usuario   int generated always as identity primary key,
  auth_id      uuid not null unique,
  username     varchar(30) not null unique,
  nombre       varchar(50) not null,
  apellido     varchar(50) not null,
  correo       varchar(100) not null unique,
  rol          int not null references rol(id_rol),
  facultad     varchar(100),
  programa     varchar(100),
  semestre     int,
  semillero    varchar(100),
  bio          varchar(280),
  avatar       varchar(255),
  estado       boolean not null default true
);

create index idx_usuario_correo on usuario(correo);
create index idx_usuario_username on usuario(username);

-- Proyectos
create table if not exists proyecto (
  id_proyecto        int generated always as identity primary key,
  titulo             varchar(100) not null,
  descripcion        text not null,
  fotos              jsonb not null default '[]'::jsonb,
  facultad           varchar(100) not null,
  programa           varchar(100) not null,
  tipo               varchar(20) not null check (tipo in ('INSTITUCIONAL','EAFI','COMUNIDAD')),
  estado             varchar(20) not null default 'BORRADOR' check (estado in ('BORRADOR','EN_REVISION','PUBLICADO','RECHAZADO','ELIMINADO')),
  evento_origen_id   int,  -- FK a EVENTO, se agrega después de crear la tabla EVENTO
  docente_aval_id    int references usuario(id_usuario),
  motivo_rechazo     varchar(500),
  autor_id           int not null references usuario(id_usuario),
  destacado          boolean not null default false,
  fecha_registro     date not null default current_date
);

create index idx_proyecto_autor on proyecto(autor_id);
create index idx_proyecto_estado on proyecto(estado);
create index idx_proyecto_facultad on proyecto(facultad);

-- Eventos
create table if not exists evento (
  id_evento     int generated always as identity primary key,
  titulo        varchar(200) not null,
  descripcion   text not null,
  tipo          varchar(20) not null check (tipo in ('OFICIAL','EAFI','COMUNIDAD')),
  fecha_inicio  timestamp with time zone not null,
  fecha_fin     timestamp with time zone not null,
  lugar         varchar(100) not null,
  es_virtual    boolean not null default false,
  url_virtual   varchar(255),
  facultad      varchar(100),
  edicion       varchar(50),
  imagen        varchar(255),
  autor_id      int not null references usuario(id_usuario),
  activo        boolean not null default true
);

create index idx_evento_autor on evento(autor_id);
create index idx_evento_activo on evento(activo);

-- FK de PROYECTO → EVENTO
alter table proyecto
  add constraint fk_proyecto_evento_origen
  foreign key (evento_origen_id) references evento(id_evento);

-- Avisos
create table if not exists aviso (
  id_aviso  int generated always as identity primary key,
  titulo    varchar(200) not null,
  texto     text not null,
  fecha     date not null default current_date,
  activo    boolean not null default true
);

-- Notificaciones
create table if not exists notificacion (
  id_notificacion  int generated always as identity primary key,
  mensaje          text not null,
  fecha            timestamp with time zone not null default now(),
  leida            boolean not null default false,
  usuario_id       int not null references usuario(id_usuario),
  proyecto_id      int references proyecto(id_proyecto)
);

create index idx_notificacion_usuario on notificacion(usuario_id);

-- Puestos (mesas/ubicación física en ferias EAFI)
-- Cada puesto pertenece a un evento y puede ser ocupado por un proyecto
create table if not exists puesto (
  id_puesto     int generated always as identity primary key,
  codigo        varchar(20) not null unique,
  edificio      varchar(100) not null,
  piso          int not null,
  salon         varchar(100) not null,
  ubicacion     varchar(200) not null,
  estado        varchar(20) not null default 'DISPONIBLE' check (estado in ('DISPONIBLE','OCUPADO','RESERVADO')),
  evento_id     int not null references evento(id_evento),
  proyecto_id   int references proyecto(id_proyecto)
);

create index idx_puesto_estado on puesto(estado);
create index idx_puesto_evento on puesto(evento_id);

-- ============================================================
-- RLS (Row Level Security)
-- Lectura pública de contenido publicado/activo
-- Escritura solo vía service-role desde el backend (/api/*)
-- ============================================================

alter table usuario enable row level security;
alter table proyecto enable row level security;
alter table evento enable row level security;
alter table aviso enable row level security;
alter table notificacion enable row level security;
alter table puesto enable row level security;

-- Lectura pública: cualquier anónimo puede ver contenido publicado
create policy "Lectura pública de proyectos publicados"
  on proyecto for select
  using (estado = 'PUBLICADO');

create policy "Lectura pública de eventos activos"
  on evento for select
  using (activo = true);

create policy "Lectura pública de avisos activos"
  on aviso for select
  using (activo = true);

create policy "Lectura pública de usuarios activos"
  on usuario for select
  using (estado = true);

create policy "Lectura pública de puestos"
  on puesto for select
  using (true);

create policy "Lectura de notificaciones solo por su dueño"
  on notificacion for select
  using (auth.uid() = (select auth_id from usuario where id_usuario = usuario_id));

-- Escritura: todo por service-role (backend), no por anon
-- No se crean policies de INSERT/UPDATE/DELETE para anon
-- El backend usa service-role key que bypasea RLS

-- ============================================================
-- Seed demo
-- ============================================================

-- Usuarios demo
insert into usuario (auth_id, username, nombre, apellido, correo, rol, facultad, programa, semestre, semillero, bio)
values
  ('11111111-1111-1111-1111-111111111111', 'admin.mayor', 'Admin', 'UNIMAYOR', 'admin@unimayor.edu.co',
   (select id_rol from rol where nombre = 'ADMIN' limit 1), null, null, null, null, 'Administración de la plataforma.'),
  ('22222222-2222-2222-2222-222222222222', 'profe.ingenieria', 'María', 'Docente', 'docente@unimayor.edu.co',
   (select id_rol from rol where nombre = 'DOCENTE' limit 1), 'Ingeniería', 'Ingeniería Informática', null, 'I+D', 'Docente de Ingeniería, avala proyectos EAFI.'),
  ('33333333-3333-3333-3333-333333333333', 'santiago.m', 'Santiago', 'Montaño', 'smontano@unimayor.edu.co',
   (select id_rol from rol where nombre = 'ESTUDIANTE' limit 1), 'Ingeniería', 'Ingeniería Informática', 6, 'I+D', 'Estudiante interesado en desarrollo de software.'),
  ('44444444-4444-4444-4444-444444444444', 'luisa.m', 'Luisa', 'Maya', 'lmmaya@unimayor.edu.co',
   (select id_rol from rol where nombre = 'ESTUDIANTE' limit 1), 'Arte y Diseño', 'Diseño Visual', 4, null, 'Diseñadora visual, portafolio e ilustración.')
on conflict (auth_id) do nothing;

-- Proyectos demo (4 PUBLICADO, 1 EN_REVISION, 1 RECHAZADO)
insert into proyecto (titulo, descripcion, fotos, facultad, programa, tipo, estado, autor_id, destacado, motivo_rechazo, docente_aval_id)
values
  ('Sistema de riego automatizado', 'Prototipo IoT para cultivos de la meseta de Popayán con sensores de humedad y app de monitoreo.', '[]', 'Ingeniería', 'Ingeniería Informática', 'EAFI', 'PUBLICADO',
   (select id_usuario from usuario where username = 'santiago.m' limit 1), true, null,
   (select id_usuario from usuario where username = 'profe.ingenieria' limit 1)),
  ('Cartelera viva del Claustro', 'Intervención gráfica de los muros del Claustro con ilustración y tipografía local.', '[]', 'Arte y Diseño', 'Diseño Visual', 'COMUNIDAD', 'PUBLICADO',
   (select id_usuario from usuario where username = 'luisa.m' limit 1), true, null, null),
  ('App de trueque estudiantil', 'Plataforma para intercambiar libros y materiales entre estudiantes de la U.', '[]', 'Ingeniería', 'Tecnología en Desarrollo de Software', 'COMUNIDAD', 'PUBLICADO',
   (select id_usuario from usuario where username = 'santiago.m' limit 1), false, null, null),
  ('Bilingüismo en plazas públicas', 'Jornadas de conversación en inglés en espacios públicos de Popayán.', '[]', 'Educación', 'Lic. Español e Inglés', 'INSTITUCIONAL', 'PUBLICADO',
   (select id_usuario from usuario where username = 'luisa.m' limit 1), false, null, null),
  ('Dron cartográfico del Cauca', 'Levantamiento fotogramétrico de zonas rurales con dron de bajo costo.', '[]', 'Ingeniería', 'Ingeniería Informática', 'EAFI', 'EN_REVISION',
   (select id_usuario from usuario where username = 'santiago.m' limit 1), false, null, null),
  ('Emprendimiento sin plan', 'Idea de negocio presentada sin estudio de mercado ni presupuesto.', '[]', 'Ciencias Sociales y de la Administración', 'Administración de Empresas', 'COMUNIDAD', 'RECHAZADO',
   (select id_usuario from usuario where username = 'luisa.m' limit 1), false, 'Falta estudio de mercado y presupuesto detallado.',
   (select id_usuario from usuario where username = 'profe.ingenieria' limit 1))
on conflict (auth_id) do nothing;

-- Eventos demo (1 OFICIAL, 1 EAFI) con URLs de imagen
insert into evento (titulo, descripcion, tipo, fecha_inicio, fecha_fin, lugar, es_virtual, facultad, edicion, autor_id, activo, imagen)
values
  ('Semana Universitaria UNIMAYOR', 'Actividades culturales, deportivas y académicas de toda la U.', 'OFICIAL',
   '2026-10-05 08:00:00-05', '2026-10-09 18:00:00-05', 'Claustro la Encarnación', false, null, null,
   (select id_usuario from usuario where username = 'admin.mayor' limit 1), true,
   'https://picsum.photos/seed/semana-unimayor/400/250'),
  ('EAFI Ingeniería 2026-2', 'Encuentro académico de la Facultad de Ingeniería: muestra de proyectos en puestos.', 'EAFI',
   '2026-11-12 08:00:00-05', '2026-11-13 18:00:00-05', 'Sede Bicentenario', false, 'Ingeniería', 'EAFI 2026-2',
   (select id_usuario from usuario where username = 'profe.ingenieria' limit 1), true,
   'https://picsum.photos/seed/eafiingenieria/400/250')
on conflict do nothing;

-- Puestos
insert into puesto (codigo, edificio, piso, salon, ubicacion, estado, evento_id, proyecto_id)
values
  ('MESA-01', 'Bicentenario', 1, 'Pabellón A', 'Entrada principal, Pabellón A', 'OCUPADO',
   (select id_evento from evento where titulo = 'EAFI Ingeniería 2026-2' limit 1),
   (select id_proyecto from proyecto where titulo = 'Sistema de riego automatizado' limit 1)),
  ('MESA-02', 'Bicentenario', 1, 'Pabellón A', 'Entrada principal, Pabellón A', 'OCUPADO',
   (select id_evento from evento where titulo = 'EAFI Ingeniería 2026-2' limit 1),
   (select id_proyecto from proyecto where titulo = 'Dron cartográfico del Cauca' limit 1)),
  ('MESA-03', 'Bicentenario', 2, 'Salón 204', 'Segundo piso, Salón 204', 'DISPONIBLE',
   (select id_evento from evento where titulo = 'EAFI Ingeniería 2026-2' limit 1), null)
on conflict (codigo) do nothing;

-- Avisos
insert into aviso (titulo, texto, activo)
values
  ('Convocatoria semilleros 2026-2', 'Inscripciones abiertas a semilleros de investigación hasta el 30 de octubre.', true),
  ('Mantenimiento Campus (cerrada)', 'Jornada de mantenimiento del 1 de septiembre ya finalizada.', false)
on conflict do nothing;

-- Notificaciones
insert into notificacion (mensaje, usuario_id, proyecto_id)
values
  ('Tu proyecto "Sistema de riego automatizado" fue publicado',
   (select id_usuario from usuario where username = 'santiago.m' limit 1),
   (select id_proyecto from proyecto where titulo = 'Sistema de riego automatizado' limit 1)),
  ('Tu proyecto "Emprendimiento sin plan" fue rechazado: Falta estudio de mercado y presupuesto detallado.',
   (select id_usuario from usuario where username = 'luisa.m' limit 1),
   (select id_proyecto from proyecto where titulo = 'Emprendimiento sin plan' limit 1))
on conflict do nothing;