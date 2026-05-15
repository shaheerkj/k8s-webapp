# k8s-webapp

A Kubernetes-deployable web application with the manifests and configuration needed to run in a cluster (local or cloud).

## Table of Contents
- [About](#about)
- [Features](#features)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
  - [Run locally](#run-locally)
  - [Run on Kubernetes](#run-on-kubernetes)
- [Configuration](#configuration)
- [Deploy](#deploy)
- [Observability](#observability)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## About
`k8s-webapp` is a simple web application packaged to run on Kubernetes. This repository is intended as a learning/reference project for building container images and deploying them using Kubernetes manifests.

> Replace this section with 2–4 sentences describing what your app actually does (e.g., API, UI, demo app, etc.).

## Features
- Containerized web app (Docker-friendly)
- Kubernetes manifests for deployment
- Works with local clusters (kind / minikube) and managed Kubernetes
- Environment-based configuration (12-factor style)

## Architecture
High-level components:
- **Web app**: The application container that serves HTTP traffic
- **Kubernetes resources**: Deployment/Service/Ingress (and optionally ConfigMap/Secret)

## Repository Layout
Update the paths below to match your repo structure:

- `src/` — Application source code
- `Dockerfile` — Container build definition
- `k8s/` or `manifests/` — Kubernetes YAML manifests (Deployment, Service, Ingress, etc.)
- `helm/` — Helm chart (if applicable)
- `.github/workflows/` — CI pipelines (if applicable)

## Prerequisites
Choose the ones you use and delete the rest:

- **Docker** (for building images)
- **kubectl** (Kubernetes CLI)
- A Kubernetes cluster:
  - **kind** (recommended for local testing), or
  - **minikube**, or
  - A managed cluster (EKS/GKE/AKS)
- (Optional) **Helm** (if you deploy via Helm)

## Quick Start

### Run locally
If your app can run without Kubernetes, add your local dev steps here.

Example placeholders:
```bash
# install dependencies (edit for your language/runtime)
# npm ci
# pip install -r requirements.txt

# start the app
# npm run dev
# python app.py
```

Then open:
- `http://localhost:<PORT>`

### Run on Kubernetes

#### 1) Build the container image
```bash
# pick a tag
export IMAGE=shaheerkj/k8s-webapp:latest

docker build -t $IMAGE .
```

#### 2) Load/push the image
Pick one:

**Option A: kind (load image directly)**
```bash
kind load docker-image $IMAGE
```

**Option B: Push to a registry**
```bash
docker push $IMAGE
```

#### 3) Apply Kubernetes manifests
If your manifests live in `k8s/`, for example:
```bash
kubectl apply -f k8s/
```

#### 4) Verify
```bash
kubectl get pods
kubectl get svc
```

#### 5) Access the app
If you have a Service of type `ClusterIP`, use port-forward:
```bash
kubectl port-forward svc/<service-name> 8080:<service-port>
```

Then open:
- `http://localhost:8080`

## Configuration
Document environment variables and defaults here.

Example:
| Variable | Default | Description |
|---|---:|---|
| `PORT` | `8080` | HTTP port the server listens on |
| `APP_ENV` | `production` | Runtime environment |

If you use Kubernetes:
- **ConfigMap**: for non-sensitive settings
- **Secret**: for credentials/tokens (never commit real secrets)

## Deploy
Describe your intended deployment approach.

Examples:
- Apply raw manifests: `kubectl apply -f k8s/`
- Helm install: `helm upgrade --install ...`
- GitHub Actions CI/CD (if present)

## Observability
Add what you support:
- Health endpoints: `/healthz`, `/readyz`
- Logs: `kubectl logs deploy/<deployment-name>`
- Metrics: Prometheus endpoint (if any)

## Troubleshooting
Common commands:
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl get events --sort-by=.metadata.creationTimestamp
```

If the image won’t pull:
- Confirm the image name/tag in your Deployment
- Confirm the registry is accessible from the cluster
- If using kind, confirm you ran `kind load docker-image ...`

## Contributing
1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-change`
3. Commit: `git commit -m "Describe change"`
4. Push: `git push origin feature/my-change`
5. Open a Pull Request
