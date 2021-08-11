<template>
  <div>
    <mass-action-processing-base
      :mass-action="massAction"
      chip-title="common.preProcessing"
      :process-title="processTitle"
      :process-label-one="processLabelOne"
      :process-label-two="processLabelTwo">
      <template #preprocessing>
        <div>
          <div class="row-data">
            <span class="rc-body14 fw-bold">{{ $t('massActions.type') }}</span>
            <span class="rc-body14" data-test="massActionType">{{ $t(massActionType) }}</span>
          </div>
          <div class="row-data">
            <span class="rc-body14 fw-bold">{{ $t('massActions.date_created') }}</span>
            <span class="rc-body14" data-test="dateCreated">{{ moment(massAction.entity.created).local().format('ll') }}</span>
          </div>
          <div class="row-data">
            <span class="rc-body14 fw-bold">{{ $t('massActions.created_by') }}</span>
            <span v-if="userAccount" class="rc-body14" data-test="createdBy">{{ userAccount.metadata.displayName }}</span>
          </div>
        </div>
      </template>
    </mass-action-processing-base>

    <slot name="secondaryTable" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import { IMassActionCombined } from '@/entities/mass-action';

import MassActionProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionProcessingBase.vue';

export default Vue.extend({
  name: 'ImportValidationStatusPreProcessing',
  components: {
    MassActionProcessingBase,
  },

  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },

    processTitle: {
      type: String,
      default: '',
    },

    processLabelOne: {
      type: String,
      default: 'massActions.preProcessing.info1',
    },

    processLabelTwo: {
      type: String,
      default: 'massActions.preProcessing.info2',
    },

    massActionType: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      moment,
      userAccount: null,
    };
  },

  async mounted() {
    this.userAccount = await this.$storage.userAccount.actions.fetch(this.massAction.entity.createdBy);
  },

});
</script>

<style lang="scss" scoped>

.row-data {
  min-height: 60px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 16px;
  border: solid var(--v-grey-lighten2);
  border-width: 1px 1px 0px 1px;

  & span:first-child {
    flex-grow: 1;
  }

  & span:last-child {
    flex-grow: 0;
  }
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
