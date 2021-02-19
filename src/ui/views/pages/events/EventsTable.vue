<template>
  <rc-data-table
    data-test="events-table"
    :items="items"
    :headers="[]"
    :count="count"
    :labels="labels"
    :show-add-button="$hasLevel('level6')"
    sort-by="startDate"
    sort-desc
    @add-button="addEvent"
    @search="search" />
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import { RcDataTable } from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'EventsTable',
  components: {
    RcDataTable,
  },
  props: {
    isDashboard: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      routes,
      items: [],
      count: 0,
      loading: false,
    };
  },
  computed: {
    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      return {
        header: {
          title: this.$t('eventsTable.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },
  },
  methods: {

    addEvent() {
      this.$router.push({ name: routes.events.create.name });
    },
    async search() {
      return false;
    },
  },
});
</script>
