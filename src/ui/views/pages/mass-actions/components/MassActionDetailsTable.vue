<template>
  <div>
    <v-row no-gutters class="row-data">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t('massActions.type') }}</span>
      </v-col>
      <v-col md="7">
        <span class="rc-body14" data-test="massActionType">{{ $t(massActionType) }}</span>
      </v-col>
    </v-row>

    <v-row no-gutters class="row-data">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t('massActions.date_created') }}</span>
      </v-col>
      <v-col md="7">
        <span class="rc-body14" data-test="dateCreated">{{ moment(massAction.entity.created).local().format('ll') }}</span>
      </v-col>
    </v-row>

    <v-row no-gutters class="row-data">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t('massActions.created_by') }}</span>
      </v-col>
      <v-col md="7">
        <span v-if="userAccount" class="rc-body14" data-test="createdBy">{{ userAccount.metadata.displayName }}</span>
        <v-progress-circular v-else indeterminate color="primary" />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import { IMassActionCombined, MassActionRunStatus } from '@/entities/mass-action';

export default Vue.extend({
  name: 'MassActionDetailsTable',

  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
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
      MassActionRunStatus,
      loading: false,
    };
  },

  async mounted() {
    this.loading = true;
    this.userAccount = await this.$storage.userAccount.actions.fetch(this.massAction.entity.createdBy);
    this.loading = false;
  },
});
</script>

<style lang="scss" scoped>
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
