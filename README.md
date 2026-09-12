# 🏥 Medical Appointment System

<div align="center">

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Plataforma full-stack de gestión de turnos médicos con roles, autenticación JWT y arquitectura empresarial.**

</div>

---

## 📋 Descripción

Sistema web para la gestión integral de turnos médicos. Permite a los pacientes reservar citas con profesionales de distintas especialidades, a los médicos gestionar su agenda y confirmar/completar consultas, y al personal administrativo supervisar la operación completa.

## ✨ Características principales

- 🔐 **Autenticación JWT** con roles diferenciados (ADMIN / MÉDICO / PACIENTE)
- 👨‍⚕️ **Portal del médico** con agenda, confirmación y completado de turnos
- 🗓️ **Reserva de turnos** con validación de disponibilidad en tiempo real
- 🛡️ **Reglas de negocio robustas**: transiciones de estado, detección de solapamientos, fechas futuras
- 📊 **Dashboard adaptativo** según el rol del usuario logueado
- 🔍 **Búsqueda y filtrado** de médicos por especialidad
- 📖 **Swagger UI** integrado para documentación de la API
- 🐳 **Docker Compose** para despliegue con un solo comando

---

## 🏗️ Arquitectura

### Backend (Spring Boot)
```
src/main/java/com/medical/appointment/
├── config/           # Configuración (Security, OpenAPI, Beans)
├── controller/       # Capa REST — expone endpoints HTTP
├── service/          # Lógica de negocio
├── repository/       # Acceso a datos (Spring Data JPA)
├── entity/           # Entidades JPA (mapeadas a PostgreSQL)
├── dto/
│   ├── request/      # DTOs de entrada (validados con Bean Validation)
│   └── response/     # DTOs de salida (nunca se exponen entidades)
├── security/         # JWT Filter, JwtService
├── exception/        # GlobalExceptionHandler + excepciones custom
└── enums/            # Rol, EstadoTurno (con lógica de transición)
```

### Frontend (Angular 20)
```
src/app/
├── core/
│   ├── guards/       # authGuard, roleGuard, publicGuard
│   ├── interceptors/ # jwtInterceptor (auto-attach token + 401 redirect)
│   ├── models/       # Interfaces TypeScript (DTOs del backend)
│   └── services/     # AuthService + servicios de API
├── features/
│   ├── auth/         # Login, Register (Stepper)
│   ├── dashboard/    # Dashboard adaptativo por rol
│   ├── medicos/      # Listado con búsqueda/filtro + Detalle
│   ├── turnos/       # Reservar (Stepper), Mis Turnos, Agenda Médico
│   └── admin/        # CRUD Médicos, Especialidades, Vista global turnos
└── shared/
    └── components/
        └── layout/   # Sidebar + Navbar responsivo
```

---

## 🗃️ Modelo de Dominio

```
Usuario (1) ──── (1) Paciente ────< Turno
Usuario (1) ──── (1) Médico   ────< Turno
                 Médico >──── (1) Especialidad
                 Médico ────< Disponibilidad
```

### Estados de Turno y transiciones válidas
```
PENDIENTE ──→ CONFIRMADO ──→ COMPLETADO
    │               │
    └──────→ CANCELADO (estado final)
```

---

## 🚀 Inicio rápido

### Requisitos
- Docker y Docker Compose instalados

### Con Docker (recomendado)
```bash
git clone https://github.com/tu-usuario/medical-appointment-system.git
cd medical-appointment-system

docker compose up --build
```

| Servicio     | URL                                          |
|-------------|----------------------------------------------|
| Frontend    | http://localhost:80                           |
| Backend API | http://localhost:8080                         |
| Swagger UI  | http://localhost:8080/swagger-ui.html        |
| PostgreSQL  | localhost:5432 / DB: medical_db              |

---

### Desarrollo local (sin Docker)

