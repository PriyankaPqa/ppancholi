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
          <span class="rc-body12">{{ item.role ? $m(item.role.name) : '' }}</span>
        </div>
      </template>

      <template #[`item.${customColumns.dateOfChange}`]="{ item }">
        <div class="full-height py-2" data-test="household_history_date-of-change">
          {{ moment(item.timestamp).format('ll') }}
        </div>
      </template>

      <template #[`item.${customColumns.changeType}`]="{ item }">
        <div class="py-2 full-height" data-test="household_history_last-action">
          <span> {{ item.activityName }} </span>
        </div>
      </template>

      <template #[`item.${customColumns.previousValue}`]="{ item }">
        <div class="py-2 full-height d-flex flex-column" data-test="household_history_previous-value">
          <div v-for="(data, index) in item.templatePreviousData" :key="index + data.label" class="pre-line">
            {{ data.label === "—" || data.label === "\n" ? data.label : $t(data.label) }}
            {{ data.label && data.value ? ":" : "" }}
            {{ data.value ? data.value : "" }}
          </div>
        </div>
      </template>

      <template #[`item.${customColumns.newValue}`]="{ item }">
        <div class="py-2 full-height  d-flex flex-column" data-test="household_history_new-value">
          <div v-for="(data, index) in item.templateData" :key="index + data.label" class="pre-line">
            {{ data.label === "—" || data.label === "\n" ? data.label : $t(data.label) }}
            {{ data.label && data.value ? ":" : "" }}
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
import { RcDialog, RcDataTable } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';

import { IHistoryItemTemplateData } from '@libs/entities-lib/value-objects/versioned-entity';
import {
  IHouseholdActivity, HouseholdActivity, HouseholdActivityType, IHouseholdActivityMembers,
}
  from '@libs/entities-lib/value-objects/household-activity';
import moment from '@libs/shared-lib/plugins/moment';
import { system } from '@/constants/system';

interface IActivityItem extends IHouseholdActivity {
  activityName: string;
  templateData: IHistoryItemTemplateData[];
  templatePreviousData: IHistoryItemTemplateData[];
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

    activityItemsData: {
      type: Array as () => IHouseholdActivity[],
      required: true,
    },
  },

  data() {
    return {
      moment,
      i18n: this.$i18n,
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
        changeType: 'activityName',
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
        },
        {
          text: this.$t('household.profile.history.date_of_change') as string,
          sortable: true,
          value: this.customColumns.dateOfChange,
        },
        {
          text: this.$t('household.profile.history.what_changed') as string,
          sortable: true,
          value: this.customColumns.changeType,
        },
        {
          text: this.$t('household.profile.history.previous_value') as string,
          sortable: false,
          value: this.customColumns.previousValue,
        },
        {
          text: this.$t('household.profile.history.new_value') as string,
          sortable: false,
          value: this.customColumns.newValue,
        },
      ];
    },

    displayedItems():IActivityItem[] {
      const processedData = this.handleMoveActivity(this.activityItemsData);
      const activityItems = processedData.length ? processedData.map((i: IHouseholdActivity) => new HouseholdActivity(i)) : [];

      const items = activityItems.map((i) => ({
        ...i,
        activityName: this.$t(i.getActivityName()) as string,
        templateData: i.getTemplateData(false, this.$i18n),
        templatePreviousData: i.getTemplateData(true, this.$i18n),
        // eslint-disable-next-line no-nested-ternary
        userName: i.user?.id === system.public_user_id ? this.$t('system.public_user_id') : (
          i.user?.id === system.system_user_id ? this.$t('system.system_user_id') : i.user?.name
        ),
      }));
      return _orderBy(items, this.options.sortBy[0], this.options.sortDesc[0] ? 'desc' : 'asc');
    },
  },

  methods: {
    handleMoveActivity(activityList: IHouseholdActivity[]):IHouseholdActivity[] {
      if (!activityList) {
        return [];
      }
      let processedList = [] as IHouseholdActivity[];
      activityList.forEach((item: IHouseholdActivity) => {
        // If the move data contains both moved in and moved out members, split the activity into two lines, one for the moved in, one for the moved out members
        if (item.activityType === HouseholdActivityType.HouseholdMoved
        && (item.previousDetails as IHouseholdActivityMembers).memberDetails.length
        && (item.newDetails as IHouseholdActivityMembers).memberDetails.length
        ) {
          const movedOut = { ...item, newDetails: null as unknown };
          const movedIn = { ...item, previousDetails: null as unknown };
          processedList = processedList.concat([movedOut, movedIn]);
        } else {
          processedList.push(item);
        }
      });

      return processedList;
    },
  },

});
</script>

<style scoped lang="scss">

::v-deep .v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
  height: 100%;
}

  .pre-line {
    white-space: pre-line;
  }

  .full-height {
    height: 100%;
  }

</style>
