<template>
  <rc-page-content
    :title="$t('impactedIndividuals.impactedIndividuals')"
    outer-scroll
    :show-help="false"
    content-padding="6"
    actions-padding="2">
    <rc-page-loading v-if="loading" />
    <template v-else>
      <impacted-individual-card
        :member="household.primaryBeneficiary"
        is-primary-member
        :shelter-locations-list="shelterLocations"
        :impacted-individuals="caseFile.impactedIndividuals"
        :case-file-id="caseFileId"
        data-test="primary_impacted_individual_card" />
      <div v-for="(member, index) in household.additionalMembers" :key="member.id">
        <impacted-individual-card
          :member="member"
          :index="index"
          :shelter-locations-list="shelterLocations"
          :impacted-individuals="caseFile.impactedIndividuals"
          :case-file-id="caseFileId" />
      </div>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import { useHouseholdStore } from '@/pinia/household/household';
import { IHouseholdCreate } from '@libs/entities-lib/household-create';
import { useRegistrationStore } from '@/pinia/registration/registration';
import household from '@/ui/mixins/household';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import mixins from 'vue-typed-mixins';
import ImpactedIndividualCard from './components/ImpactedIndividualCard.vue';

export default mixins(household).extend({
  name: 'ImpactedIndividuals',

  components: {
    ImpactedIndividualCard,
    RcPageContent,
    RcPageLoading,
  },

  data() {
    return {
      loading: false,
      caseFileId: this.id,
    };
  },

  computed: {
    caseFile(): ICaseFileEntity {
      return useCaseFileStore().getById(this.caseFileId);
    },

    household(): IHouseholdCreate {
      return useRegistrationStore().getHouseholdCreate();
    },

    householdEntity(): IHouseholdEntity {
      return useHouseholdStore().getById(this.caseFile.householdId);
    },
  },

  async created() {
    this.loading = true;
    await this.fetchHouseholdInfo();
    await this.fetchData();
    this.loading = false;
  },

  methods: {
    async fetchData() {
      this.caseFiles = await this.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId(this.caseFile.householdId);
      await this.fetchMyEvents();
      await this.fetchShelterLocations();
    },

      async fetchHouseholdInfo() {
        await useHouseholdStore().fetch(this.caseFile.householdId);
        await this.setHouseholdCreate();
    },

    async setHouseholdCreate() {
      if (this.householdEntity) {
        const householdCreateData = await this.buildHouseholdCreateData(this.householdEntity);
        useRegistrationStore().setHouseholdCreate(householdCreateData);
      }
    },
  },
});
</script>
