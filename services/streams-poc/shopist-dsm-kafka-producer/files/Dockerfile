FROM public.ecr.aws/amazoncorretto/amazoncorretto:17 as builder

WORKDIR /producer

ARG APP_ROOT=app
ENV APP_ROOT=${APP_ROOT}
COPY ${APP_ROOT}/dd-java-agent.jar /producer/dd-java-agent.jar

COPY ${APP_ROOT}/build.gradle ${APP_ROOT}/gradlew ${APP_ROOT}/settings.gradle /producer/
COPY ${APP_ROOT}/gradle /producer/gradle
COPY ${APP_ROOT}/src /producer/src

RUN /producer/gradlew --no-daemon bootjar

FROM public.ecr.aws/amazoncorretto/amazoncorretto:17

WORKDIR /app

COPY --from=builder /producer/build/libs/data-streams-kafka-java-demo-producer.jar /app/data-streams-kafka-java-demo-producer.jar
COPY --from=builder /producer/dd-java-agent.jar /app/dd-java-agent.jar

EXPOSE 8080

ENTRYPOINT ["java", "-javaagent:/app/dd-java-agent.jar", "-jar", "/app/data-streams-kafka-java-demo-producer.jar"]