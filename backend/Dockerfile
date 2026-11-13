# Stage 1: Build the application using Maven and Java 17
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy Maven project definition
COPY pom.xml .

# Copy source code and build executable jar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java 17 JRE runtime
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create a dedicated non-root user and group for security
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copy built artifact from builder stage
COPY --from=builder /app/target/secure-hospital-network-0.0.1-SNAPSHOT.jar app.jar

# Render assigns PORT dynamically; default local port is 8083
EXPOSE 8083

# Launch the executable JAR
ENTRYPOINT ["java", "-jar", "app.jar"]