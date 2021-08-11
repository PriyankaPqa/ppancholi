<template>
  <option-list
    title="system_management.lists.roles"
    has-description
    is-cascading
    hide-item-status
    hide-item-drag
    item-label="system_management.lists.roles.accessLevel"
    sub-item-label="system_management.lists.roles.role"
    sub-item-name-label="system_management.lists.roles.nameLabel"
    add-sub-item-label="system_management.lists.roles.addRole"
    :show-add-button="false" />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@/entities/optionItem';
import OptionList from './components/OptionList.vue';

export default Vue.extend({
  name: 'Roles',

  components: {
    OptionList,
  },

  created() {
    this.$storage.optionList.mutations.resetState();
    this.$storage.optionList.mutations.setList(EOptionLists.Roles);
  },
});
</script>
