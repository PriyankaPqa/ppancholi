<template>
  <div>
    <div class="d-flex justify-space-between">
      <span class="rc-heading-5">
        {{ labels.yourFilters }} ({{ count }})
      </span>

      <div>
        <rc-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              color="secondary"
              data-test="rcFilterList__newButton"
              v-on="on"
              @click="onNew">
              <v-icon size="22">
                mdi-plus-circle-outline
              </v-icon>
            </v-btn>
          </template>

          <span>{{ labels.tooltipNew }}</span>
        </rc-tooltip>

        <rc-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              color="secondary"
              data-test="rcFilterList__copyButton"
              :disabled="!currentFilter || currentFilter.filterKey === -1"
              v-on="on"
              @click="onCopy">
              <v-icon size="22">
                mdi-content-copy
              </v-icon>
            </v-btn>
          </template>

          <span>{{ labels.tooltipCopy }}</span>
        </rc-tooltip>

        <rc-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              color="secondary"
              data-test="rcFilterList__deleteButton"
              :disabled="!currentFilter || currentFilter.filterKey === -1"
              v-on="on"
              @click="onDelete">
              <v-icon size="22">
                mdi-delete
              </v-icon>
            </v-btn>
          </template>

          <span>{{ labels.tooltipDelete }}</span>
        </rc-tooltip>
      </div>
    </div>

    <v-divider class="grey-lighten-4" />

    <div class="rc-body12 mt-4">
      {{ labels.filterSubtitle }}
    </div>

    <v-radio-group v-model="currentFilter" column>
      <v-radio
        v-for="(filter, index) in filters"
        :key="index"
        class="break-word"
        :data-test="`rcFilterList__radio--${index}`"
        :label="filter.name"
        :value="filter"
        @click.native="onSelect(filter, index)" />
    </v-radio-group>

    <rc-confirmation-dialog
      data-test="rcFilterList__deleteDialog"
      :title="labels.removeTitle"
      :messages="labels.removeBody"
      :show.sync="showDeleteFilterDialog"
      @submit="onDeleteConfirmation" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import RcConfirmationDialog from '@libs/component-lib/components/atoms/RcConfirmationDialog.vue';
import RcTooltip from '@libs/component-lib/components/atoms/RcTooltip.vue';

import {
  IFilterToolbarLabels,
  IFilterDTO,
  EFilterListEvents,
} from '@libs/component-lib/types';

/**
 * A filter toolbar which allows the user to build preset filters used for search queries.
 *
 */
export default Vue.extend({
  name: 'RcFilterList',

  components: {
    RcConfirmationDialog,
    RcTooltip,
  },

  props: {
    labels: {
      type: Object as () => IFilterToolbarLabels,
      default: null,
    },
    filters: {
      type: Array as () => Array<IFilterDTO>,
      required: true,
    },
    currentFilterName: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      EFilterListEvents,
      showDeleteFilterDialog: false,
      currentFilter: {
        name: '',
        filterKey: -1,
        criteria: [],
      } as IFilterDTO,
    };
  },
  computed: {
    count(): number {
      if (this.filters && this.filters.length) {
        return this.filters.length;
      }
      return 0;
    },
  },

  watch: {
    currentFilterName: {
      handler(newName) {
        const currentFilter = this.filters.find((f) => f.name === newName);
        if (currentFilter) {
          this.currentFilter = currentFilter;
          this.onSelect(currentFilter, this.filters.indexOf(currentFilter));
        }
      },
      immediate: true,
    },
  },
  methods: {
    onDeleteConfirmation() {
      this.$emit(EFilterListEvents.deleteFilter, this.currentFilter);
      this.showDeleteFilterDialog = false;
    },

    onNew() {
      this.resetCurrentFilter();
      this.$emit(EFilterListEvents.newFilter);
    },

    onCopy() {
      if (this.currentFilter.name) {
        this.$emit(EFilterListEvents.copyFilter, this.currentFilter);
        this.$nextTick(() => {
          this.resetCurrentFilter();
        });
      }
    },

    onDelete() {
      this.showDeleteFilterDialog = true;
    },

    async onSelect(filter: IFilterDTO, index: number) {
      this.currentFilter = filter;
      this.$emit(EFilterListEvents.loadFilter, { filter, index });
    },

    resetCurrentFilter() {
      this.currentFilter = {
        name: '',
        filterKey: -1,
        criteria: [],
      } as IFilterDTO;
    },
  },
});
</script>

<style scoped lang="scss">
.break-word {
  white-space: normal;
}
</style>
