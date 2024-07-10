<template>
  <rc-page-content
    :title="$t('impactedIndividuals.impactedIndividuals')"
    outer-scroll
    :show-help="false"
    content-padding="6"
    actions-padding="2">
    <rc-page-loading v-if="loading" />
    <template v-else>
      <div v-for="individual in individuals" :key="individual.id">
        <impacted-individual-card-v2
          :individual="individual"
          :is-primary-member="household && household.primaryBeneficiary === individual.personId"
          :shelter-locations-list="event && event.shelterLocations"
          :case-file-id="caseFileId"
          :data-test="household && household.primaryBeneficiary === individual.personId ? 'primary_impacted_individual_card' : 'non_primary_impacted_individual_card'"
          :disable-editing-by-status="disableEditingByStatus" />
      </div>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import mixins from 'vue-typed-mixins';
import caseFileDetail from '../caseFileDetail';
import ImpactedIndividualCardV2 from './components/ImpactedIndividualCardV2.vue';

export default mixins(caseFileDetail).extend({
  name: 'ImpactedIndividuals',

  components: {
    ImpactedIndividualCardV2,
    RcPageContent,
    RcPageLoading,
  },

  data() {
    return {
      loading: false,
    };
  },

  computed: {
    disableEditingByStatus(): boolean {
      const caseFileStatusReadOnly = [CaseFileStatus.Closed, CaseFileStatus.Archived, CaseFileStatus.Inactive];
      return caseFileStatusReadOnly.indexOf(this.caseFile.caseFileStatus) > -1;
    },
  },
});
</script>
