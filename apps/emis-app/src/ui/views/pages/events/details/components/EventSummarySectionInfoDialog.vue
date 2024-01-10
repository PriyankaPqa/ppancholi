<template>
  <rc-dialog
    :title="title"
    :show.sync="show"
    :submit-action-label="$t('common.buttons.close')"
    :show-cancel="false"
    :content-only-scrolling="true"
    :persistent="true"
    :max-width="750"
    :min-height="375"
    data-test="event-section-info-dialog"
    @close="$emit('close')"
    @submit="$emit('close')">
    <v-container class="pa-0">
      <v-row class="d-flex justify-space-between pr-0 no-gutters">
        <v-col
          col="12"
          class="py-0 pl-2 pr-0 d-flex align-center justify-space-between rc-body18  font-weight-bold">
          <span class="py-1" data-test="event-section-info-dialog-name">{{ name }}</span>
          <div class="d-flex justify-end align-center py-0">
            <status-chip
              v-if="status"
              status-name="EEventCallCentreStatus"
              :status="status"
              data-test="event-section-info-dialog-status" />

            <v-btn
              v-if="canEdit"
              icon
              class="mx-2"
              :aria-label="$t('common.edit')"
              data-test="edit-section-from-info-dialog"
              @click="$emit('edit')">
              <v-icon size="24" color="grey darken-2">
                mdi-pencil
              </v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-simple-table>
        <template #default>
          <tbody>
            <tr v-for="item in tableData" :key="item.key">
              <td
                class="rc-body10 font-weight-bold table-label"
                data-test="event-status-info-table-key">
                {{ $t(item.key) }}
              </td>
              <td data-test="event-status-info-table-value" class="table-value">
                {{ item.value }}
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-container>
  </rc-dialog>
</template>

<script lang='ts'>
import Vue from 'vue';
import { RcDialog } from '@libs/component-lib/components';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

export default Vue.extend({
  name: 'EventSummarySectionInfoDialog',

  components: {
    StatusChip,
    RcDialog,
  },

  props: {
    tableData: {
      type: Object as () => Record<string, unknown>,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 0,
    },
    /**
     * Whether the user can edit event sections
     */
    canEdit: {
      type: Boolean,
      required: true,
    },
  },

});
</script>

<style scoped>
::v-deep table {
  margin-top: 8px;
  border: 1px solid var(--v-grey-lighten2);
  border-radius: 4px;
}

::v-deep .theme--light.v-btn:hover::before{
  opacity: 0.2;
}

.table-label {
  width: 30%;
}

.table-value {
  white-space: pre-line;
}

</style>
