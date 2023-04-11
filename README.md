# Introduction
Emergency Management Information System is a SaaS platform aimed to be used by the Canadian
Red Cross to help to manage events and provide assistance to those affected.

The front-end part is built as a monorepo using Lerna and Yarn Workspaces. The monorepo is articulated around two major principles:
- **applications**: meant to be built and pushed on servers
- **libraries** pieces of code used by applications

For more information about their concepts: https://nx.dev/structure/applications-and-libraries. Note this project does not use Nx

## The packages

| Name                  |                                       Description                                       |
|-----------------------|:---------------------------------------------------------------------------------------:|
| apps/benef-app        |                           This is the beneficiary application                           |
| apps/emis-app         |                              This is the EMIS application                               | 
| libs/registration-lib | The registration library containing common logic and components to registration process | 
| libs/component-lib    |                 The component library with generic shared UI components                 | 
| libs/entities-lib     |                 This library contains entities used in our applications                 | 
| libs/services-lib     |                 This library contains services used in our applications                 | 
| libs/shared-lib       |                  This library contains some shared logic between apps                   | 


# Getting Started
## Installation process

1. Install project dependencies
``` yarn install``` or ```yarn bootstrap```

## Development

| Actions / Package         |           benef-app           | emis-app                      | registration-lib                 | component-lib                 | entities-lib                 |
|---------------------------|:-----------------------------:|-------------------------------|----------------------------------|-------------------------------|------------------------------|
| Run development server    | ```yarn benef-app:dev```      | ```yarn emis-app:dev```       | NA                               | NA                            | NA                           |
|  (targeting lab env)      | ```yarn benef-app:lab```      | ```yarn emis-app:lab```       | NA                               | NA                            | NA                           |
|  (targeting local dev BE) | NA                            | ```yarn emis-app:dev:local``` | NA                               | NA                            | NA                           |
|  (targeting local lab BE) | NA                            | ```yarn emis-app:lab:local``` | NA                               | NA                            | NA                           |
| Test the code             | ```yarn benef-app:test```     | ```yarn emis-app:test```      | ```yarn registration-lib:test``` | ```yarn component-lib:test``` | ```yarn entities-lib:test``` | 
| Lint                      | ```yarn benef-app:lint```     | ```yarn emis-app:lint```      | ```yarn registration-lib:lint``` | ```yarn component-lib:lint``` | ```yarn entities-lib:lint``` | 
| Sync Lokalise             | ```yarn benef-app:lokalise``` | ```yarn emis-app:lokalise```  | NA                               | NA                            | NA                           | 

NA: Not applicable
local BE: API projects hosted locally (see apps/emis-app/.env.local_development)

## Helpful commands

To update packages dependencies (not root)
```
yarn lerna:update
```

To clean packages dependencies (not root)
```
yarn clean
```

To clean packages dependencies including root
```
yarn clean:all
```

To list all packages of the monorepo
```
yarn lerna:list
```

To test all packages
```
yarn test
```

To lint all packages
```
yarn lint
```

# How to
## Add a new package

1) Update or add with proper path settings:
- .eslintrc.js
- vite.config.js
- tsconfig.json
- jest.config.js (root + new package)

2) Update pipeline scripts
   1) Update parallelize-tests `getAffectedTestFiles` to include th new package

3) Add script to package.json
   1) new_package:lint
   3) new_package:test

4) Run yarn lint, test and serve for all packages to verify the app works correctly
