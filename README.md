# Production Deployment Setup for Spring Boot 3 Microservices (NGINX + Kubernetes )

This setup demonstrates how various microservices communicate with each other in a Kubernetes cluster on a single Ubuntu server.
This guide is built upon the work from [SaiUpadhyayula/spring-boot-3-microservices](https://github.com/SaiUpadhyayula/spring-boot-3-microservices) — all credits to the original author.

---

## 🧠 Server Configuration

* **OS**: Ubuntu (ARM64 architecture)
* **Cloud**: Azure
* **RAM**: 16GB
* **SSD**: 128GB

---

## 🔧 Step-by-Step Cluster and Application Setup

### Step 1: Create Kubernetes Cluster

```bash
cd k8s/kubeadmcluster
# Run the cluster creation commands in 'createk8scluster'
```

---

### Step 2: Allow Scheduling on Master Node

```bash
kubectl taint nodes <master-node> node-role.kubernetes.io/control-plane:NoSchedule-
```

---

### Step 3: Ensure Node is Ready

```bash
kubectl get nodes
# Confirm the node status is 'Ready'
```

---

### Step 4: Deploy Infrastructure Components

```bash
cd k8s/manifests/infra
kubectl apply -f *
```

**Deploy Keycloak separately:**

```bash
kubectl apply -f keycloak/keycloak.yml
```

---

### Step 5: Frontend Configuration & Image

Edit IP Addresses in frontend files:

* `/frontend/src/app/config/auth.config.ts`
* `/frontend/src/app/services/order/order.service.ts`
* `/frontend/src/app/services/product/product.service.ts`

Build and Push Docker Image:

```bash
cd frontend
docker build -t <your-dockerhub-username>/frontend:v1 .
docker push <your-dockerhub-username>/frontend:v1
```

Update image name in:

```
k8s/manifests/applications/frontend.yml
```

```yaml
image: <your-dockerhub-username>/frontend:v1
```

---

### Step 6: Update API Gateway ConfigMap

Edit `api-gateway.yaml` ConfigMap:

```yaml
SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER-URI: "https://<your-server-ip>/auth/realms/spring-microservices-security-realm"
```

---

### 🚡 Step 6.1: Configure TLS for API Gateway and NGINX

1. **Edit Cert Configuration**
   Go to the API Gateway directory:

   ```bash
   cd /api-gateway/
   ```

   Open `keycloak-cert.conf` and replace the IP with your actual server IP.

2. **Generate Certificate and Key**

   Run this OpenSSL command to generate a certificate:

   ```bash
   openssl req -x509 -nodes -days 365 \
     -newkey rsa:2048 \
     -keyout server.key \
     -out server.crt \
     -config openssl.cnf
   ```

3. **Build and Push API Gateway Image**

   Make sure the `Dockerfile` of the API Gateway copies `server.crt` and `server.key`.
   Then build and push the image:

   ```bash
   docker build -t <your-dockerhub-username>/api-gateway:v1 .
   docker push <your-dockerhub-username>/api-gateway:v1
   ```

4. **Use Same Certs in NGINX**

   Copy the generated certs into NGINX's cert directory:

   ```bash
   sudo cp server.crt /etc/nginx/certs/cert.pem
   sudo cp server.key /etc/nginx/certs/key.pem
   ```

   ✅ Make sure the **same cert and key are used in both the API Gateway pod and NGINX**.

---

### Step 7: Deploy Application Services

```bash
cd k8s/manifests/applications
kubectl apply -f *
```

---

### Step 8: Install and Configure NGINX

```bash
sudo apt install nginx -y
```

Replace default config:

```bash
sudo cp k8s/manifests/nginxconf/nginx.conf /etc/nginx/nginx.conf
sudo cp -r k8s/manifests/nginxconf/certs /etc/nginx/
```

Update all IPs inside `nginx.conf` with your server IP.

Restart NGINX:

```bash
sudo systemctl restart nginx
```

---

### Step 9: Verify Pods

```bash
kubectl get pods -A
```

All pods should be in `Running` state.

---

### Step 10: Setup Keycloak Admin Console

```bash
cd k8s/manifests/infra
```

Run this command inside the Keycloak pod:

```bash
kubectl exec -it <keycloak-pod-name> -- /bin/bash
```

---

### Step 11: Configure Keycloak Client

Open in browser:

```
http://<your-server-ip>:32222/admin/master/console/
```

Login credentials:

* Username: `admin`
* Password: `admin`

Navigate to the client `angular-client` in realm `springboot-microservice` and update:

* **Valid Redirect URIs**: `https://<your-server-ip>/*`
* **Web Origins**: `https://<your-server-ip>`
* **Frontend URL (optional)**: `https://<your-server-ip>/auth`

---

## ✅ Final Access URLs

* **Frontend**: `https://<your-server-ip>/`
* **Keycloak Admin Console**: `http://<your-server-ip>:32222/admin/master/console/`

---

## 📆 Directory Structure (Partial)

```
Production-Deployment-Setup-for-Spring-Boot-3-Microservices-NGINX-Master-Node/
├── README.md
├── k8s
│   ├── kubeadmcluster
│   └── manifests
│       ├── infra
│       ├── applications
│       └── nginxconf
├── frontend
├── api-gateway
├── inventory-service
├── order-service
├── product-service
└── notification-service
```

---

## 🧰 Services Overview

* **Product Service**
* **Order Service**
* **Inventory Service**
* **Notification Service**
* **API Gateway** (Spring Cloud Gateway)
* **Angular 18 Frontend**

---

## 🛠️ Tech Stack

* Spring Boot
* Angular
* MongoDB
* MySQL
* Kafka
* Keycloak
* Testcontainers & WireMock
* Grafana Stack (Prometheus, Loki, Tempo)
* Kubernetes

---

## 🏗️ Application Architecture

*(Add architecture diagram image here if available)*

---

## 🙏 Credit

Big thanks to [Sai Upadhyayula](https://github.com/SaiUpadhyayula) for the foundational project structure and code.
