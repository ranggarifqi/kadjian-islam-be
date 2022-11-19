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
        PG_CREDS = credentials('pg-creds-ci')
        POSTGRES_USER = '${PG_CREDS_USR}'
        POSTGRES_PASSWORD = '${PG_CREDS_PSW}'
        POSTGRES_DB = 'kadjianislamtest'
        MAIL_HOST = credentials('mail-host-ci')
        MAIL_PORT = credentials('mail-port-ci')
        MAIL_CREDS = credentials('mail-cred-ci')
        MAIL_USER = '${MAIL_CREDS_USR}'
        MAIL_PASSWORD = '${MAIL_CREDS_PSW}'
        VERIFY_USER_SUCCESS_URL='https://ranggarifqi.com'
        VERIFY_USER_FAILED_URL='https://www.google.com'
      }
      steps {
        sh 'echo $POSTGRES_USER}:$POSTGRES_PASSWORD}'
        sh 'npm test'
      }
    }
  }
}