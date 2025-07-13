FROM eclipse-temurin:21-jdk-jammy

# Install necessary tools
RUN apt-get update && apt-get install -y curl vim busybox ca-certificates

# Copy your self-signed certificate into the image
COPY keycloak.crt /tmp/keycloak.crt

# Import the certificate into Java's truststore (default password: changeit)
RUN keytool -import -trustcacerts -alias keycloak \
  -file /tmp/keycloak.crt \
  -keystore $JAVA_HOME/lib/security/cacerts \
  -storepass changeit -noprompt

# Set working dir and copy jar
WORKDIR /app
COPY target/api-gateway-*.jar app.jar

# Expose API port
EXPOSE 9000

ENTRYPOINT ["java", "-jar", "app.jar"]

