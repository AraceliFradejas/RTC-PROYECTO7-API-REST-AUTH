# Memoria del proyecto

## API REST AUTH - Hogwarts

**Autora:** Araceli Fradejas Muñoz

**Formación:** Módulo 5: Backend [Node | Mongo | API REST], máster Rock The Code, The Power Tech School

## 1. Objetivo

El objetivo es desarrollar desde cero una API REST autenticada con una temática diferente a proyectos anteriores. La aplicación representa una pequeña academia inspirada en Hogwarts, donde los usuarios pertenecen a una casa y tienen asignada una varita.

El proyecto demuestra:

- Creación de un servidor con Express.
- Conexión con MongoDB Atlas mediante Mongoose.
- Diseño de modelos relacionados.
- CRUD completo de todas las colecciones.
- Registro y login seguros.
- Autenticación mediante JWT.
- Autorización mediante roles.
- Protección de rutas con middleware.
- Comprobación manual de la API con Insomnia.

## 2. Temática y lógica de negocio

La temática permite representar de forma sencilla los permisos y las relaciones:

- Los usuarios con rol `user` representan estudiantes.
- Los usuarios con rol `admin` representan profesores o responsables de la academia.
- Cada usuario pertenece a una casa.
- Cada usuario utiliza una varita.
- Los administradores gestionan usuarios, casas y varitas.
- Un usuario normal solo puede consultar o modificar sus propios datos.

Los nombres técnicos de los roles son `user` y `admin` porque coinciden exactamente con el enunciado del proyecto.

## 3. Arquitectura

El proyecto está separado por responsabilidades:

```text
Petición HTTP
     |
     v
Express Router
     |
     v
Middleware JWT y permisos
     |
     v
Modelo de Mongoose
     |
     v
MongoDB Atlas
     |
     v
Respuesta JSON
```

### Carpetas principales

| Carpeta | Responsabilidad |
| --- | --- |
| `config` | Conexión con MongoDB Atlas |
| `models` | Esquemas de Mongoose |
| `routes` | Endpoints y lógica de cada recurso |
| `middleware` | Verificación del token, rol e identificadores |
| `seeds` | Carga inicial de casas y varitas |
| `screenshots` | Evidencias visuales de Atlas e Insomnia |

## 4. Modelos de datos

### User

El modelo `User` contiene nombre, email, contraseña, rol, casa y varita.

Decisiones importantes:

- El email es obligatorio, único, se guarda en minúsculas y se valida.
- La contraseña tiene un mínimo de seis caracteres antes del cifrado.
- El campo `password` utiliza `select: false` para no aparecer por defecto en consultas.
- El rol solo admite `user` y `admin`.
- El rol predeterminado es `user`.
- `house` y `wand` son referencias mediante `ObjectId`.

### House

El modelo `House` contiene:

- Nombre único.
- Fundador.
- Lista de colores.
- Lista de características.

### Wand

El modelo `Wand` contiene:

- Tipo de madera.
- Núcleo.
- Longitud entre 8 y 18 pulgadas.

### Relaciones

Las dos relaciones se definen en `User`:

```text
User.house -> House._id
User.wand  -> Wand._id
```

Al consultar usuarios se utiliza `populate()` para mostrar los documentos de casa y varita en lugar de presentar solamente sus identificadores.

## 5. Semilla

La semilla carga cuatro casas y cuatro varitas.

Casas:

- Gryffindor.
- Slytherin.
- Hufflepuff.
- Ravenclaw.

La semilla utiliza operaciones `upsert`. Esto permite ejecutarla varias veces:

- Si un elemento no existe, se crea.
- Si ya existe, se actualiza.
- No se eliminan colecciones.
- No se rompen relaciones existentes.

Comando:

```bash
npm run seed
```

## 6. Registro y autenticación

### Registro

El registro comprueba:

1. Presencia y tipo de los campos obligatorios.
2. Longitud de la contraseña antes del cifrado.
3. Formato de los identificadores.
4. Existencia real de casa y varita.
5. Ausencia de otro usuario con el mismo email.
6. Cifrado de la contraseña con bcrypt.
7. Creación obligatoria con rol `user`.

El campo `role` enviado por el cliente se ignora. De esta manera, nadie puede registrarse directamente como administrador.

### Login

El login busca el usuario por email y solicita expresamente a Mongoose el hash oculto. bcrypt compara la contraseña recibida con el hash almacenado. Si coincide, se genera un JWT con dos horas de validez.

