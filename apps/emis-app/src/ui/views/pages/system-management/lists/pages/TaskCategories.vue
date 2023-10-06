<template>
  <option-list
    title="system_management.lists.taskCategories"
    has-description
    is-cascading
    has-default
    sub-item-has-other
    hide-item-drag
    item-label="taskCategories.nestedTable.headers.item"
    sub-item-label="taskCategories.nestedTable.headers.subItem"
    sub-item-name-label="taskCategories.nestedTable.headers.subItem"
    add-sub-item-label="taskCategories.addSubItem"
    add-button-label="system_management.lists.add.category" />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useOptionListStore } from '@/pinia/option-list/optionList';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'TaskCategories',

  components: {
    OptionList,
  },

  created() {
    useOptionListStore().resetState();
    useOptionListStore().list = EOptionLists.TaskCategories;
  },
});
</script>
