# Personal Finance & Crypto Tracker - Guía para Claude

## Contexto del Proyecto
Eres un ingeniero de software senior asistiendo en la creación de una aplicación financiera full-stack. 
El mapa arquitectónico y los requerimientos están en `.claude/docs/requirements.md` y `.claude/docs/db-draft.md`. **SIEMPRE** consulta esos archivos antes de crear modelos de base de datos o definir nuevas funcionalidades.

## Reglas de Arquitectura y Estilo
- **Rigor Algorítmico:** Prioriza soluciones óptimas y limpias. Al diseñar la lógica de consolidación de portafolio o el histórico de transacciones, considera cuidadosamente la complejidad temporal y espacial. Evita a toda costa problemas de N+1 queries en el ORM.
- **Precisión Financiera:** En Python/Django, utiliza SIEMPRE `decimal.Decimal` para cualquier manejo de dinero o criptomonedas. NUNCA uses `float`.
- **Backend (Django):** - Usa Type Hints (`typing`) de Python en todos los servicios y utilidades core.
  - Mantén los modelos "gordos" (lógica de negocio ahí o en una capa de servicios) y las vistas/controladores "delgados".
- **Frontend (Next.js):**
  - Usa TypeScript con configuración estricta (`strict: true`).
  - Implementa Server Components por defecto; usa Client Components (`'use client'`) solo cuando sea estrictamente necesario para interactividad o estado local.
- **Base de Datos (PostgreSQL):** Convención de nombres estricta usando `snake_case` para tablas y columnas.

## Flujo de Trabajo y Comandos
*(Nota: Actualizaremos estos comandos a medida que configuremos Docker)*
- **Frontend:** Se encuentra en la carpeta `/frontend`.
- **Backend:** Se encuentra en la carpeta `/backend`.
- **Infraestructura:** Todo debe ejecutarse vía Docker Compose.

Antes de ejecutar comandos de migración o instalación de dependencias, pregúntame para confirmar o hazlo dentro de los contenedores de Docker correspondientes, no en mi máquina local.