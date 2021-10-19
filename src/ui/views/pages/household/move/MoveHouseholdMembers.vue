<template>
  <rc-page-content
    :title="$t('household.move.title')"
    :show-add-button="false"
    show-back-button
    :show-edit-button="false"
    content-padding="0"
    @back="back()">
    <v-row no-gutters class="pt-8 px-8">
      <v-col cols="6" class="pr-3">
        <h5 class="rc-heading-5 mb-4">
          {{ $t('household.move.left.title') }}
        </h5>
        <household-card
          v-if="firstHousehold"
          :household="firstHousehold"
          position="left"
          :show-move-button="secondHousehold !== null"
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

        <household-results v-if="showResults && !secondHousehold" :items="searchResultsWithoutFirst" @reset="onReset()" @select="onSelect($event)" />

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
            :show-move-button="secondHousehold !== null"
            @move="move($event)" />
        </template>
      </v-col>
    </v-row>
  </rc-page-content>
</template>

<script lang="ts">
import { RcPageContent } from '@crctech/component-library';
import { HouseholdCreate, IMember } from '@crctech/registration-lib/src/entities/household-create';
import mixins from 'vue-typed-mixins';
import HouseholdCard from '@/ui/views/pages/household/move/HouseholdCard.vue';
import routes from '@/constants/routes';
import HouseholdSearch from '@/ui/views/pages/registration/is-registered/HouseholdSearch.vue';
import HouseholdResults from '@/ui/views/pages/household/move/HouseholdResults.vue';
import searchHousehold from '@/ui/mixins/searchHousehold';

export interface ICriteria {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone: string;
  registrationNumber:string;
  birthDate: string;
}

export default mixins(searchHousehold).extend({
  name: 'MoveHouseholdMembers',

  components: {
    HouseholdResults,
    HouseholdSearch,
    HouseholdCard,
    RcPageContent,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      showResults: false,
      firstHousehold: null as HouseholdCreate,
      secondHousehold: null as HouseholdCreate,
      searchResultsWithoutFirst: [],
    };
  },

  computed: {
    currentHousehold(): HouseholdCreate {
      return this.$storage.registration.getters.householdCreate();
    },
  },

  created() {
    // We assume the first household is in the store already. User is coming from household profile page
    if (this.currentHousehold.id === '') {
      this.back();
    } else {
      this.firstHousehold = this.currentHousehold;
    }
  },

  methods: {
    back() {
      this.$router.push({ name: routes.household.householdProfile.name });
    },

    async onSearch(criteria: ICriteria) {
      await this.search(criteria);
      this.searchResultsWithoutFirst = this.searchResults.filter((h) => h.entity.id !== this.firstHousehold.id);
      this.showResults = true;
    },

    onSelect(household: HouseholdCreate) {
      this.secondHousehold = household;
    },

    onReset() {
      this.showResults = false;
    },

    removeSelection() {
      this.secondHousehold = null;
    },

    move({ member, direction }: {member: IMember, direction: string}) {
      return { member, direction };

      // TODO Activate when working on 561-562
      // if (direction === 'left') {
      //   this.firstHousehold.addAdditionalMember(member, false);
      //   const index = this.secondHousehold.additionalMembers.findIndex((m) => m.id === member.id);
      //   this.secondHousehold.removeAdditionalMember(index);
      // }
      //
      // if (direction === 'right') {
      //   this.secondHousehold.addAdditionalMember(member, false);
      //   const index = this.firstHousehold.additionalMembers.findIndex((m) => m.id === member.id);
      //   this.firstHousehold.removeAdditionalMember(index);
      // }
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
