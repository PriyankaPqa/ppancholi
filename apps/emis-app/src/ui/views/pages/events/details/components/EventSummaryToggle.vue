<template>
  <v-row class="no-gutters flex-column mt-0">
    <v-col
      col="12"
      class="pt-0 pb-0 px-4 d-flex align-center justify-space-between rc-body12"
      :class="isLastChild ? 'last-child-border' : 'child-border'"
      data-test="event-summary-toggle-title">
      {{ titleOfToggle }}
      <v-switch
        v-model="toggleValueData"
        class="mt-0 pt-2"
        :loading="loading"
        :disabled="loading"
        :aria-label="titleOfToggle"
        data-test="event-summary-toggle-switch"
        @change="$emit('toggleChanged', $event)" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'EventSummaryToggle',

  props: {
    loading: {
      type: Boolean,
      require: true,
      default: false,
    },

    titleOfToggle: {
      type: String,
      default: '',
      require: true,
    },

    isLastChild: {
      type: Boolean,
      default: false,
    },

    toggleValue: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      toggleValueData: this.toggleValue,
    };
  },

};
</script>

<style scoped lang="scss">
  .child-border{
    border: 1px solid var(--v-grey-lighten2);
    border-bottom: 0;
  }

  .last-child-border{
    border: 1px solid var(--v-grey-lighten2);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

</style>
