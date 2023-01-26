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
import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useOptionListStore } from '@/pinia/option-list/optionList';
import OptionList from './components/OptionList.vue';

export default Vue.extend({
  name: 'Roles',

  components: {
    OptionList,
  },

  created() {
    useOptionListStore().resetState();
    useOptionListStore().list = EOptionLists.Roles;
  },
});
</script>
