<template>
  <v-row class="no-gutters">
    <v-col cols="12">
      <v-row class="d-flex justify-space-between pr-0">
        <v-col col="12" class="pt-0 pb-1 px-2 d-flex align-center justify-space-between">
          <span :data-test="`event-excptauth-section-name-${index}`" class="font-weight-bold excptauth-title pa-1">{{ $m(excptAuth.item.name) }}</span>
          <span :data-test="`event-excptauth-section-stats-${index}`" class="excptauth-title pa-1">{{ countText }}</span>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang='ts'>
import Vue from 'vue';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'EventExceptionalAuthenticationSection',

  props: {
    excptAuth: {
      type: Object as () => { item: IOptionItem, max?: number, count?: number },
      required: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },

  computed: {
    countText() : TranslateResult {
      return this.$t(
        'eventSummary.exceptionalAuthenticationType.count',
        { count: this.excptAuth.count === null ? '...' : this.excptAuth.count, max: this.excptAuth.max == null ? '-' : this.excptAuth.max },
      );
    },
  },

});

</script>

<style scoped lang="scss">
.excptauth-title{
  border: 0;
  box-shadow: none;
  background-color: transparent;
  text-transform: none;
  text-align: left;
}

</style>
