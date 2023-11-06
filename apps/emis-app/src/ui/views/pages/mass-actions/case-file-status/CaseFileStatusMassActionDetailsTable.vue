<template>
  <div>
    <div class="rc-heading-5 fw-bold mb-6">
      {{ $t('massAction.caseFileStatus.create.details') }}
    </div>

    <v-row v-for="(row, index) in rows" :key="index" no-gutters :class="[row.customClass, 'row-data']">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t(row.label) }}</span>
      </v-col>
      <v-col md="7">
        <span v-if="!row.loading" :class="[row.customClassValue, 'rc-body14']" :data-test="row.dataTest">
          <!-- eslint is disabled because we purposefully decided to inject html in this -->
          <!-- eslint-disable -->
          <p v-if="row.html" v-html="row.html"/>
          <!-- eslint-enable -->
          <div v-else>{{ row.value }}</div>
        </span>
        <v-progress-circular v-else indeterminate color="primary" />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { IMassActionCaseFileStatusDetails, IMassActionEntity } from '@libs/entities-lib/mass-action';
import { IEventMetadata } from '@libs/entities-lib/event';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { ICombinedIndex, IMultilingual } from '@libs/shared-lib/types';
import { IEventData } from '@libs/entities-lib/registration-event';

export default Vue.extend({
  name: 'CaseFileStatusMassActionDetailsTable',

  props: {
    massAction: {
      type: Object as () => IMassActionEntity,
      required: true,
    },
  },

  data() {
    return {
      event: null as IEventData,
      eventLoading: false,
      reason: null as IMultilingual,
      otherReason: '',
    };
  },

  computed: {
    rows(): Record<string, unknown>[] {
      const rationale = (this.massAction.details as IMassActionCaseFileStatusDetails).rationale;

      const rows = [
        {
          label: 'massAction.caseFileStatus.create.event.label',
          value: this.$m(this.event?.name),
          dataTest: 'event',
          loading: this.eventLoading,
        },
        {
          label: 'massAction.caseFileStatus.create.status.label',
          value: this.$t(`enums.CaseFileStatus.${CaseFileStatus[(this.massAction.details as IMassActionCaseFileStatusDetails).status]}`),
          dataTest: 'status',
        },
        this.reason && {
          label: 'massAction.caseFileStatus.reason.label',
          value: this.$m(this.reason),
          dataTest: 'reason',
        },
        this.otherReason && {
          label: 'massAction.caseFileStatus.otherReason.label',
          value: this.otherReason,
          dataTest: 'otherReason',
        },
        rationale && {
          label: 'caseFile.changeStatusConfirm.Rationale',
          value: rationale,
          dataTest: 'rationale',
        },
      ];

      return rows.filter((r) => r);
    },
  },

  async created() {
    const promises: Promise<void | IOptionItem[]>[] = [this.fetchEvent()];
    const details = this.massAction.details as IMassActionCaseFileStatusDetails;
    if (details?.status === CaseFileStatus.Inactive) {
      promises.push(useCaseFileStore().fetchInactiveReasons());
    } else if (details?.status === CaseFileStatus.Closed) {
      promises.push(useCaseFileStore().fetchCloseReasons());
    }
    await Promise.all(promises);
    this.makeReasonLabels();
  },

  methods: {
    async fetchEvent() {
      this.eventLoading = true;
      const eventSearchResult = await this.$services.publicApi.searchEventsById([this.massAction.details.eventId]);
      this.event = (eventSearchResult?.value?.[0] as ICombinedIndex<IEventData, IEventMetadata>)?.entity;
      this.eventLoading = false;
    },

    makeReasonLabels() {
      const details = this.massAction.details as IMassActionCaseFileStatusDetails;
      const maReason = details?.reason;
      if (!maReason) {
        return;
      }

      // eslint-disable-next-line no-nested-ternary
      const reasons: IOptionItem[] = details.status === CaseFileStatus.Inactive ? useCaseFileStore().getInactiveReasons(false)
      : details.status === CaseFileStatus.Closed ? useCaseFileStore().getCloseReasons(false)
      : [];
      const reasonData = reasons.find((t) => t.id === maReason.optionItemId);

      this.reason = reasonData?.name;
      if (reasonData?.isOther && maReason.specifiedOther) {
        this.otherReason = maReason.specifiedOther;
      }
    },
  },
});
</script>

<style lang="scss" scoped>

.grey-back {
  background-color: var(--v-grey-lighten5);
}

.row-data {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: solid var(--v-grey-lighten2);
  border-width: 1px 1px 0px 1px;
}
.row-data:last-child {
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-width: 1px 1px 1px 1px;
}
.row-data:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-width: 1px 1px 0px 1px;
}
.row-data:only-child {
  border-width: 1px 1px 1px 1px;
}

</style>