#### Backend
```bash
# 1. Levantá solo PostgreSQL
docker compose up postgres -d

# 2. Ejecutá el backend
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Frontend
```bash
cd frontend
npm install
npm start       # Angular dev server con proxy → http://localhost:4200
```

---

## 🔑 Credenciales de prueba

| Rol       | Email                          | Contraseña   |
|-----------|--------------------------------|--------------|
| ADMIN     | admin@medical.com              | Admin1234!   |
| MÉDICO    | carlos.mendez@medical.com      | Admin1234!   |
| MÉDICO    | ana.garcia@medical.com         | Admin1234!   |
| PACIENTE  | juan.perez@email.com           | Admin1234!   |
| PACIENTE  | maria.gonzalez@email.com       | Admin1234!   |

---

## 📡 API REST — Endpoints principales

### Autenticación (pública)
| Método | Endpoint           | Descripción              |
|--------|--------------------|--------------------------|
| POST   | /auth/register     | Registro de paciente     |
| POST   | /auth/login        | Login → devuelve JWT     |

### Médicos
| Método | Endpoint                          | Rol requerido       |
|--------|-----------------------------------|---------------------|
| GET    | /medicos                          | Público             |
| GET    | /medicos/{id}                     | Público             |
| GET    | /medicos/especialidad/{id}        | Público             |
| POST   | /medicos                          | ADMIN               |
| PUT    | /medicos/{id}                     | ADMIN               |
| DELETE | /medicos/{id}                     | ADMIN               |

### Turnos
| Método | Endpoint                  | Rol requerido          |
|--------|---------------------------|------------------------|
| GET    | /turnos                   | ADMIN                  |
| GET    | /turnos/mis-turnos        | PACIENTE               |
| GET    | /turnos/agenda            | MEDICO                 |
| POST   | /turnos                   | PACIENTE               |
| PUT    | /turnos/{id}/cancelar     | PACIENTE / ADMIN       |
| PUT    | /turnos/{id}/confirmar    | MEDICO                 |
| PUT    | /turnos/{id}/completar    | MEDICO                 |

### Especialidades
| Método | Endpoint              | Rol requerido |
|--------|-----------------------|---------------|
| GET    | /especialidades       | Público        |
| POST   | /especialidades       | ADMIN          |
| PUT    | /especialidades/{id}  | ADMIN          |
| DELETE | /especialidades/{id}  | ADMIN          |

### Disponibilidades
| Método | Endpoint                        | Rol requerido      |
|--------|---------------------------------|--------------------|
| GET    | /disponibilidades/medico/{id}   | Autenticado        |
| POST   | /disponibilidades               | ADMIN / MEDICO     |
| DELETE | /disponibilidades/{id}          | ADMIN / MEDICO     |

---

## 🧪 Tests

```bash
cd backend
./mvnw test
```

Cobertura incluida:
- `AuthServiceTest` — registro, login, duplicados
- `TurnoServiceTest` — reserva, cancelación, transiciones de estado
- `MedicoServiceTest` — CRUD, soft delete, validaciones
- `EspecialidadServiceTest` — CRUD, duplicados
- `DisponibilidadServiceTest` — validación de solapamientos

---

## 🐳 Variables de entorno

| Variable       | Default              | Descripción             |
|---------------|----------------------|-------------------------|
| `DB_HOST`     | localhost            | Host PostgreSQL          |
| `DB_PORT`     | 5432                 | Puerto PostgreSQL        |
| `DB_NAME`     | medical_db           | Nombre de la base        |
| `DB_USER`     | postgres             | Usuario de la base       |
| `DB_PASSWORD` | postgres             | Contraseña               |
| `JWT_SECRET`  | (valor por defecto)  | Clave secreta JWT        |

---

## 🛠️ Stack tecnológico

| Capa        | Tecnología                                               |
|-------------|----------------------------------------------------------|
| Backend     | Java 21, Spring Boot 3.2, Spring Security, Hibernate     |
| Base Datos  | PostgreSQL 16, Flyway (migraciones)                      |
| Auth        | JWT (JJWT 0.12), BCrypt                                  |
| Validación  | Bean Validation (Jakarta), GlobalExceptionHandler        |
| Docs API    | SpringDoc OpenAPI 3 / Swagger UI                         |
| Frontend    | Angular 20 (Standalone), Angular Material, RxJS          |
| State       | Angular Signals                                          |
| DevOps      | Docker, Docker Compose, Nginx (SPA serving + proxy)      |
| Tests       | JUnit 5, Mockito, AssertJ                                |

---

## 📁 Estructura del proyecto

```
medical-appointment-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/medical/appointment/
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/        ← Flyway scripts
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/app/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── scripts/
│   ├── schema.sql                        ← DDL standalone
│   └── seed.sql                          ← Datos de prueba
├── docker-compose.yml
└── README.md
```

---

## 🤝 Contribuciones

1. Fork del repositorio
2. Creá tu rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: descripción clara del cambio'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrí un Pull Request

---

## 📄 Licencia

MIT License — libre para uso personal y comercial.

---

<div align="center">
Desarrollado por Sebastián Rodríguez - 2026
</div>
