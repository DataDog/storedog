FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app

# Copy Gradle wrapper and build files
COPY app/gradle ./gradle
COPY app/gradlew .
COPY app/build.gradle .
COPY app/settings.gradle .

# Copy source code
COPY app/src ./src

# Build the application
RUN ./gradlew build -x test

# Runtime stage
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Datadog Java tracer (same source as services/ads/java)
ADD https://dtdg.co/latest-java-tracer /app/dd-java-agent.jar

# Expose application port
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-javaagent:/app/dd-java-agent.jar", "-jar", "app.jar"]
