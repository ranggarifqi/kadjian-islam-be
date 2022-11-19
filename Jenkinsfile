pipeline {
  agent any

  stages {
    stage("build") {
      steps {
        sh 'npm install'
      }
    }

    stage("unit-test") {
      steps {
        sh 'npm test'
      }
    }

    stage("integration-test") {
      steps {
        echo 'Do integration test'
      }
    }
  }
}