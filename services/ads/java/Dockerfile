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

ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA

ENV APP_HOME=/usr/app/ \
    ADS_SERVER_PORT=3030 \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_USER=postgres \
    POSTGRES_HOST=postgres \
    DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL} \
    DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

WORKDIR $APP_HOME
COPY --from=temp_build_image $APP_HOME/build/libs/*.jar store-ads.jar

RUN wget -O dd-java-agent.jar 'https://dtdg.co/latest-java-tracer'

ENTRYPOINT ["java", "-javaagent:/usr/app/dd-java-agent.jar", "-jar", "store-ads.jar"]
