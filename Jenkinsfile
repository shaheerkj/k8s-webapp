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
    }
}