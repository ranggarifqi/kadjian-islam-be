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
      environment {
        BASE_URL = 'http://localhost:3000'
        JWT_SECRET = credentials('jwt-secret')
        POSTGRES_USER = 'kadjianislam'
        POSTGRES_PASSWORD = credentials('pg-password-ci')
        POSTGRES_DB = 'kadjianislamtest'
        MAIL_HOST = credentials('mail-host-ci')
        MAIL_PORT = credentials('mail-port-ci')
        MAIL_USER = 'rangga@ranggarifqi.com'
        MAIL_PASSWORD = credentials('mail-password-ci')
        VERIFY_USER_SUCCESS_URL='https://ranggarifqi.com'
        VERIFY_USER_FAILED_URL='https://www.google.com'
        DATABASE_URL = sh(returnStdOut: true, script: 'echo asd').trim()
      }
      steps {
        sh 'echo $POSTGRES_USER : $POSTGRES_PASSWORD'
        sh 'echo $DATABASE_URL'
        sh 'npm test'
      }
    }
  }
}