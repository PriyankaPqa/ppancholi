# Introduction
Emergency Management Information System is a SaaS platform aimed to be used by the Canadian
Red Cross to help to manage events and provide assistance to those affected.

The front-end part is built as a monorepo using Lerna and Yarn Workspaces. The monorepo is articulated around two major principles:
- **applications**: meant to be built and pushed on servers
- **libraries** pieces of code used by applications
- **tools**: code used internally

## The packages

| Name                  |                                       Description                                       |
|-----------------------|:---------------------------------------------------------------------------------------:|
| apps/benef-app        |                           This is the beneficiary application                           |
| apps/emis-app         |                              This is the EMIS application                               | 
| libs/registration-lib | The registration library containing common logic and components to registration process | 
| libs/component-lib    |                 The component library with generic shared UI components                 | 


# Getting Started
### Installation process

1. Install project dependencies
``` yarn install``` or ```yarn bootstrap```

### Development

| Actions / Package      |           benef-app           | emis-app                      | registration-lib                 | component-lib                 |
|------------------------|:-----------------------------:|-------------------------------|----------------------------------|-------------------------------|
| Run development server |  ```yarn benef-app:serve```   | ```yarn emis-app:serve```     | NA                               | NA                            |
| Test the code          |   ```yarn benef-app:test```   | ```yarn benef-app:test```     | ```yarn registration-lib:test``` | ```yarn component-lib:test``` | 
| Lint                   |   ```yarn benef-app:lint```   | ```yarn benef-app:lint```     | ```yarn registration-lib:lint``` | ```yarn component-lib:lint``` | 
| Sync Lokalise          | ```yarn benef-app:lokalise``` | ```yarn benef-app:lokalise``` | NA                               | NA                            | 

NA: Not applicable

### Helpful commands

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

### Adding a new package

1) Update or add with proper path settings: 

- .eslintrc.js
- vue.config.js
- tsconfig.json
- jest.config.js (root + new package)

2) Update pipeline scripts
   1) Update parallelize-tests

3) Add script to package.json
   1) new_package:lint
   2) new_package:coverage
   3) new_package:test
