<template>
  <v-dialog v-if="show" :value="show" fullscreen hide-overlay persistent transition="dialog-bottom-transition">
    <div>
      <option-list
        title="financialAssistance.categories.add.item"
        has-description
        is-cascading
        embedded
        hide-item-drag
        item-label="financialAssistance.nestedTable.headers.item"
        sub-item-label="financialAssistance.nestedTable.headers.subItem"
        sub-item-name-label="financialAssistance.nestedTable.headers.subItem"
        add-sub-item-label="financialAssistance.addSubItem"
        @close="close()" />
    </div>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useOptionListStore } from '@/pinia/option-list/optionList';
import OptionList from '../../system-management/lists/components/OptionList.vue';

export default Vue.extend({
  name: 'ManageList',

  components: {
    OptionList,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },

  created() {
    useOptionListStore().resetState();
    useOptionListStore().list = EOptionLists.FinancialAssistance;
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },
  },
});
</script>
