# ─── Build Stage ───────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Runtime Stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/target/*.jar app.jar

RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
