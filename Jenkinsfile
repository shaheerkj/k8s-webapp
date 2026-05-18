pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = "docker.io"
        DOCKER_USERNAME = "shaheerkj"
        REPO_URL = "https://github.com/shaheerkj/k8s-webapp.git"
    }
    
    stages {
        stage('Code Fetch') {
            steps {
                echo "Fetching code from GitHub..."
                git branch: 'main', url: "${REPO_URL}"
                sh 'ls -la'
            }
        }
        stage('Docker Image Creation') {
            steps {
                echo "Building Docker image..."
                dir('app') {
                    sh '''
                        docker build -t ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/k8s-webapp:${BUILD_NUMBER} .
                        docker tag ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/k8s-webapp:${BUILD_NUMBER} \
                                   ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/k8s-webapp:latest
                    '''
                }
            }
        }
        stage('Push to DockerHub') {
            steps {
                echo "Pushing Docker image to DockerHub..."
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                    sh '''
                        echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
                        docker push ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/k8s-webapp:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/k8s-webapp:latest
                    '''
                }
            }
        }
        stage('Kubernetes Deployment') {
    steps {
        echo "Deploying to Kubernetes..."
        sh '''
            # Deploy postgres first (app depends on it)
            kubectl apply -f k8s/postgres.yml

            # Update the image tag to this build number
            sed -i "s|docker.io/shaheerkj/k8s-webapp:latest|docker.io/shaheerkj/k8s-webapp:${BUILD_NUMBER}|g" k8s/deployment.yaml

            kubectl apply -f k8s/deployment.yml
            kubectl apply -f k8s/service.yml

            # Wait for rollout to complete
            kubectl rollout status deployment/k8s-webapp --timeout=120s

            echo "Deployment complete. Pods:"
            kubectl get pods -l app=k8s-webapp
            echo "Service:"
            kubectl get svc k8s-webapp-svc
        '''
    }
}
stage('Prometheus/Grafana Setup') {
    steps {
        echo "Setting up monitoring stack..."
        sh '''
            # Add Helm repos
            helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
            helm repo add grafana https://grafana.github.io/helm-charts
            helm repo update

            # Create monitoring namespace if it doesn't exist
            kubectl get namespace monitoring || kubectl create namespace monitoring

            # Install Prometheus (skip if already installed)
            if ! helm status prometheus -n monitoring > /dev/null 2>&1; then
                helm install prometheus prometheus-community/prometheus \
                    --namespace monitoring \
                    --set server.service.type=NodePort
            else
                echo "Prometheus already installed, skipping."
            fi

            # Install Grafana (skip if already installed)
            if ! helm status grafana -n monitoring > /dev/null 2>&1; then
                helm install grafana grafana/grafana \
                    --namespace monitoring \
                    --set service.type=NodePort
            else
                echo "Grafana already installed, skipping."
            fi

            echo "Monitoring pods:"
            kubectl get pods -n monitoring
            echo "Monitoring services:"
            kubectl get svc -n monitoring
        '''
    }
}
    }
}