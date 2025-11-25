/**
 * Backend API para la app de red social.
 * -------------------------------------------------
 * Stack principal:
 *   - Node.js + Express 5 para la capa HTTP.
 *   - MySQL administrado con Sequelize ORM.
 *   - Sesiones persistentes en MySQL con express-session + connect-session-sequelize.
 *   - Autenticación local con Passport y contraseñas encriptadas con bcrypt.
 *   - Middlewares de seguridad (helmet), CORS y logging (morgan).
 *
 * Variables de entorno relevantes:
 *   - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (configuración MySQL)
 *   - SESSION_SECRET, SESSION_SAMESITE, SESSION_SECURE (config de cookies)
 *   - CLIENT_ORIGIN (dominio permitido para CORS)
 *   - PORT (puerto HTTP del backend)
 */

const express = require('express'); // Framework minimalista para crear APIs HTTP.
const helmet = require('helmet'); // Añade cabeceras de seguridad sensatas por defecto.
const cors = require('cors'); // Controla qué orígenes pueden consumir la API.
const morgan = require('morgan'); // Logger sencillo de peticiones HTTP.
const session = require('express-session'); // Implementa sesiones basadas en cookies.
const SequelizeStore = require('connect-session-sequelize')(session.Store); // Guarda sesiones en MySQL.
const passport = require('passport'); // Middleware de autenticación.
const LocalStrategy = require('passport-local').Strategy; // Estrategia email/contraseña para Passport.
const bcrypt = require('bcrypt'); // Librería para hashing seguro de contraseñas.

const sequelize = require('./database'); // Conexión configurada de Sequelize hacia MySQL.
const User = require('./models/user'); // Modelo Sequelize que representa a la tabla "users".
const Post = require('./models/post'); // Modelo Sequelize para las publicaciones del feed.
const UserPost = require('./models/userPost'); // Tabla intermedia que asigna publicaciones a usuarios.

const {
  PORT = 3000,
  SESSION_SECRET = 'supersecret',
  SESSION_SAMESITE = 'lax',
  SESSION_SECURE = 'false',
  CLIENT_ORIGIN = 'http://localhost:5173'
} = process.env;

// Calculamos una constante reutilizable para saber si debemos forzar cookies seguras.
const isSecureCookie = SESSION_SECURE === 'true';

// Configuramos un almacén de sesiones que utiliza la misma conexión de Sequelize.
// Esto permite que las sesiones sobrevivan a reinicios del servidor y múltiples réplicas.
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 60 * 60 * 1000, // Cada hora limpia sesiones expiradas.
  expiration: 7 * 24 * 60 * 60 * 1000 // Las sesiones viven una semana.
});

// Definimos las asociaciones entre usuarios y publicaciones a través de una tabla pivote.
User.belongsToMany(Post, { through: UserPost, foreignKey: 'userId' });
Post.belongsToMany(User, { through: UserPost, foreignKey: 'postId' });
User.hasMany(UserPost, { foreignKey: 'userId', as: 'postAssignments' });
Post.hasMany(UserPost, { foreignKey: 'postId', as: 'userAssignments' });
UserPost.belongsTo(User, { foreignKey: 'userId' });
UserPost.belongsTo(Post, { foreignKey: 'postId' });

// Sincronizamos la base de datos al arrancar para detectar problemas cuanto antes.
async function initializeDatabase() {
  try {
    // 1) Verificamos credenciales y alcanzabilidad del servidor MySQL.
    await sequelize.authenticate();
    // 2) Sincronizamos todos los modelos (crea tablas si no existen).
    await sequelize.sync();
  // 2.1) Insertamos publicaciones de ejemplo si la tabla está vacía.
  await ensureSeedPosts();
    // 3) Aseguramos que la tabla de sesiones exista.
    await sessionStore.sync();
    console.info('✅ Base de datos sincronizada (Sequelize)');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos');
    console.error(error);
    process.exit(1); // Detenemos la app para evitar correr sin base de datos.
  }
}

initializeDatabase();

// mapUserInstance se asegura de enviar solo los campos públicos al frontend.
function mapUserInstance(userInstance) {
  if (!userInstance) return null;

  const {
    id,
    firstName,
    lastName,
    email,
    phone,
    photoUrl,
    bio,
    createdAt,
    updatedAt
  } = userInstance.toJSON();

  return { id, firstName, lastName, email, phone, photoUrl, bio, createdAt, updatedAt };
}

