pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/mjtamayo89/toDo.git'
            }
        }

        stage('Mostrar archivos') {
            steps {
                sh 'ls -la'
            }
        }

    }
}
