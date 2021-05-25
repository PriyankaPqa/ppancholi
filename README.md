# Introduction 
Emergency Management Information System is a SaaS platform aimed to be used by the Canadian
Red Cross to help to manage events and provide assistance to those affected. 

The application consists of several modules:
- Case files
- Teams
- Financial assistance
- Approvals
- Mass actions
- Assessments
- Reports
- System management
- CRC Registration


# Getting Started

It is highly recommended checking the [starting guide ](https://rctech.atlassian.net/wiki/spaces/EDev/pages/1559396353/Front-end+-+On+boarding)


## Installation process
1. Install project dependencies

```yarn install```

2. Install yalc globally to improve workflow when working with libraries

``yarn global add yalc``

## Development
1. Run the development environment

```yarn serve```

2. Test your code

``yarn test``

3. Lint your code 

``yarn lint``

4. Synchronize the translations

``yarn lokalise``


### Helpful commands

- ``yarn pr``: will run `lint` and `test`. It is convenient before creating a Pull Request

- ``link:registration``: link the registration library to yalc

- ``remove:registration``: unlink the registration library from yalc


## Libraries


## Dependencies

Fundamental dependencies that require a deep understanding:

### [vue.js 2.x ](https://vuejs.org/)
The front-end framework with which the application is built. As the UI framework, vue is to be used for all code that intends to render HTML content.

### [vuetify 2.x ](https://vuetifyjs.com/en/)
vuetify is a Material Design component library for vue. It provides an extensive list of components that can be quickly implemented to build user interfaces.


### [vue test utils](https://vue-test-utils.vuejs.org/)

It is the official unit testing library for vue.js built on top of [Jest](https://jestjs.io/docs/getting-started)

To know more about testing [check this out](https://rctech.atlassian.net/wiki/spaces/EDev/pages/1559396353/Front-end+-+On+boarding#Testing) 

Our expectations:

| Kind    | Code coverage      
| ------------- |:----:|
| Entities | 100% |
| Services + Provider | 100% | 
| Store + Storage | 100% |
| Vue components | + 70% |

###  [vee validate 3.x](https://vee-validate.logaretm.com/v3)
Template Based Form Validation Framework for Vue.js. It is used to validate each form inputs in the application 
and allows user to get instant feedback before calling the API

### [vue router 3.x](https://router.vuejs.org/)
The official router for Vue.js. It provides client-side routing to navigate within each page the Single Page Application.
When configured properly, it also allows code splitting to split the bundle up into different chunks, reducing the overall load time of the application.

### [vuex 3.x ](https://vuex.vuejs.org/)

It allows the application to keep a centralized state accessible from all components. It's particularly useful for distant components or for caching purposes.

### [vue-18n 8.x](https://kazupon.github.io/vue-i18n/introduction.html)

It is used for internationalization within EMIS. 
It makes the connection between translations, and a key allowing dynamic rendering depending on the current language. 
All content need to be dynamic and thus refers to a key.

Languages are located `@/lang/`

Your key should follow this format:

`[module_name].[section_name].[key_name]`

To use a translated string in a component:

####HTML
```<p>{{$t('commmon.signin.username_label')}}</p>```

####TypeScript
```// Normal
this.usernameLabel = this.$t('common.signin.username_label'),

// With pluralization
this.eventsLabel = this.$tc('common.events', 2),
```


### [Lodash 4.x](https://lodash.com/docs/4.17.15)


Lodash is a library which provides useful utility methods for dealing with arrays, objects, numbers, and functions in JavaScript. 
Developers can choose to use it whenever they need to.

Important To avoid importing the entire library, make sure to enable tree shaking by writing proper import statements.
```
// Good
import _find from 'lodash/find';

// Bad
import _ from 'lodash';

// Also bad
import { _find } from 'lodash';
```

### [moment 2.x](https://momentjs.com/docs/)

Moment is a popular library used for managing time and dates in JavaScript. 
Moment can be used whenever complicated date comparisons or formatting needs to be done. 
If you need to add a locale to moment, that can be done in `@/ui/plugins/moment.js`.
