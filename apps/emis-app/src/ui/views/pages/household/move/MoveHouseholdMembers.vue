<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <rc-page-loading v-if="loading" />
    <rc-page-content
      v-else
      :title="$t('household.move.title')"
      :show-add-button="false"
      :show-back-button="!moveSubmitted"
      :show-edit-button="false"
      content-padding="0"
      @back="back()">
      <v-row id="scrollAnchor" no-gutters class="py-8 px-8">
        <v-col v-if="moveSubmitted" cols="12" class="d-flex align-center mt-6 mb-10 flex-column">
          <h1 style="font-weight: 500">
            {{ $t("household.move.saved_successfully") }}
          </h1>
          <div class="rc-body14">
            {{ $t("household.move.select_household") }}
          </div>
        </v-col>
        <v-col cols="6" class="pr-3">
          <h5 class="rc-heading-5 mb-4">
            {{ $t('household.move.left.title') }}
          </h5>
          <household-card
            v-if="firstHousehold"
            :household="firstHousehold"
            position="left"
            :enabled-move="secondHousehold !== null && !submitError && secondHousehold.primaryBeneficiary !== null"
            :shelter-locations="firstHouseholdShelterLocations"
            :move-submitted="moveSubmitted"
            @move="move($event)" />
        </v-col>
        <v-col cols="6" class="pl-3">
          <template v-if="!showResults">
            <h5 class="rc-heading-5 mb-4">
              {{ $t('household.move.search.title') }}
            </h5>
            <div v-if="!showResults" class="border py-2 px-4">
              <household-search
                hide-title
                same-line
                :loading="searchLoading"
                @search="onSearch($event)" />
            </div>
          </template>

          <household-results-move
            v-if="showResults && !secondHousehold"
            :items="searchResultsWithoutFirst"
            @reset="onReset()"
            @select="onSelect($event)" />

          <template v-if="secondHousehold">
            <v-row>
              <v-col cols="11">
                <h5 class="rc-heading-5 mb-4">
                  {{ $t('household.move.right.title') }}
                </h5>
              </v-col>
              <v-col cols="1">
                <v-btn v-if="!moveSubmitted" icon small data-test="removeSelection" @click="removeSelection()">
                  <v-icon>
                    mdi-close
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <household-card
              v-if="secondHousehold"
              :loading="householdLoading"
              data-test="second_card"
              :household="secondHousehold"
              position="right"
              :enabled-move="secondHousehold !== null && !submitError && firstHousehold.primaryBeneficiary !== null"
              :shelter-locations="secondHouseholdShelterLocations"
              :move-submitted="moveSubmitted"
              @move="move($event)" />
          </template>
        </v-col>
      </v-row>

      <template v-if="secondHousehold && !moveSubmitted" slot="actions">
        <v-btn data-test="cancel" @click="removeSelection()">
          {{ $t('common.buttons.cancel') }}
        </v-btn>
        <v-btn color="primary" data-test="save" :loading="submitLoading" :disabled="failed || !dirty" @click="submitMove">
          {{ $t('common.buttons.save') }}
        </v-btn>
      </template>
    </rc-page-content>
  </validation-observer>
</template>

<script lang="ts">
import _cloneDeep from 'lodash/cloneDeep';
import mixins from 'vue-typed-mixins';
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import {
  HouseholdCreate, ICurrentAddress, IHouseholdCreate, IMember,
} from '@libs/entities-lib/household-create';
import { IHouseholdCombined } from '@libs/entities-lib/household';
import { VForm, IHouseholdSearchCriteria } from '@libs/registration-lib/types';
import household from '@/ui/mixins/household';
import searchHousehold from '@/ui/mixins/searchHousehold';
import HouseholdCard from '@/ui/views/pages/household/move/HouseholdCard.vue';
import HouseholdSearch from '@/ui/views/pages/household/search/HouseholdSearch.vue';
import HouseholdResultsMove from '@/ui/views/pages/household/move/HouseholdResultsMove.vue';
import { IEventGenericLocation } from '@libs/entities-lib/event/event.types';
import helpers from '@/ui/helpers/helpers';
import { useRegistrationStore } from '@/pinia/registration/registration';

export interface IMovingAddressSelection {
  sameAddressSelected: boolean;
  newAddress: ICurrentAddress;
}

export interface IMovingMember extends IMember {
  selectedCurrentAddress?: IMovingAddressSelection;
}

export interface IMovingHouseholdCreate extends IHouseholdCreate {
  movingAdditionalMembers?: IMovingMember[];
  hasOutstandingPayments?: boolean;
}

