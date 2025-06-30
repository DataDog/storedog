# compile via gradle
FROM gradle:jdk11 AS temp_build_image
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

ENV APP_HOME=/usr/app/ \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_USER=postgres \
    POSTGRES_HOST=postgres
    ADS_SERVER_PORT=3030

WORKDIR $APP_HOME
COPY --from=temp_build_image $APP_HOME/build/libs/*.jar store-ads.jar

ENTRYPOINT ["java", "-jar", "store-ads.jar"]
