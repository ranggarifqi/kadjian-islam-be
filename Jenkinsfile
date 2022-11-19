pipeline {
  agent any

  tools {
    nodejs 'Node v16.17.0'
  }

  environment {
    CI = 'true'
    NPM_CONFIG_CACHE = '${WORKSPACE}/.npm'
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