FROM node:20-alpine

WORKDIR /app

# Copiar solo los archivos de dependencias primero para aprovechar el caché de capas de Docker
COPY package.json package-lock.json* ./

# Usamos npm install. Si luego decides usar pnpm o yarn, lo ajustamos aquí.
RUN npm install

# Copiar el resto del código
COPY . .