const DEFAULT_FEED_POST_COUNT = 2;

const seedPostsPayload = [
  {
    authorName: 'Juan Pérez',
    authorSubtitle: 'Ingeniero de Software',
    authorAvatar: 'https://i.pravatar.cc/150?img=12',
    content:
      'Buenas chavales, saludos a la familia, hoy programé una app web muy chula que flipas flipas macho flipas',
    mediaUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    likeCount: 142,
    commentCount: 26,
    shareCount: 11
  },
  {
    authorName: 'Juan Pérez',
    authorSubtitle: 'Ingeniero de Software',
    authorAvatar: 'https://i.pravatar.cc/150?img=49',
    content:
      'Hoy es día de trabajo, coloquialmente conocido como "chamba", en el lenguaje vulgar de lorem ipsum dolor sit amet consectetur adipiscing elit, así es',
    mediaUrl: null,
    likeCount: 87,
    commentCount: 14,
    shareCount: 6
  },
  {
    authorName: 'Laura Martínez',
    authorSubtitle: 'UX Researcher',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    content:
      'Tuve junta con mis compañeros de trabajo pero no saben nada de diseño ni de usabilidad ni de experiencia de usuario ni de nada',
    mediaUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    likeCount: 203,
    commentCount: 48,
    shareCount: 19
  },
  {
    authorName: 'Carlos Gómez',
    authorSubtitle: 'Data Scientist',
    authorAvatar: 'https://i.pravatar.cc/150?img=33',
    content:
      'Programando para hackear la nasa',
    mediaUrl: 'https://images.unsplash.com/photo-1517148815978-75f6acaaf32c',
    likeCount: 64,
    commentCount: 17,
    shareCount: 5
  }
];

async function ensureSeedPosts() {
  const postCount = await Post.count();
  if (postCount > 0) {
    return;
  }
  await Post.bulkCreate(seedPostsPayload);
  console.info('✅ Publicaciones de ejemplo insertadas');
}

function mapPostInstance(postInstance, assignmentInstance = null) {
  if (!postInstance) return null;

  const {
    id,
    authorName,
    authorSubtitle,
    authorAvatar,
    content,
    mediaUrl,
    likeCount,
    commentCount,
    shareCount,
    createdAt,
    updatedAt
  } = postInstance.toJSON();

  return {
    id,
    authorName,
    authorSubtitle,
    authorAvatar,
    content,
    mediaUrl,
    likes: likeCount,
    comments: commentCount,
    shares: shareCount,
    createdAt,
    updatedAt,
    assignedOrder: assignmentInstance?.order ?? null,
    assignedAt: assignmentInstance?.createdAt ?? null
  };
}

async function assignRandomPostsToUser(userId, count = DEFAULT_FEED_POST_COUNT) {
  const allPosts = await Post.findAll();
  if (allPosts.length === 0) {
    return [];
  }

  const shuffled = [...allPosts].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  const insertPayload = selected.map((post, index) => ({
    userId,
    postId: post.id,
    order: index
  }));

  // Insert posts one by one to handle duplicates (Db2 doesn't support ignoreDuplicates)
  for (const payload of insertPayload) {
    try {
      await UserPost.create(payload);
    } catch (error) {
      // Ignore duplicate key errors
      if (!error.message.includes('duplicate') && !error.message.includes('UNIQUE')) {
        throw error;
      }
    }
  }

  return UserPost.findAll({
    where: { userId },
    include: [{ model: Post }],
    order: [
      ['order', 'ASC'],
      ['createdAt', 'ASC']
    ]
  });
}

async function getUserFeed(userId) {
  let assignments = await UserPost.findAll({
    where: { userId },
    include: [{ model: Post }],
    order: [
      ['order', 'ASC'],
      ['createdAt', 'ASC']
    ]
  });

  if (assignments.length === 0) {
    assignments = await assignRandomPostsToUser(userId);
  }

  return assignments
    .map((assignment) => mapPostInstance(assignment.Post, assignment))
    .filter(Boolean);
}

// Funciones auxiliares de acceso a datos (más legibles y testeables).
async function getUserByEmail(email) {
  return User.findOne({ where: { email } });
}

