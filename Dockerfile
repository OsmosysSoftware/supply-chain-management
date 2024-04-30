### Stage 0: Build ###
#--------------------------------------
# Use an official Node runtime as a parent image
FROM node:20 AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Angular CLI Globally
RUN npm install -g @angular/cli

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular app for production
RUN npm run build:prod

### Stage 1: Run ###
#--------------------------------------
# Defining nginx image to be used
FROM nginx:latest AS ngi

# Fetch APP_NAME from docker-compose
ARG APP_NAME

# Create App Path for build files for Angular 17 and above projects
# For versions older than 17, replace APP_PATH with /usr/src/app/dist/*
ENV APP_PATH=/usr/src/app/dist/${APP_NAME}/browser

# Copy the built Angular app to the default Nginx public folder
COPY --from=builder $APP_PATH /usr/share/nginx/html/

# Need to make nginx config file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
