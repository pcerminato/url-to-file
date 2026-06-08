# 1. Base Stage: Common setup for all environments
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
#USER root
RUN npm run build

# 2. Development Stage
FROM base AS development
CMD ["npm", "run", "dev"] 

# 3. Production Stage (only production files and dependencies and copy to lambda dir)
FROM base AS production
WORKDIR /app
COPY package*.json .
RUN npm ci --omit=dev
#USER root
ENV NODE_ENV=production
# Copy files to the lambda dir in the image
COPY . . 
CMD [ "npm", "start" ]