async function getUserById(id) {
  return User.findByPk(id);
}

async function createUser({ firstName, lastName, email, phone, photoUrl, bio, passwordHash }) {
  return User.create({ firstName, lastName, email, phone, photoUrl, bio, passwordHash });
}

async function updateUser(id, updates) {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }

  // Solo incluimos en el payload los campos presentes en la petición.
  const payload = {};
  if (updates.firstName !== undefined) payload.firstName = updates.firstName;
  if (updates.lastName !== undefined) payload.lastName = updates.lastName;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.photoUrl !== undefined) payload.photoUrl = updates.photoUrl;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.passwordHash !== undefined) payload.passwordHash = updates.passwordHash;

  await user.update(payload);
  return user;
}

async function deleteUser(id) {
  await User.destroy({ where: { id } });
}

// === Configuración de Passport (login local con email + contraseña) ===
passport.use(
  new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
    try {
      const user = await getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'El correo no está registrado.' });
      }

      // Comparamos la contraseña enviada con el hash guardado en la base de datos.
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return done(null, false, { message: 'Contraseña incorrecta.' });
      }

      return done(null, mapUserInstance(user));
    } catch (error) {
      return done(error);
    }
  })
);

// Guardamos en sesión únicamente el ID del usuario para mantener la cookie ligera.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// En cada petición autenticada reconstruimos el usuario desde la base de datos.
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, mapUserInstance(user));
  } catch (error) {
    done(error);
  }
});

// === Instanciamos la aplicación Express y configuramos middlewares globales ===
const app = express();

app.set('trust proxy', 1); // Necesario si se despliega detrás de un proxy/cargador de balanceo (ej. Render, Heroku).

// Middlewares de seguridad y utilitarios.
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true // Permitimos el envío de cookies desde el frontend.
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones con cookies firmadas.
app.use(
  session({
    name: 'sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: isSecureCookie, // Solo enviamos la cookie por HTTPS si SESSION_SECURE=true.
      sameSite: SESSION_SAMESITE,
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware que protege rutas privadas.
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'No autorizado. Inicia sesión para continuar.' });
}

// Pequeña utilidad para capturar errores en funciones async y delegarlos a Express.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// === Rutas de autenticación ===
app.post(
  '/api/auth/signup',
  asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, phone = null, photoUrl = null, bio = null } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'firstName, lastName, email y password son obligatorios.' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Ya existe un usuario con este correo.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userInstance = await createUser({
      firstName,
      lastName,
      email,
      phone,
      photoUrl,
      bio,
      passwordHash
    });
    const user = mapUserInstance(userInstance);

    await assignRandomPostsToUser(user.id);

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(201).json({ user });
    });
  })
);

app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: info?.message || 'Credenciales inválidas.' });
    }
    req.logIn(user, async (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      try {
        await assignRandomPostsToUser(user.id);
      } catch (feedError) {
        console.error('Error asignando publicaciones al iniciar sesión:', feedError);
      }
      return res.json({ user });
    });
  })(req, res, next);
});

app.post('/api/auth/logout', requireAuth, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return next(destroyErr);
      }
      res.clearCookie('sid');
      return res.json({ message: 'Sesión cerrada correctamente.' });
    });
  });
});

// === Rutas de usuario autenticado ===
app.get('/api/users/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

app.get(
  '/api/posts/feed',
  requireAuth,
  asyncHandler(async (req, res) => {
    const posts = await getUserFeed(req.user.id);
    return res.json({ posts });
  })
);

app.put(
  '/api/users/me',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const { firstName, lastName, phone, photoUrl, bio, password } = req.body;
    const updates = { firstName, lastName, phone, photoUrl, bio };

    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await updateUser(req.user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const mapped = mapUserInstance(updatedUser);
    req.login(mapped, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ user: mapped });
    });
  })
);

app.delete(
  '/api/users/me',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    await deleteUser(req.user.id);
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return next(destroyErr);
        }
        res.clearCookie('sid');
        return res.status(204).send();
      });
    });
  })
);

// === Healthcheck simple para monitoreo ===
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// === Manejadores de error ===
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Ocurrió un error inesperado.', details: err.message });
});

module.exports = { app, sequelize, PORT };
