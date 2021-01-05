---
to: src/store/modules/<%= name %>.ts
---
<% if(actions){ -%>
import { ActionContext, Store } from 'vuex';
<% } -%>
import {<% if(actions){ -%> IRootState,<%}-%> <%= interfaceName %> } from '@/store/types';
import { resetVuexModuleState, setVuexProperties } from '@/store/helpers';

const getDefaultState = (): <%= interfaceName %> => ({

});

const moduleState: <%= interfaceName %> = getDefaultState();

<% if(getters){ -%>
const getters = {

};
<% } -%>

const mutations = {
  setProperties: (state: <%= interfaceName %>, props: <%= interfaceName %>) => {
    setVuexProperties(state, props);
  },

  resetState(state: <%= interfaceName %>) {
    resetVuexModuleState(state, getDefaultState);
  },
};

<% if(actions){ -%>
const actions = {

};
<% } -%>

export default {
  namespaced: true,
  state: moduleState as <%= interfaceName %>,
<% if(getters){-%>
  getters,
<% } -%>
  mutations,
<% if(actions){-%>
  actions,
<% } -%>
};
