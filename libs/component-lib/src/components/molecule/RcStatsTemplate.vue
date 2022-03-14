<template>
  <div class="stats__container elevation-1">
    <div class="header__stats elevation-1 border-radius-top">
      <div class="title rc-title-3 fw-medium" :data-test="`${dataTestPrefix}__stats__title`">
        {{ title }}
      </div>

      <div class="tip rc-body12" :data-test="`${dataTestPrefix}__stats__tip`">
        <slot name="tip" />
      </div>
    </div>

    <v-skeleton-loader
      v-if="loading"
      :data-test="`${dataTestPrefix}__stats__loading`"
      type="card" />

    <template v-else>
      <div class="select__container" :data-test="`${dataTestPrefix}__stats__slot__top`">
        <slot name="top" />
      </div>

      <div class="content__stats border-radius-bottom" :data-test="`${dataTestPrefix}__stats__slot__stats`">
        <slot name="stats" />
      </div>

      <div v-if="showPagination" class="actions" :data-test="`${dataTestPrefix}__stats__actions`">
        <v-btn class="mr-n1" icon :data-test="`${dataTestPrefix}__stats__back`" @click="back">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <v-btn icon :data-test="`${dataTestPrefix}__stats__next`" @click="next">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'RcStatsTemplate',
  props: {
    /**
     * Title displayed in the header
     */
    title: {
      type: String,
      required: true,
    },

    /**
     * Number of tabs if more than one
     */
    numberOfTabs: {
      type: Number,
      default: 1,
    },

    /**
     * Show or not actions buttons to go next or back
     */
    showPagination: {
      type: Boolean,
      default: false,
    },

    /**
     * Current tab being displayed
     */
    currentTab: {
      type: Number,
      default: 0,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    dataTestPrefix: {
      type: String,
      required: true,
    },
  },
  methods: {
    /**
     * Go to the next tab and update props currentTab
     */
    next() {
      if (this.currentTab === this.numberOfTabs - 1) {
        this.$emit('update:current-tab', 0);
      } else {
        this.$emit('update:current-tab', this.currentTab + 1);
      }
    },
    /**
     * Go to the previous tab and update props currentTab
     */
    back() {
      if (this.currentTab === 0) {
        this.$emit('update:current-tab', this.numberOfTabs - 1);
      } else {
        this.$emit('update:current-tab', this.currentTab - 1);
      }
    },
  },
});
</script>

<style scoped lang="scss">
$height_header: 56px;
$height_actions: 36px;
$table_height_3_rows: 307px;

.stats__container {
  height: $table_height_3_rows;
  background: white;
  position: relative;
}
.header__stats {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  height: $height_header;
  width: 100%;
  background-color: var(--v-grey-lighten5);

  & > .title {
    flex: 1;
  }

  & > .tip {
    max-height: 100%;
    text-align: right;
  }
}
.select__container {
  padding: 16px 16px 0 16px;
}
.content__stats {
  padding: 0 16px 16px 16px;
}
.select__container, .content__stats {
  width: 100%;
}

.actions {
  position: absolute;
  bottom: 4px;
  width: 100%;
  display: flex;
  padding-right: 16px;
  justify-content: flex-end;
  height: $height_actions;
}
</style>
