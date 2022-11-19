pipeline {
  agent {
    docker {
      image 'node:lts-alpine'
      args '-p 3000:3000 -p 5000:5000'
    }
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