export default mixins(searchHousehold, household).extend({
  name: 'MoveHouseholdMembers',

  components: {
    HouseholdResultsMove,
    HouseholdSearch,
    HouseholdCard,
    RcPageContent,
    RcPageLoading,
  },

  data() {
    return {
      loading: true,
      householdLoading: true,
      submitLoading: false,
      showResults: false,
      searchResultsWithoutFirst: [] as unknown as IHouseholdCombined[],
      firstHousehold: null as IMovingHouseholdCreate,
      secondHousehold: null as IMovingHouseholdCreate,
      firstHouseholdShelterLocations: [] as IEventGenericLocation[],
      secondHouseholdShelterLocations: [] as IEventGenericLocation[],
      moveSubmitted: false,
      submitError: false,
    };
  },

  computed: {
    currentHousehold(): HouseholdCreate {
      return useRegistrationStore().getHouseholdCreate();
    },
  },

  async created() {
    // We assume the first household is in the store already. User is coming from household profile page
    if (!this.currentHousehold || this.currentHousehold.id === '') {
      this.back();
    } else {
      const { household, shelterLocations } = await this.makeHousehold();
      this.firstHousehold = household;
      this.firstHouseholdShelterLocations = shelterLocations;
      this.loading = false;
    }
  },

  methods: {
    back() {
      this.$router.back();
    },

    async onSearch(criteria: IHouseholdSearchCriteria) {
      await this.search(criteria);
      this.searchResultsWithoutFirst = this.searchResults.filter((h) => h.entity.id !== this.firstHousehold.id);
      this.showResults = true;

      // Hide the results on the main household search page, because they use the same store
      this.$storage.household.mutations.setSearchResultsShown(false);
    },

    async onSelect(householdId: string) {
      this.submitError = false;
      this.householdLoading = true;
      try {
        const { household, shelterLocations } = await this.makeHousehold(householdId);
        this.secondHousehold = household;
        this.secondHouseholdShelterLocations = shelterLocations;
      } finally {
        this.householdLoading = false;
      }
    },

    async makeHousehold(householdId?:string): Promise<{ household: IMovingHouseholdCreate, shelterLocations: IEventGenericLocation[] }> {
      let movingHousehold = this.currentHousehold as IMovingHouseholdCreate;
      if (householdId) {
        const householdCreateData = await this.fetchHouseholdCreate(householdId);
        movingHousehold = new HouseholdCreate(householdCreateData) as IMovingHouseholdCreate;
      }

      const shelterLocations = await this.fetchShelterLocations(movingHousehold.id);
      movingHousehold.movingAdditionalMembers = [];
      movingHousehold.hasOutstandingPayments = (await this.$services.households.hasOutstandingPayments(movingHousehold.id))
        ?.hasOutstandingPayments;
      return { household: movingHousehold, shelterLocations };
    },

    onReset() {
      this.showResults = false;
    },

    async removeSelection() {
      this.secondHousehold = null;
      const hasOutstandingPayments = this.firstHousehold.hasOutstandingPayments;
      this.firstHousehold = _cloneDeep(this.currentHousehold) as IMovingHouseholdCreate;
      this.firstHousehold.movingAdditionalMembers = [];
      this.firstHousehold.hasOutstandingPayments = hasOutstandingPayments;
    },

    move({ member, direction }: { member: IMember, direction: string }) {
      if (direction === 'left') {
        const { originHousehold, targetHousehold } = this.moveMember(member, this.secondHousehold, this.firstHousehold);
        this.firstHousehold = targetHousehold;
        this.secondHousehold = originHousehold;
      }

      if (direction === 'right') {
        const { originHousehold, targetHousehold } = this.moveMember(member, this.firstHousehold, this.secondHousehold);
        this.firstHousehold = originHousehold;
        this.secondHousehold = targetHousehold;
      }
    },

    moveMember(member: IMovingMember, originHouseholdData: IMovingHouseholdCreate, targetHouseholdData:IMovingHouseholdCreate) {
      const movingMember = _cloneDeep(member);
      const originHousehold = _cloneDeep(originHouseholdData);
      const targetHousehold = _cloneDeep(targetHouseholdData);

      // Whether the member moves back to his initial household or moves to a new household
      const memberMovesBack = originHousehold.movingAdditionalMembers.find((m) => m.id === member.id);

      if (!memberMovesBack) {
        // If the member moves into a new household, his moving data is initialized, he isadded to the list of movingAdditionalMembers of this household
        movingMember.selectedCurrentAddress = { sameAddressSelected: null, newAddress: null };
        targetHousehold.movingAdditionalMembers.push(movingMember);

        // ...and he is removed either from the list of additional members or as primary member, if he's the only member of the household
        if (originHousehold.additionalMembers.length === 0 && originHousehold.movingAdditionalMembers.length === 0) {
          originHousehold.setPrimaryBeneficiary(null);
        } else {
          const index = originHousehold.additionalMembers.findIndex((m) => m.id === member.id);
          originHousehold.removeAdditionalMember(index);
        }
      } else {
        // If the member moves back to his initial household, he is removed from the list of movingAdditionalMembers of the other household
        movingMember.selectedCurrentAddress = null;
        originHousehold.movingAdditionalMembers = originHousehold.movingAdditionalMembers.filter((m) => m.id !== member.id);

        // ...and added back as a member of his initial household
        targetHousehold.addAdditionalMember(movingMember, false);
      }

      return { originHousehold, targetHousehold };
    },

    async submitMove() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (!isValid) {
        helpers.scrollToFirstError('scrollAnchor');
      } else {
        this.setNewMembers(this.firstHousehold);
        this.setNewMembers(this.secondHousehold);
        this.submitLoading = true;
        const response = await this.$services.households.moveMembers(this.firstHousehold, this.secondHousehold);
        if (response) {
          this.moveSubmitted = true;
        } else {
          this.submitError = true;
        }
        this.submitLoading = false;
      }
    },

    setNewMembers(household: IMovingHouseholdCreate) {
      household.movingAdditionalMembers.forEach((m:IMovingMember) => {
        m.setCurrentAddress(m.selectedCurrentAddress.sameAddressSelected
          ? household.primaryBeneficiary.currentAddress : m.selectedCurrentAddress.newAddress);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { selectedCurrentAddress, ...memberData } = m;
        household.addAdditionalMember(memberData, false);
      });

      household.movingAdditionalMembers = [];
      return household;
    },

  },
});
</script>

<style lang="scss" scoped>
.border {
  border: 1px solid var(--v-grey-lighten2);
  border-radius: 4px;
}
</style>
