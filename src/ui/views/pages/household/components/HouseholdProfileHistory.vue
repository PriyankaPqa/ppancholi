<template>
  <rc-dialog
    :title="$t('household.profile.history.title')"
    :show.sync="show"
    :submit-action-label="$t('common.close')"
    :content-only-scrolling="true"
    content-padding="0"
    fullscreen
    persistent
    show-close
    :loading="loading"
    :show-cancel="false"
    @close="$emit('update:show', false)"
    @submit="$emit('update:show', false)">
    <rc-data-table
      data-test="household-profile-history-table"
      :items="displayedItems"
      :count="displayedItems.length"
      :headers="headers"
      :options.sync="options"
      :custom-columns="Object.values(customColumns)"
      hide-header
      hide-footer>
      <template #[`item.${customColumns.editedBy}`]="{ item }">
        <div class="d-flex flex-column full-height py-2" data-test="household_history_edited-by">
          <span class="fw-bold">{{ item.userName }}</span>
          <span class="rc-body12">{{ $m(item.roleName) }}</span>
        </div>
      </template>

      <template #[`item.${customColumns.dateOfChange}`]="{ item }">
        <div class="full-height py-2" data-test="household_history_date-of-change">
          {{ moment(item.timestamp).format('ll') }}
        </div>
      </template>

      <template #[`item.${customColumns.changeType}`]="{ item }">
        <div class="py-2 full-height" data-test="household_history_last-action">
          <span> {{ item.lastActionName }} </span>
        </div>
      </template>

      <template #[`item.${customColumns.previousValue}`]="{ item }">
        <div class="py-2 full-height d-flex flex-column" data-test="household_history_previous-value">
          <div v-for="(data, index) in item.templatePreviousData" :key="index + data.label" class="pre-line">
            {{ data.label === "—" || data.label === "\n"? data.label : $t(data.label) }}
            {{ data.label && data.value? ":" : "" }}
            {{ data.value ? data.value : "" }}
          </div>
        </div>
      </template>

      <template #[`item.${customColumns.newValue}`]="{ item }">
        <div class="py-2 full-height  d-flex flex-column" data-test="household_history_new-value">
          <div v-for="(data, index) in item.templateData" :key="index + data.label" class="pre-line">
            {{ data.label === "—" || data.label === "\n"? data.label : $t(data.label) }}
            {{ data.label && data.value? ":" : "" }}
            {{ data.value ? data.value : "" }}
          </div>
        </div>
      </template>
    </rc-data-table>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import { RcDialog, RcDataTable } from '@crctech/component-library';
import { DataTableHeader } from 'vuetify';
import { IHouseholdEntity } from '@crctech/registration-lib/src/entities/household';

import { IVersionedEntityCombined, IHistoryItemTemplateData } from '@crctech/registration-lib/src/entities/value-objects/versioned-entity';
import moment from '@/ui/plugins/moment';

interface IHistoryItem extends IVersionedEntityCombined {
  lastActionName: string;
  templateData: IHistoryItemTemplateData[]
  templatePreviousData: IHistoryItemTemplateData[]
}

export default Vue.extend({
  name: 'HouseholdProfileHistory',

  components: {
    RcDialog,
    RcDataTable,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    household: {
      type: Object as ()=> IHouseholdEntity,
      required: true,
    },
  },

  data() {
    return {
      moment,
      i18n: this.$i18n,
      historyItems: [] as IVersionedEntityCombined[],
      loading: true,
      options: {
        sortBy: ['timestamp'],
        sortDesc: [true],
      },
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        editedBy: 'userName',
        dateOfChange: 'timestamp',
        changeType: 'lastActionName',
        previousValue: 'previousValue',
        newValue: 'newValue',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('household.profile.history.edited_by') as string,
          sortable: true,
          value: this.customColumns.editedBy,
          width: '15%',
        },
        {
          text: this.$t('household.profile.history.date_of_change') as string,
          sortable: true,
          value: this.customColumns.dateOfChange,
          width: '15%',
        },
        {
          text: this.$t('household.profile.history.what_changed') as string,
          sortable: true,
          value: this.customColumns.changeType,
          width: '15%',
        },
        {
          text: this.$t('household.profile.history.previous_value') as string,
          sortable: false,
          value: this.customColumns.previousValue,
          width: '25%',
        },
        {
          text: this.$t('household.profile.history.new_value') as string,
          sortable: false,
          value: this.customColumns.newValue,
          width: '25%',
        },
      ];
    },

    displayedItems():IHistoryItem[] {
      const items = this.historyItems.map((i) => ({
        ...i,
        lastActionName: this.$t(i.getLastActionName()) as string,
        templateData: i.getTemplateData(this.historyItems, false, this.$i18n),
        templatePreviousData: i.getTemplateData(this.historyItems, true, this.$i18n),
      })).filter((item) => !!item.templateData);

      return _orderBy(items, this.options.sortBy[0], this.options.sortDesc[0] ? 'desc' : 'asc');
    },
  },

  async created() {
    if (this.household) {
      try {
        this.historyItems = await this.$storage.household.actions.fetchHouseholdHistory(this.household);
      } finally {
        this.loading = false;
      }
    }
  },

});
</script>

<style scoped lang="scss">

  .pre-line {
    white-space: pre-line;
  }

  .full-height {
    height: 100%;
  }

</style>
