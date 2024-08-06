FROM node:lts-alpine

#Install Java
RUN apk add openjdk21

#Set work directory
WORKDIR /app

#Copy Lavalink files
COPY Lavalink.jar .
COPY application.yml .

#Run Lavalink
CMD [ "java", "-jar", "Lavalink.jar" ]