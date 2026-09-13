-- ============================================================
-- Seed demo — Agenda Mayor
-- Ejecutar en Supabase SQL Editor DESPUÉS de 0001_mvp.sql
-- auth_id fijos de ejemplo: reemplazar por UUID reales de Auth al usar
-- ============================================================

-- Usuarios demo (1 admin, 1 docente, 2 estudiantes)
insert into usuario (auth_id, username, nombre, apellido, correo, rol, facultad, programa, semestre, semillero, bio)
values
  ('11111111-1111-1111-1111-111111111111', 'admin.mayor', 'Admin', 'UNIMAYOR', 'admin@unimayor.edu.co',
   (select id_rol from rol where nombre = 'ADMIN'), null, null, null, null, 'Administración de la plataforma.'),
  ('22222222-2222-2222-2222-222222222222', 'profe.ingenieria', 'María', 'Docente', 'docente@unimayor.edu.co',
   (select id_rol from rol where nombre = 'DOCENTE'), 'Ingeniería', 'Ingeniería Informática', null, 'I+D', 'Docente de Ingeniería, avala proyectos EAFI.'),
  ('33333333-3333-3333-3333-333333333333', 'santiago.m', 'Santiago', 'Montaño', 'smontano@unimayor.edu.co',
   (select id_rol from rol where nombre = 'ESTUDIANTE'), 'Ingeniería', 'Ingeniería Informática', 6, 'I+D', 'Estudiante interesado en desarrollo de software.'),
  ('44444444-4444-4444-4444-444444444444', 'luisa.m', 'Luisa', 'Maya', 'lmmaya@unimayor.edu.co',
   (select id_rol from rol where nombre = 'ESTUDIANTE'), 'Arte y Diseño', 'Diseño Visual', 4, null, 'Diseñadora visual, portafolio e ilustración.')
on conflict (auth_id) do nothing;

-- Proyectos demo (4 PUBLICADO, 1 EN_REVISION, 1 RECHAZADO)
insert into proyecto (titulo, descripcion, fotos, facultad, programa, tipo, estado, autor_id, destacado, motivo_rechazo, docente_aval_id)
values
  ('Sistema de riego automatizado', 'Prototipo IoT para cultivos de la meseta de Popayán con sensores de humedad y app de monitoreo.', '[]', 'Ingeniería', 'Ingeniería Informática', 'EAFI', 'PUBLICADO',
   (select id_usuario from usuario where username = 'santiago.m'), true, null,
   (select id_usuario from usuario where username = 'profe.ingenieria')),
  ('Cartelera viva del Claustro', 'Intervención gráfica de los muros del Claustro con ilustración y tipografía local.', '[]', 'Arte y Diseño', 'Diseño Visual', 'COMUNIDAD', 'PUBLICADO',
   (select id_usuario from usuario where username = 'luisa.m'), true, null, null),
  ('App de trueque estudiantil', 'Plataforma para intercambiar libros y materiales entre estudiantes de la U.', '[]', 'Ingeniería', 'Tecnología en Desarrollo de Software', 'COMUNIDAD', 'PUBLICADO',
   (select id_usuario from usuario where username = 'santiago.m'), false, null, null),
  ('Bilingüismo en plazas públicas', 'Jornadas de conversación en inglés en espacios públicos de Popayán.', '[]', 'Educación', 'Lic. Español e Inglés', 'INSTITUCIONAL', 'PUBLICADO',
   (select id_usuario from usuario where username = 'luisa.m'), false, null, null),
  ('Dron cartográfico del Cauca', 'Levantamiento fotogramétrico de zonas rurales con dron de bajo costo.', '[]', 'Ingeniería', 'Ingeniería Informática', 'EAFI', 'EN_REVISION',
   (select id_usuario from usuario where username = 'santiago.m'), false, null, null),
  ('Emprendimiento sin plan', 'Idea de negocio presentada sin estudio de mercado ni presupuesto.', '[]', 'Ciencias Sociales y de la Administración', 'Administración de Empresas', 'COMUNIDAD', 'RECHAZADO',
   (select id_usuario from usuario where username = 'luisa.m'), false, 'Falta estudio de mercado y presupuesto detallado.',
   (select id_usuario from usuario where username = 'profe.ingenieria'));

-- Eventos demo (1 OFICIAL, 1 EAFI)
insert into evento (titulo, descripcion, tipo, fecha_inicio, fecha_fin, lugar, es_virtual, facultad, edicion, autor_id, activo)
values
  ('Semana Universitaria UNIMAYOR', 'Actividades culturales, deportivas y académicas de toda la U.', 'OFICIAL',
   '2026-10-05 08:00:00-05', '2026-10-09 18:00:00-05', 'Claustro la Encarnación', false, null, null,
   (select id_usuario from usuario where username = 'admin.mayor'), true),
  ('EAFI Ingeniería 2026-2', 'Encuentro académico de la Facultad de Ingeniería: muestra de proyectos en puestos.', 'EAFI',
   '2026-11-12 08:00:00-05', '2026-11-13 18:00:00-05', 'Sede Bicentenario', false, 'Ingeniería', 'EAFI 2026-2',
   (select id_usuario from usuario where username = 'profe.ingenieria'), true);

-- Puestos del EAFI (2 ocupados, 1 disponible)
insert into puesto (codigo, edificio, piso, salon, ubicacion, estado, evento_id, proyecto_id)
values
  ('MESA-01', 'Bicentenario', 1, 'Pabellón A', 'Entrada principal, Pabellón A', 'OCUPADO',
   (select id_evento from evento where titulo = 'EAFI Ingeniería 2026-2'),
   (select id_proyecto from proyecto where titulo = 'Sistema de riego automatizado')),
  ('MESA-02', 'Bicentenario', 1, 'Pabellón A', 'Entrada principal, Pabellón A', 'OCUPADO',
   (select id_evento from evento where titulo = 'EAFI Ingeniería 2026-2'),
   (select id_proyecto from proyecto where titulo = 'Dron cartográfico del Cauca')),
  ('MESA-03', 'Bicentenario', 2, 'Salón 204', 'Segundo piso, Salón 204', 'DISPONIBLE',
   (select id_evento from evento where titulo = 'EAFI Ingeniería 2026-2'), null);

-- Avisos demo
insert into aviso (titulo, texto, activo)
values
  ('Convocatoria semilleros 2026-2', 'Inscripciones abiertas a semilleros de investigación hasta el 30 de octubre.', true),
  ('Mantenimiento Campus (cerrada)', 'Jornada de mantenimiento del 1 de septiembre ya finalizada.', false);

-- Notificaciones demo
insert into notificacion (mensaje, usuario_id, proyecto_id)
values
  ('Tu proyecto "Sistema de riego automatizado" fue publicado',
   (select id_usuario from usuario where username = 'santiago.m'),
   (select id_proyecto from proyecto where titulo = 'Sistema de riego automatizado')),
  ('Tu proyecto "Emprendimiento sin plan" fue rechazado: Falta estudio de mercado y presupuesto detallado.',
   (select id_usuario from usuario where username = 'luisa.m'),
   (select id_proyecto from proyecto where titulo = 'Emprendimiento sin plan'));
