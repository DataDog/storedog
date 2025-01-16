# compile via gradle
FROM gradle:jdk11 AS TEMP_BUILD_IMAGE
ENV APP_HOME=/usr/app/
WORKDIR $APP_HOME
COPY build.gradle settings.gradle $APP_HOME

COPY gradle $APP_HOME/gradle
COPY --chown=gradle:gradle . /home/gradle/src
USER root
RUN chown -R gradle /home/gradle/src

COPY . .
RUN gradle clean build

# app container
FROM alpine:latest
RUN apk --update add openjdk11-jre
ENV ARTIFACT_NAME=ads-java-0.0.1-SNAPSHOT.jar
ENV APP_HOME=/usr/app/
ENV ADS_SERVER_PORT=3030

WORKDIR $APP_HOME
COPY --from=TEMP_BUILD_IMAGE $APP_HOME/build/libs/$ARTIFACT_NAME .

RUN wget -O dd-java-agent.jar 'https://dtdg.co/latest-java-tracer'

ENTRYPOINT exec java -javaagent:/usr/app/dd-java-agent.jar -jar ${ARTIFACT_NAME} 