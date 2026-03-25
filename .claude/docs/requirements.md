# Requerimientos del Proyecto: Personal Finance & Crypto Tracker (MVP)

## Descripción General
Aplicación web para la gestión de finanzas personales que permite a los usuarios consolidar su patrimonio neto en una moneda base, integrando tanto cuentas tradicionales (Fiat) como portafolios de criptomonedas. 

## Stack Tecnológico
- Frontend: Next.js
- Backend: Django / Django REST Framework
- Base de Datos: PostgreSQL
- Infraestructura: Docker & Docker Compose
- Tareas en Segundo Plano: Celery + Redis

## Módulos y Funcionalidades (Fase 1 - MVP)

### 1. Autenticación y Configuración de Usuario
- **REQ-1.1:** Registro e inicio de sesión de usuarios (JWT).
- **REQ-1.2:** Configuración de perfil: Selección de la "Moneda Base" (ej. USD, BOB, EUR) para la consolidación del patrimonio.

### 2. Gestión de Activos (Assets) y Cuentas (Wallets)
- **REQ-2.1:** Soporte nativo para múltiples tipos de activos (`FIAT`, `CRYPTO`).
- **REQ-2.2:** Creación, edición y eliminación de cuentas/billeteras asignadas a un activo específico (ej. "Cuenta Banco", "Billetera Fría BTC").
- **REQ-2.3:** Visualización del saldo actual de cada cuenta.

### 3. Registro de Transacciones (El Ledger)
- **REQ-3.1:** Registro de ingresos manuales con categorización (ej. Salario, Rendimientos).
- **REQ-3.2:** Registro de gastos manuales con categorización.
- **REQ-3.3:** Transferencias entre cuentas (ej. mover USD de cuenta bancaria a cuenta de exchange para comprar cripto).
- **REQ-3.4:** Capacidad de registrar comisiones (fees) en las transacciones de transferencia.

### 4. Sincronización de Mercado (Background Jobs)
- **REQ-4.1:** Tarea programada (Celery worker) que consulte una API externa (ej. CoinGecko) cada cierto tiempo (ej. cada 15 min).
- **REQ-4.2:** Actualización en la base de datos del precio actual de las criptomonedas soportadas con respecto al USD.

### 5. Dashboard y Consolidación (Frontend)
- **REQ-5.1:** Cálculo en tiempo real del Patrimonio Neto Total consolidado en la Moneda Base del usuario.
- **REQ-5.2:** Gráficos de distribución del portafolio (Porcentaje Fiat vs. Cripto).
- **REQ-5.3:** Historial de las transacciones más recientes.