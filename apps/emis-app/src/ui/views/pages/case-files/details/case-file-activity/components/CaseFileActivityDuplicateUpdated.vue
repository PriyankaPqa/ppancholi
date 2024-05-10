<template>
  <case-file-list-item-wrapper v-if="itemData" :item="item" sidebar-icon="$rctech-duplicate">
    <div slot="content" class="d-flex flex-column" data-test="caseFileActivity-listItem-content">
      <div class="rc-body16 fw-bold" data-test="caseFileActivity-listItem-content-title">
        {{ itemData.duplicateStatus === DuplicateStatus.Potential
          ? $t('caseFileActivity.duplicateUpdated.title.potentialDuplicate') : $t('caseFileActivity.duplicateUpdated.title.resolvedDuplicate') }}
      </div>
      <div data-test="caseFileActivity-listItem-content-body">
        <div>
          <span class="rc-body14 content-body" data-test="caseFileActivity-listItem-content-body-start">
            {{ $t(`caseFileActivity.duplicateUpdated.bodyStart.${itemData.duplicateStatus}`) }}
          </span>
          <router-link
            :to="getHouseholdRoute()"
            class="rc-link14"
            :data-test="`caseFileActivity-listItem-content-body-registration-number-${item.details.duplicateHouseholdRegistrationNumber}`">
            {{ `#${itemData.duplicateHouseholdRegistrationNumber}` }}
          </router-link>
          <span class="rc-body14" data-test="caseFileActivity-listItem-content-body-end">
            {{ $t(`caseFileActivity.duplicateUpdated.bodyEnd.${itemData.duplicateStatus}`) }}
          </span>
        </div>
        <div class="rc-body14 content-body" data-test="caseFileActivity-listItem-content-body-rationale">
          {{ itemData.duplicateStatus === DuplicateStatus.Potential
            ? $t('householdDetails.manageDuplicates.rationale')
            : $t('householdDetails.manageDuplicates.actionTakenToResolve') }}:
          {{ bodyText }}
        </div>
      </div>
    </div>
  </case-file-list-item-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import CaseFileListItemWrapper from '@/ui/views/pages/case-files/details/components/CaseFileListItemWrapper.vue';
import { DuplicateStatus } from '@libs/entities-lib/potential-duplicate';
import routes from '@/constants/routes';
import { system } from '@/constants/system';
import { ICaseFileActivityUser } from '@libs/entities-lib/case-file';
import { TranslateResult } from 'vue-i18n';

interface PotentialDuplicateDetails {
  duplicateStatus: DuplicateStatus,
  rationale: string,
  duplicateHouseholdRegistrationNumber: string,
  duplicateHouseholdId: string,
}

export default Vue.extend({
  name: 'CaseFileActivityDuplicateUpdated',
  components: {
    CaseFileListItemWrapper,
  },

  props: {
    item: {
      type: Object as () => { details: PotentialDuplicateDetails, user: ICaseFileActivityUser },
      required: true,
    },
  },

  data() {
    return {
      DuplicateStatus,
    };
  },

  computed: {
    itemData(): PotentialDuplicateDetails {
      return this.item?.details;
    },

    isFlaggedByTheSystem(): boolean {
      return this.item?.user?.id === system.system_user_id;
    },

    bodyText(): TranslateResult {
      if (this.itemData.duplicateStatus === DuplicateStatus.Potential && (this.isFlaggedByTheSystem
       || this.itemData.rationale === 'Flagged by the system')) {
        return this.$t('householdDetails.manageDuplicates.flaggedByTheSystem');
      }

      if (this.itemData.duplicateStatus === DuplicateStatus.Resolved && (this.isFlaggedByTheSystem
      || this.itemData.rationale === 'Resolved by the system')) {
        return this.$t('householdDetails.manageDuplicates.resolvedByTheSystem');
      }

      return this.itemData.rationale as TranslateResult;
    },
  },

  methods: {
    getHouseholdRoute() {
      return {
        name: routes.household.householdProfile.name,
        params: {
          id: this.item.details.duplicateHouseholdId,
        },
      };
    },

  },
});
</script>

<style scoped lang="scss">
  .content-body {
    white-space: pre-line;
  }
</style>
