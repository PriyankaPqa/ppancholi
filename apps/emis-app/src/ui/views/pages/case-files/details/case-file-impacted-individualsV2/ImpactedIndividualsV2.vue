<template>
  <rc-page-content
    :title="$t('impactedIndividuals.impactedIndividuals')"
    outer-scroll
    :show-help="false"
    content-padding="6"
    actions-padding="2">
    <rc-page-loading v-if="loading" />
    <template v-else>
      V2!!!
      <div v-for="(individual, index) in individuals" :key="individual.id">
        <impacted-individual-card-v2
          :individual="individual"
          :is-primary-member="household && household.primaryBeneficiary === individual.personId"
          :index="index"
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
import { CaseFileIndividualEntity } from '@libs/entities-lib/case-file-individual';
import { useCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual';
import { usePersonStore } from '@/pinia/person/person';
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

    individuals(): CaseFileIndividualEntity[] {
      return useCaseFileIndividualStore().getByCaseFile(this.caseFileId).sort((x) => (this.household?.primaryBeneficiary === x.personId ? -1 : 1))
        .map((i) => new CaseFileIndividualEntity(i));
    },
  },

  async created() {
    this.loading = true;
    const individuals = await useCaseFileIndividualStore().fetchAll({ caseFileId: this.caseFileId });
    await usePersonStore().fetchByIds(individuals.map((i) => i.personId), true);
    this.loading = false;
  },
});
</script>
