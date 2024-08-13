<template>
  <option-list title="system_management.lists.appointmentModalities" add-button-label="system_management.lists.add.type" has-online />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useOptionListStore } from '@/pinia/option-list/optionList';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'AppointmentModalities',

  components: {
    OptionList,
  },

  created() {
    useOptionListStore().resetState();
    useOptionListStore().list = EOptionLists.AppointmentModalities;
  },
});
</script>
