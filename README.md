# Production-Deployment-Setup-for-Spring-Boot-3-Microservices-NGINX-Master-Node-
# Production Deployment Setup for Spring Boot 3 Microservices (NGINX + Kubernetes)

This setup demonstrates how various microservices communicate with each other in a Kubernetes cluster on a single Ubuntu server. This guide is built upon the work from [SaiUpadhyayula/spring-boot-3-microservices](https://github.com/SaiUpadhyayula/spring-boot-3-microservices) — all credits to the original author.

---

## 🧠 Server Configuration

* OS: Ubuntu (ARM64 architecture)
* Cloud: Azure
* RAM: 16GB
* SSD: 128GB

---

## 🔧 Step-by-Step Cluster and Application Setup

### Step 1: Create Kubernetes Cluster

```bash
cd k8s/kubeadmcluster
# Run the cluster creation commands in 'createk8scluster'
```

### Step 2: Allow Scheduling on Master Node

```bash
kubectl taint nodes <master-node> node-role.kubernetes.io/control-plane:NoSchedule-
```

### Step 3: Ensure Node is Ready

```bash
kubectl get nodes
# Confirm the node status is 'Ready'
```

### Step 4: Deploy Infrastructure Components

```bash
cd k8s/manifests/infra
kubectl apply -f *

# Deploy Keycloak separately
kubectl apply -f keycloak/keycloak.yml
```

### Step 5: Frontend Configuration & Image

1. **Edit IP Addresses** in frontend files:

   * `/frontend/src/app/config/auth.config.ts`
   * `/frontend/src/app/services/order/order.service.ts`
   * `/frontend/src/app/services/product/product.service.ts`

2. **Build and Push Docker Image**:

```bash
cd frontend
# Build
docker build -t <your-dockerhub-username>/frontend:v1 .
# Push
docker push <your-dockerhub-username>/frontend:v1
```

3. **Edit frontend deployment**:
   Update the image name in `k8s/manifests/applications/frontend.yml`:

```yaml
image: <your-dockerhub-username>/frontend:v1
```

### Step 6: Update API Gateway ConfigMap

Edit `api-gateway.yaml` ConfigMap:

```yaml
SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER-URI: "https://<your-server-ip>/auth/realms/spring-microservices-security-realm"
```

### Step 7: Deploy Application Services

```bash
cd k8s/manifests/applications
kubectl apply -f *
```

### Step 8: Install and Configure NGINX

```bash
sudo apt install nginx -y
```

1. **Replace Config**:

```bash
cp k8s/manifests/nginxconf/nginx.conf /etc/nginx/nginx.conf
cp -r k8s/manifests/nginxconf/certs /etc/nginx/
```

2. **Update IP and Certificate**:

* Edit `nginx.conf`, replace all IPs with your server IP.

3. **(Optional) Generate TLS Certs**:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/certs/key.pem \
  -out /etc/nginx/certs/cert.pem \
  -subj "/CN=<your-server-ip>"
```

4. **Restart NGINX**:

```bash
sudo systemctl restart nginx
```

### Step 9: Verify Pods

```bash
kubectl get pods -A
```

All pods should be in `Running` state.

### Step 10: Setup Keycloak Admin Console

```bash
kubectl exec -it <keycloak-pod-name> -- /bin/bash
# Inside pod
cd /k8s/manifests/infra
./keycloak_adminconsol_start_command
```

### Step 11: Configure Keycloak Client

1. Open:

```
http://<your-server-ip>:32222/admin/master/console/
```

2. Login:

* Username: `admin`
* Password: `admin`

3. Navigate to client `angular-client` in realm `springboot-microservice`
4. Update:

   * **Valid Redirect URIs**: `https://<your-server-ip>/*`
   * **Web Origins**: `https://<your-server-ip>`
   * **Frontend URL (optional)**: `https://<your-server-ip>/auth`

---

## ✅ Final Access URLs

* Frontend: [https://<your-server-ip>](https://<your-server-ip>)
* Keycloak Admin Console: [http://<your-server-ip>:32222/admin/master/console](http://<your-server-ip>:32222/admin/master/console)

---

## 📦 Directory Structure (Partial)

```
Production-Deployment-Setup-for-Spring-Boot-3-Microservices-NGINX-Master-Node-
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
├── notification-service
```
Services Overview
Product Service
Order Service
Inventory Service
Notification Service
API Gateway using Spring Cloud Gateway MVC
Shop Frontend using Angular 18
Tech Stack
The technologies used in this project are:

Spring Boot
Angular
Mongo DB
MySQL
Kafka
Keycloak
Test Containers with Wiremock
Grafana Stack (Prometheus, Grafana, Loki and Tempo)
API Gateway using Spring Cloud Gateway MVC
Kubernetes

Application Architecture : <img width="1328" height="672" alt="image" src="https://github.com/user-attachments/assets/a8b9ae1c-c488-4dc9-a870-9667212892c0" />


---

## 🙏 Credit

Big thanks to [Sai Upadhyayula](https://github.com/SaiUpadhyayula/spring-boot-3-microservices) for the foundational project structure and code.

---

Let me know if any part of the process breaks or if you'd like a script to automate these steps.
