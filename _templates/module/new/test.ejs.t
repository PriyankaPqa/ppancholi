---
to: src/store/modules/__tests__/<%= name %>.test.js
---
import createTestStore from '@/store/store-test-config';

const INITIAL_STATE = {};

describe('<%= name %> Vuex Module', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    Object.assign(store.state.<%= name %>, INITIAL_STATE);
  });

<% if(getters){ -%>
  describe('getters', () => {
    test('', async () => {});
  });
<% } -%>

  describe('mutations', () => {
    test('', async () => {});
  });

<% if(actions){ -%>
  describe('actions', () => {
    test('', async () => {});
  });
<% } -%>
});
