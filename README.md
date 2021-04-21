
### Registration Library

This library aims to reduce duplication for shared resources such as entities, store modules, storage modules, services etc.

Only source of the code should be used (see below)


### Why do I see error ?

The goal is just to share source code with host applications. The shared files need some prerequisites to work, those are should be located on host apps.
Hence, we will have compilation here since not everything needed is present.

## How to use in host app

`import { IPerson } from '@crctech/registration-lib/src/entities/value-objects/person';`

`import { IBeneficiary } from '@crctech/registration-lib/src/entities/beneficiary';`


###
