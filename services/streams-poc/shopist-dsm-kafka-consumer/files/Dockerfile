FROM public.ecr.aws/amazoncorretto/amazoncorretto:17 AS builder

WORKDIR /consumer

ARG APP_ROOT=app
ENV APP_ROOT=${APP_ROOT}
COPY ${APP_ROOT}/dd-java-agent.jar /consumer/dd-java-agent.jar

COPY ${APP_ROOT}/build.gradle ${APP_ROOT}/gradlew ${APP_ROOT}/settings.gradle /consumer/
COPY ${APP_ROOT}/gradle /consumer/gradle
COPY ${APP_ROOT}/src /consumer/src

RUN /consumer/gradlew --no-daemon bootjar

FROM public.ecr.aws/amazoncorretto/amazoncorretto:17

WORKDIR /app

COPY --from=builder /consumer/build/libs/data-streams-kafka-java-demo-consumer.jar /app/data-streams-kafka-java-demo-consumer.jar
COPY --from=builder /consumer/dd-java-agent.jar /app/dd-java-agent.jar

EXPOSE 8080

ENTRYPOINT ["java", "-javaagent:/app/dd-java-agent.jar", "-jar", "/app/data-streams-kafka-java-demo-consumer.jar"]
