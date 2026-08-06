pipeline {
  agent any

  environment {
    SONAR_PROJECT_KEY = 'react-demo-todo'
    SONAR_PROJECT_NAME = 'React Demo-todo'
  }

  options {
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm ci'
          }
        }
      }
    }

    stage('Test + Coverage') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run test:coverage'
          } else {
            bat 'npm run test:coverage'
          }
        }
      }
    }

    stage('Build') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run build'
          } else {
            bat 'npm run build'
          }
        }
      }
    }

    stage('SonarQube') {
      steps {
        withCredentials([
          string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN'),
          string(credentialsId: 'sonar-host-url', variable: 'SONAR_HOST_URL'),
        ]) {
          writeFile file: 'sonar-project.properties', text: """sonar.projectKey=${SONAR_PROJECT_KEY}
sonar.projectName=${SONAR_PROJECT_NAME}
sonar.host.url=${SONAR_HOST_URL}
sonar.token=${SONAR_TOKEN}
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.js,**/*.test.jsx
sonar.exclusions=**/node_modules/**,**/coverage/**,**/*.test.js,**/*.test.jsx,**/test/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
"""
          script {
            if (isUnix()) {
              sh 'npx sonar-scanner'
            } else {
              bat 'npx sonar-scanner'
            }
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (fileExists('sonar-project.properties')) {
          if (isUnix()) {
            sh 'rm -f sonar-project.properties'
          } else {
            bat 'del /f /q sonar-project.properties'
          }
        }
      }
    }
  }
}
