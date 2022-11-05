## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
# Install docker. Dude, seriously...that is an awesome tool to have with.

# Clone this repo
$ git clone <GIT_URL>

# Get inside the cloned directory
$ cd <DIR_NAME>

# NPM package installation
$ npm install

# Copy .env.example & rename it to .env
$ cp .env.example .env
```

- Edit .env file with your own configuration

## Running the app

```bash
# development - docker (RECOMMENDED)
$ npm run docker:dev

# development - W/O Docker (UNTESTED)
$ npm run start:dev
```

## Test

```bash
# unit tests
$ npm run test

# integration test tests (Only works with docker. Because we need a separate database connection)
$ npm run test:e2e
```

## Migration

To do migration, edit `schema.prisma` first.
And then do this

```bash
# Go inside the container first
$ npm run docker:exec

# Create New Migration (Dev Only)
$ npm run prisma:migration:name {MIGRATION_NAME}

# Migrate to latest schema (Dev only)
$ npm run prisma:migration:dev

```

## Tips
### Development Workflow
Make your changes, and ensure that the changes are tested properly by Unit + Integration Test.

You might not even need to start the server. Just utilize the test command.

My preferred ratio of Unit : Integration is 80% : 20%

### Regarding Test Files
Unit tests should always have a filename of `*.spec.ts`

Integration tests should always have a filename of `*.test.ts`.

Don't mix them up !

## Stay in touch

- Author - [Rangga Rifqi Pratama](https://ranggarifqi.com)

