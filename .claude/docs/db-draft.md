# Modelo de Datos (PostgreSQL) - Borrador Inicial

## Decisiones de Arquitectura
- **Precisión de Criptoactivos:** Se utilizará `DECIMAL(24, 8)` o superior para todos los campos de montos y balances para soportar las fracciones de criptomonedas y prevenir errores aritméticos de punto flotante.
- **Fuente de la Verdad:** El balance de las cuentas puede guardarse como un caché en la tabla `accounts`, pero la fuente real de la verdad siempre debe poder recalcularse sumando/restando la tabla `transactions`.

## Entidades y Relaciones

### 1. `users`
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `base_currency_id` (FK -> assets.id)
- `created_at` (TIMESTAMP)

### 2. `assets` (Catálogo de monedas y criptos)
- `id` (VARCHAR, Primary Key) - Ej: 'USD', 'BOB', 'BTC', 'ETH'
- `name` (VARCHAR) - Ej: 'US Dollar', 'Bitcoin'
- `type` (ENUM: 'FIAT', 'CRYPTO')
- `current_price_usd` (DECIMAL) - El precio actual contra el USD. Para el USD será 1.
- `last_price_update` (TIMESTAMP) - Cuándo se actualizó el precio por el Celery worker.

### 3. `accounts` (Cuentas bancarias o billeteras del usuario)
- `id` (UUID, Primary Key)
- `user_id` (FK -> users.id)
- `asset_id` (FK -> assets.id) - En qué moneda opera esta cuenta.
- `name` (VARCHAR) - Ej: 'Ahorros BCP', 'Binance Spot'
- `balance` (DECIMAL) - Saldo actual (Caché derivado de transacciones).
- `created_at` (TIMESTAMP)

### 4. `categories`
- `id` (UUID, Primary Key)
- `user_id` (FK -> users.id, Nullable para categorías por defecto del sistema)
- `name` (VARCHAR)
- `type` (ENUM: 'INCOME', 'EXPENSE')

### 5. `transactions` (El registro inmutable)
- `id` (UUID, Primary Key)
- `user_id` (FK -> users.id)
- `type` (ENUM: 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER')
- `amount` (DECIMAL(24, 8)) - Monto transaccionado.
- `fee_amount` (DECIMAL(24, 8)) - Comisiones de red o bancarias de la transacción.
- `account_origin_id` (FK -> accounts.id, Nullable si es un DEPOSIT externo)
- `account_destination_id` (FK -> accounts.id, Nullable si es un WITHDRAWAL externo)
- `category_id` (FK -> categories.id, Nullable en transferencias)
- `exchange_rate` (DECIMAL, Nullable) - Tipo de cambio en el momento exacto de la transacción (vital para cálculos de P&L futuros).
- `timestamp` (TIMESTAMP) - Fecha y hora exacta de la operación.
- `description` (TEXT, Nullable)