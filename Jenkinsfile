pipeline {
  agent any

  tools {
    maven 'Maven-3'
  }

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

    stage('Backend: Test') {
      steps {
        dir('backend') {
          script {
            if (isUnix()) {
              sh 'mvn -B test'
            } else {
              bat 'mvn -B test'
            }
          }
        }
      }
    }

    stage('Backend: Build') {
      steps {
        dir('backend') {
          script {
            if (isUnix()) {
              sh 'mvn -B package -DskipTests'
            } else {
              bat 'mvn -B package -DskipTests'
            }
          }
        }
      }
    }

    stage('Install') {
      steps {
        dir('frontend') {
          script {
            if (isUnix()) {
              sh 'npm ci'
            } else {
              bat 'npm ci'
            }
          }
        }
      }
    }

    stage('Test + Coverage') {
      steps {
        dir('frontend') {
          script {
            if (isUnix()) {
              sh 'npm run test:coverage'
            } else {
              bat 'npm run test:coverage'
            }
          }
        }
      }
    }

    stage('Build') {
      steps {
        dir('frontend') {
          script {
            if (isUnix()) {
              sh 'npm run build'
            } else {
              bat 'npm run build'
            }
          }
        }
      }
    }

    stage('SonarQube') {
      steps {
        dir('frontend') {
          withCredentials([
            string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN'),
            string(credentialsId: 'sonar-host-url', variable: 'SONAR_HOST_URL'),
          ]) {
            script {
              if (isUnix()) {
                sh '''npx sonar-scanner \
                  -Dsonar.projectKey="$SONAR_PROJECT_KEY" \
                  -Dsonar.projectName="$SONAR_PROJECT_NAME" \
                  -Dsonar.host.url="$SONAR_HOST_URL" \
                  -Dsonar.token="$SONAR_TOKEN" \
                  -Dsonar.sources=src \
                  -Dsonar.tests=src \
                  -Dsonar.test.inclusions=**/*.test.js,**/*.test.jsx \
                  -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/*.test.js,**/*.test.jsx,**/test/** \
                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                '''
              } else {
                bat '''npx sonar-scanner ^
                  -Dsonar.projectKey=%SONAR_PROJECT_KEY% ^
                  -Dsonar.projectName=%SONAR_PROJECT_NAME% ^
                  -Dsonar.host.url=%SONAR_HOST_URL% ^
                  -Dsonar.token=%SONAR_TOKEN% ^
                  -Dsonar.sources=src ^
                  -Dsonar.tests=src ^
                  -Dsonar.test.inclusions=**/*.test.js,**/*.test.jsx ^
                  -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/*.test.js,**/*.test.jsx,**/test/** ^
                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                '''
              }
            }
          }
        }
      }
    }
  }
}