El token guarda el identificador del usuario. En cada petición protegida, el middleware vuelve a consultar MongoDB para utilizar el rol actual. Por este motivo, un cambio de rol en Atlas se aplica sin necesidad de generar otro token mientras el token anterior continúe vigente.

## 7. Autorización

### Middleware `verifyToken`

1. Busca la cabecera `Authorization`.
2. Comprueba el prefijo `Bearer`.
3. Verifica la firma y caducidad del JWT.
4. Busca el usuario en MongoDB.
5. Guarda el usuario en `req.user`.
6. Permite continuar la petición.

### Middleware `isAdmin`

Comprueba que `req.user.role` sea `admin`. Si no lo es, responde con `403 Forbidden`.

### Diferencia entre 401 y 403

| Estado | Significado |
| --- | --- |
| `401 Unauthorized` | Falta el token o no es válido |
| `403 Forbidden` | El usuario está autenticado, pero no tiene permisos |

## 8. Reglas de seguridad

- Las contraseñas se almacenan cifradas.
- Las respuestas nunca incluyen `password`.
- El registro siempre crea el rol `user`.
- Solo un administrador puede modificar roles.
- Se utiliza una lista blanca de campos modificables.
- Se validan los identificadores antes de consultar MongoDB.
- Se comprueba que las relaciones existan.
- No se puede eliminar una casa asignada a usuarios.
- No se puede eliminar una varita asignada a usuarios.
- Las credenciales erróneas no revelan si un email existe.
- Los errores internos no exponen detalles sensibles.
- `.env` y `node_modules` están excluidos de Git.

## 9. CRUD comprobado

### Usuarios

| Operación | Endpoint | Resultado comprobado |
| --- | --- | --- |
| Crear | `POST /api/auth/register` | `201 Created` y rol forzado a `user` |
| Leer todos | `GET /api/users` | `403` como user y `200` como admin |
| Leer uno | `GET /api/users/:id` | Acceso para propietario o admin |
| Actualizar | `PUT /api/users/:id` | Datos editables y cambio de rol solo por admin |
| Eliminar | `DELETE /api/users/:id` | Eliminación propia o por administrador |

### Casas

| Operación | Método | Resultado comprobado |
| --- | --- | --- |
| Crear | POST | `201 Created` |
| Leer | GET | `200 OK` |
| Actualizar | PUT | `200 OK` y nueva fecha `updatedAt` |
| Eliminar | DELETE | `200 OK`; consulta posterior `404` |

### Varitas

| Operación | Método | Resultado comprobado |
| --- | --- | --- |
| Crear | POST | `201 Created` |
| Leer | GET | `200 OK` |
| Actualizar | PUT | `200 OK` y datos modificados |
| Eliminar | DELETE | `200 OK`; consulta posterior `404` |

## 10. Pruebas de roles realizadas

1. Hermione se registró intentando enviar `role: admin`.
2. La API la creó correctamente como `user`.
3. Sin token, `GET /api/users` respondió `401`.
4. Con token de usuario, respondió `403`.
5. El primer rol `admin` se asignó manualmente desde MongoDB Atlas.
6. Con el mismo token, la ruta respondió `200` porque el middleware consultó el nuevo rol.
7. Hermione ascendió a Ron mediante `PUT /api/users/:id`.
8. Ron volvió a `user` y eliminó su propia cuenta.
9. Hermione eliminó a Harry como administradora.

## 11. Lo que he aprendido

Al desarrollar esta API he entendido mejor cómo se conectan la autenticación, los permisos y los datos. Estas son las ideas que más me ha ayudado a practicar:

- `bcrypt` sirve para guardar una contraseña de forma segura. La API comprueba primero que la contraseña original tenga al menos seis caracteres y después guarda el hash, no la contraseña que escribió la persona.
- Un JWT funciona como una credencial temporal. En el login se firma un token con el identificador del usuario y una duración de dos horas. En las rutas protegidas, `verifyToken` comprueba que la firma sea válida y vuelve a buscar al usuario en MongoDB.
- Entendí mejor la diferencia entre `401` y `403`: el `401` significa que falta el token o no es válido; el `403` significa que la persona sí está identificada, pero no tiene permiso para esa acción.
- La autenticación y la autorización son cosas distintas. `verifyToken` identifica al usuario y guarda sus datos en `req.user`; `isAdmin` comprueba después si su rol permite continuar.
- El registro fuerza siempre el rol `user`, aunque alguien intente enviar `role: admin` en el body. El primer administrador se asigna manualmente en Atlas y, a partir de ahí, puede cambiar los roles desde la API.
- Las relaciones de `User` con `House` y `Wand` se guardan como `ObjectId`. Con `populate()` puedo devolver los datos de la casa y la varita sin duplicarlos dentro del usuario.
- Antes de guardar un usuario se comprueba que la casa y la varita existan. Del mismo modo, una casa o una varita no se puede borrar si todavía está asignada a un usuario, porque se dejaría una relación rota.
- La lista blanca de campos modificables evita que un usuario cambie por su cuenta valores sensibles, especialmente el rol. No basta con comprobar quién hace la petición; también hay que decidir qué campos puede modificar.
- La semilla usa `upsert`: si la casa o la varita ya existe, se actualiza; si no existe, se crea. Así puedo ejecutar `npm run seed` varias veces sin borrar colecciones ni generar duplicados.
- También he aprendido a probar los errores como parte del funcionamiento normal de la API. Las respuestas `400`, `401`, `403`, `404` y `409` ayudan a explicar qué ha ocurrido y a proteger la integridad de los datos.

