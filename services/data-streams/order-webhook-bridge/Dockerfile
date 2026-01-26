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

# Expose application port
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
