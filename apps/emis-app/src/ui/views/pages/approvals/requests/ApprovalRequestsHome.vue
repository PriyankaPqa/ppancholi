<template>
  <rc-page-content
    content-padding="2"
    :title="$t('approval.title')">
    <rc-tabs class="mt-4 mb-0">
      <rc-tab
        v-for="tab in tabs"
        :key="tab"
        :label="$t(`approval.requests.title.${SelectedTab[tab]}`)"
        :data-test="`approval.requests.title.--${SelectedTab[tab]}`"
        :active="selectedTab === tab"
        @click="selectedTab = tab" />
    </rc-tabs>

    <approval-requests-table
      v-if="selectedTab === SelectedTab.Pending"
      :key="SelectedTab.Pending"
      :is-pending-requests="true"
      data-test="approval-requests-table-pending" />

    <approval-requests-table
      v-else
      :key="SelectedTab.Approved"
      data-test="approval-requests-table-approved" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcTab, RcTabs, RcPageContent } from '@libs/component-lib/components';
import { useUserAccountStore } from '@/pinia/user-account/user-account';
import ApprovalRequestsTable from './ApprovalRequestsTable.vue';

export enum SelectedTab {
  Pending = 1,
  Approved = 2,
}

export default Vue.extend({
  components: {
    ApprovalRequestsTable,
    RcPageContent,
    RcTab,
    RcTabs,
  },

  data() {
    return {
      tabs: [SelectedTab.Pending, SelectedTab.Approved],
      SelectedTab,
      selectedTab: SelectedTab.Pending,
    };
  },

  async created() {
   await useUserAccountStore().fetchRoles();
  },

});
</script>

<style scoped>
.pageContentCard__content {
  overflow-y: inherit;
}
</style>