Estas decisiones me han hecho ver que proteger una API no consiste únicamente en poner un token. Hay que validar los datos, comprobar las relaciones, separar identificación de permisos y limitar lo que cada usuario puede hacer.

## 12. Incidencias encontradas y soluciones

### Puerto 5000 ocupado

macOS utilizaba el puerto 5000 mediante Control Center. La API se configuró en el puerto 5001.

### Texto incorrecto dentro de `.env`

El archivo contenía líneas copiadas desde el terminal. Se limpió para conservar solamente variables con formato `NOMBRE=valor`.

### Registro sin acceso a IDs

El registro necesita una casa y una varita. Las consultas de casas y varitas se dejaron públicas para que un usuario pueda obtener esos identificadores antes de registrarse.

### Semilla destructiva

La versión inicial eliminaba casas y varitas antes de insertarlas. Se sustituyó por `upsert` para evitar romper relaciones.

### Validación de contraseña

Validar solamente el hash no garantiza la longitud de la contraseña original. Por ello se comprueba su longitud antes de llamar a bcrypt.

### Datos sensibles en capturas

Los tokens, contraseñas y hashes visibles se ocultaron o se excluyeron de Git. Las capturas seleccionadas para la documentación no muestran credenciales utilizables.

## 13. Pruebas y evidencias

### MongoDB Atlas

![Casas cargadas mediante la semilla](screenshots/MongoDBAtlas3-HousesCollection.png)

![Varitas cargadas mediante la semilla](screenshots/MongoDBAtlas4-WandsCollection.png)

### Seguridad y permisos

![Acceso sin token](screenshots/Insomnia7-SinToken401.png)

![Usuario sin permisos de administrador](screenshots/Insomnia8-SinPermisoAdmin403.png)

![Administrador lista usuarios](screenshots/Insomnia9-AdminListaUsuarios.png)

![Administrador asciende otro usuario](screenshots/Insomnia11-AdminAsciendeUsuario.png)

### Eliminación de usuarios

![Usuario elimina su propia cuenta](screenshots/Insomnia24-UsuarioSeElimina.png)

![Administrador elimina otro usuario](screenshots/Insomnia26-UsuarioNuevo2SeElimina.png)

## 14. Correspondencia con los requisitos

| Requisito | Implementación |
| --- | --- |
| Servidor Express | `server.js` |
| MongoDB Atlas con Mongoose | `config/db.js` |
| Tres modelos | `User`, `House` y `Wand` |
| Semilla | `seeds/seed.js` |
| Dos relaciones | `User.house` y `User.wand` |
| CRUD completo | 16 endpoints documentados |
| Dos roles | `user` y `admin` |
| Registro solo como user | Rol forzado en `/api/auth/register` |
| Primer admin manual | Cambio documentado en Atlas |
| Admin modifica roles | `PUT /api/users/:id` |
| Admin elimina usuarios | `DELETE /api/users/:id` |
| Usuario se elimina | Mismo endpoint con verificación de propietario |
| Middleware de token | `verifyToken` |
| README de endpoints | `README.md` |
| Repositorio público | Repositorio de GitHub del proyecto |

## 15. Conclusión

El proyecto cumple los requisitos mínimos y añade medidas adicionales de validación, seguridad e integridad referencial. Las pruebas realizadas muestran no solo los casos correctos, sino también errores esperados como `400`, `401`, `403`, `404` y `409`.

La separación entre modelos, rutas, middleware, configuración y semilla facilita comprender y mantener la API. La documentación y las evidencias permiten reproducir la instalación y comprobar el comportamiento sin necesidad de desarrollar un frontend.
