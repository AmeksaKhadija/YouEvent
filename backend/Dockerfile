# Dockerfile for Backend (NestJS)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Install NestJS CLI globally to ensure availability
RUN npm install -g @nestjs/cli
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm", "run", "start:dev"]
