// ============================================================
// Seed de Agenda Mayor — roles, usuarios y contenido demo.
// Ejecutar:  npx prisma db seed
//
// Los roles y usuarios SÍ se crean en Postgres (requisito de la
// migración). La contraseña se guarda hasheada con bcrypt.
// Credenciales demo:  contraseña "Unimayor2026" para todas.
// ============================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD_DEMO = "Unimayor2026";

async function main() {
  const hash = bcrypt.hashSync(PASSWORD_DEMO, 10);

  // ── Roles ──
  const roles = [
    { nombre: "ESTUDIANTE", descripcion: "Puede crear proyectos y eventos de comunidad" },
    { nombre: "DOCENTE", descripcion: "Puede avalar proyectos de su facultad y publicar eventos EAFI" },
    { nombre: "ADMIN", descripcion: "Control total: modera, publica eventos oficiales, administra avisos" },
  ];
  for (const r of roles) {
    await prisma.rol.upsert({
      where: { nombre: r.nombre },
      update: { descripcion: r.descripcion },
      create: r,
    });
  }

  const rolId = Object.fromEntries(
    (await prisma.rol.findMany()).map((r) => [r.nombre, r.id_rol])
  );

  // ── Usuarios ──
  const usuarios = [
    {
      username: "admin.mayor",
      nombre: "Admin",
      apellido: "UNIMAYOR",
      correo: "admin@unimayor.edu.co",
      rol: rolId.ADMIN,
      facultad: null,
      programa: null,
      semestre: null,
      semillero: null,
      bio: "Administración de la plataforma.",
    },
    {
      username: "profe.ingenieria",
      nombre: "María",
      apellido: "Docente",
      correo: "docente@unimayor.edu.co",
      rol: rolId.DOCENTE,
      facultad: "Ingeniería",
      programa: "Ingeniería Informática",
      semestre: null,
      semillero: "I+D",
      bio: "Docente de Ingeniería, avala proyectos EAFI.",
    },
    {
      username: "santiago.m",
      nombre: "Santiago",
      apellido: "Montaño",
      correo: "smontano@unimayor.edu.co",
      rol: rolId.ESTUDIANTE,
      facultad: "Ingeniería",
      programa: "Ingeniería Informática",
      semestre: 6,
      semillero: "I+D",
      bio: "Estudiante interesado en desarrollo de software.",
    },
    {
      username: "luisa.m",
      nombre: "Luisa",
      apellido: "Maya",
      correo: "lmmaya@unimayor.edu.co",
      rol: rolId.ESTUDIANTE,
      facultad: "Arte y Diseño",
      programa: "Diseño Visual",
      semestre: 4,
      semillero: null,
      bio: "Diseñadora visual, portafolio e ilustración.",
    },
  ];

  for (const u of usuarios) {
    await prisma.usuario.upsert({
      where: { correo: u.correo },
      update: { ...u, contrasena_hash: hash },
      create: { ...u, contrasena_hash: hash },
    });
  }

  const usuarioId = Object.fromEntries(
    (await prisma.usuario.findMany()).map((u) => [u.username, u.id_usuario])
  );

  // ── Contenido demo (solo si la vitrina está vacía) ──
  const yaHayProyectos = (await prisma.proyecto.count()) > 0;
  if (yaHayProyectos) {
    console.log("La vitrina ya tiene proyectos; se omiten los datos demo.");
    return;
  }

  await prisma.proyecto.createMany({
    data: [
      {
        titulo: "Sistema de riego automatizado",
        descripcion:
          "Prototipo IoT para cultivos de la meseta de Popayán con sensores de humedad y app de monitoreo.",
        facultad: "Ingeniería",
        programa: "Ingeniería Informática",
        tipo: "EAFI",
        estado: "PUBLICADO",
        autor_id: usuarioId["santiago.m"],
        docente_aval_id: usuarioId["profe.ingenieria"],
        destacado: true,
      },
      {
        titulo: "Cartelera viva del Claustro",
        descripcion:
          "Intervención gráfica de los muros del Claustro con ilustración y tipografía local.",
        facultad: "Arte y Diseño",
        programa: "Diseño Visual",
        tipo: "COMUNIDAD",
        estado: "PUBLICADO",
        autor_id: usuarioId["luisa.m"],
        destacado: true,
      },
      {
        titulo: "App de trueque estudiantil",
        descripcion:
          "Plataforma para intercambiar libros y materiales entre estudiantes de la U.",
        facultad: "Ingeniería",
        programa: "Tecnología en Desarrollo de Software",
        tipo: "COMUNIDAD",
        estado: "PUBLICADO",
        autor_id: usuarioId["santiago.m"],
      },
      {
        titulo: "Bilingüismo en plazas públicas",
        descripcion:
          "Jornadas de conversación en inglés en espacios públicos de Popayán.",
        facultad: "Educación",
        programa: "Lic. Español e Inglés",
        tipo: "INSTITUCIONAL",
        estado: "PUBLICADO",
        autor_id: usuarioId["luisa.m"],
      },
      {
        titulo: "Dron cartográfico del Cauca",
        descripcion:
          "Levantamiento fotogramétrico de zonas rurales con dron de bajo costo.",
        facultad: "Ingeniería",
        programa: "Ingeniería Informática",
        tipo: "EAFI",
        estado: "EN_REVISION",
        autor_id: usuarioId["santiago.m"],
      },
      {
        titulo: "Emprendimiento sin plan",
        descripcion:
          "Idea de negocio presentada sin estudio de mercado ni presupuesto.",
        facultad: "Ciencias Sociales y de la Administración",
        programa: "Administración de Empresas",
        tipo: "COMUNIDAD",
        estado: "RECHAZADO",
        autor_id: usuarioId["luisa.m"],
        docente_aval_id: usuarioId["profe.ingenieria"],
        motivo_rechazo: "Falta estudio de mercado y presupuesto detallado.",
      },
    ],
  });

  const eventos = await prisma.$transaction([
    prisma.evento.create({
      data: {
        titulo: "Semana Universitaria UNIMAYOR",
        descripcion:
          "Actividades culturales, deportivas y académicas de toda la U.",
        tipo: "OFICIAL",
        fecha_inicio: new Date("2026-10-05T13:00:00Z"),
        fecha_fin: new Date("2026-10-09T23:00:00Z"),
        lugar: "Claustro la Encarnación",
        autor_id: usuarioId["admin.mayor"],
        imagen: "https://picsum.photos/seed/semana-unimayor/400/250",
      },
    }),
    prisma.evento.create({
      data: {
        titulo: "EAFI Ingeniería 2026-2",
        descripcion:
          "Encuentro académico de la Facultad de Ingeniería: muestra de proyectos en puestos.",
        tipo: "EAFI",
        fecha_inicio: new Date("2026-11-12T13:00:00Z"),
        fecha_fin: new Date("2026-11-13T23:00:00Z"),
        lugar: "Sede Bicentenario",
        facultad: "Ingeniería",
        edicion: "EAFI 2026-2",
        autor_id: usuarioId["profe.ingenieria"],
        imagen: "https://picsum.photos/seed/eafiingenieria/400/250",
      },
    }),
  ]);

  const eafi = eventos[1];
  const riego = await prisma.proyecto.findFirst({ where: { titulo: "Sistema de riego automatizado" } });
  const dron = await prisma.proyecto.findFirst({ where: { titulo: "Dron cartográfico del Cauca" } });

  await prisma.puesto.createMany({
    data: [
      {
        codigo: "MESA-01",
        edificio: "Bicentenario",
        piso: 1,
        salon: "Pabellón A",
        ubicacion: "Entrada principal, Pabellón A",
        estado: "OCUPADO",
        evento_id: eafi.id_evento,
        proyecto_id: riego?.id_proyecto ?? null,
      },
      {
        codigo: "MESA-02",
        edificio: "Bicentenario",
        piso: 1,
        salon: "Pabellón A",
        ubicacion: "Entrada principal, Pabellón A",
        estado: "OCUPADO",
        evento_id: eafi.id_evento,
        proyecto_id: dron?.id_proyecto ?? null,
      },
      {
        codigo: "MESA-03",
        edificio: "Bicentenario",
        piso: 2,
        salon: "Salón 204",
        ubicacion: "Segundo piso, Salón 204",
        estado: "DISPONIBLE",
        evento_id: eafi.id_evento,
      },
    ],
  });

  await prisma.aviso.createMany({
    data: [
      {
        titulo: "Convocatoria semilleros 2026-2",
        texto:
          "Inscripciones abiertas a semilleros de investigación hasta el 30 de octubre.",
        activo: true,
      },
      {
        titulo: "Mantenimiento Campus (cerrada)",
        texto: "Jornada de mantenimiento del 1 de septiembre ya finalizada.",
        activo: false,
      },
    ],
  });

  await prisma.notificacion.createMany({
    data: [
      {
        mensaje: 'Tu proyecto "Sistema de riego automatizado" fue publicado',
        usuario_id: usuarioId["santiago.m"],
        proyecto_id: riego?.id_proyecto ?? null,
      },
    ],
  });

  console.log("Seed completado: 3 roles, 4 usuarios (contraseña:", PASSWORD_DEMO + ")");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
