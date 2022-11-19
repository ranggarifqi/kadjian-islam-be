pipeline {
  agent any

  tools {
    nodejs 'Node v16.17.0'
  }

  environment {
    CI = 'true'
  }

  stages {
    stage("build") {
      steps {
        sh 'npm install'
      }
    }

    stage("test") {
      steps {
        sh 'npm test'
      }
    }
  }
}