# Dockerfile for Frontend
# Add your docker build steps here
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
