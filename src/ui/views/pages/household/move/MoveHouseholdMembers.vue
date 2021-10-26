<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <rc-page-loading v-if="loading" />
    <rc-page-content
      v-else
      :title="$t('household.move.title')"
      :show-add-button="false"
      show-back-button
      :show-edit-button="false"
      content-padding="0"
      @back="back()">
      <v-row id="scrollAnchor" no-gutters class="pt-8 px-8">
        <v-col cols="6" class="pr-3">
          <h5 class="rc-heading-5 mb-4">
            {{ $t('household.move.left.title') }}
          </h5>
          <household-card
            v-if="firstHousehold"
            :household="firstHousehold"
            position="left"
            :enabled-move="secondHousehold !== null"
            :shelter-locations="firstHouseholdShelterLocations"
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
                :is-split-mode="false"
                :loading="searchLoading"
                @search="onSearch($event)" />
            </div>
          </template>

          <household-results
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
                <v-btn icon small data-test="removeSelection" @click="removeSelection()">
                  <v-icon>
                    mdi-close
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <household-card
              v-if="secondHousehold"
              :household="secondHousehold"
              position="right"
              :enabled-move="secondHousehold !== null"
              :shelter-locations="secondHouseholdShelterLocations"
              @move="move($event)" />
          </template>
        </v-col>
      </v-row>
      <template v-if="secondHousehold" slot="actions">
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
import { RcPageContent, RcPageLoading } from '@crctech/component-library';
import {
  HouseholdCreate, ICurrentAddress, IHouseholdCreate, IMember,
} from '@crctech/registration-lib/src/entities/household-create';
import { IHouseholdCombined } from '@crctech/registration-lib/src/entities/household';
import { IOptionItemData, VForm } from '@crctech/registration-lib/src/types';
import household from '@/ui/mixins/household';
import searchHousehold from '@/ui/mixins/searchHousehold';
import HouseholdCard from '@/ui/views/pages/household/move/HouseholdCard.vue';
import HouseholdSearch from '@/ui/views/pages/registration/is-registered/HouseholdSearch.vue';
import HouseholdResults from '@/ui/views/pages/household/move/HouseholdResults.vue';
import { IEventGenericLocation } from '@/entities/event/event.types';
import helpers from '@/ui/helpers/helpers';

export interface ICriteria {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone: string;
  registrationNumber:string;
  birthDate: string;
}

export interface IMovingAddressSelection {
  sameAddressSelected: boolean;
  newAddress: ICurrentAddress;
}

export interface IMovingMember extends IMember {
  selectedCurrentAddress?: IMovingAddressSelection;
}

export interface IMovingHouseholdCreate extends IHouseholdCreate {
  movingAdditionalMembers?: IMovingMember[];
}

export default mixins(searchHousehold, household).extend({
  name: 'MoveHouseholdMembers',

  components: {
    HouseholdResults,
    HouseholdSearch,
    HouseholdCard,
    RcPageContent,
    RcPageLoading,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      loading: true,
      submitLoading: false,
      showResults: false,
      searchResultsWithoutFirst: [] as unknown as IHouseholdCombined[],
      firstHousehold: null as IMovingHouseholdCreate,
      secondHousehold: null as IMovingHouseholdCreate,
      firstHouseholdShelterLocations: [] as IEventGenericLocation[],
      secondHouseholdShelterLocations: [] as IEventGenericLocation[],
      firstHouseholdInitialPreferredLanguage: null as IOptionItemData,
      secondHouseholdInitialPreferredLanguage: null as IOptionItemData,
    };
  },

  computed: {
    currentHousehold(): HouseholdCreate {
      return this.$storage.registration.getters.householdCreate();
    },
  },

  async created() {
    // We assume the first household is in the store already. User is coming from household profile page
    if (this.currentHousehold.id === '') {
      this.back();
    } else {
      this.firstHousehold = _cloneDeep(this.currentHousehold) as IMovingHouseholdCreate;
      this.firstHousehold.movingAdditionalMembers = [];
      const firstHouseholdData = await this.$storage.household.actions.fetch(this.currentHousehold.id);
      this.firstHouseholdShelterLocations = await this.fetchShelterLocations(firstHouseholdData, true) || [];
      this.loading = false;
    }
  },

  methods: {
    back() {
      this.$router.back();
    },

    async onSearch(criteria: ICriteria) {
      await this.search(criteria);
      this.searchResultsWithoutFirst = this.searchResults.filter((h) => h.entity.id !== this.firstHousehold.id);
      this.showResults = true;
    },

    onSelect({ household, shelterLocations }:{household: IMovingHouseholdCreate, shelterLocations:IEventGenericLocation[]}) {
      this.secondHousehold = _cloneDeep(household) as IMovingHouseholdCreate;
      this.secondHousehold.movingAdditionalMembers = [];
      this.secondHouseholdShelterLocations = shelterLocations || [];
    },

    onReset() {
      this.showResults = false;
    },

    removeSelection() {
      this.secondHousehold = null;
      this.firstHousehold = _cloneDeep(this.currentHousehold) as IMovingHouseholdCreate;
      this.firstHousehold.movingAdditionalMembers = [];
    },

    move({ member, direction }: {member: IMember, direction: string}) {
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
      }
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
