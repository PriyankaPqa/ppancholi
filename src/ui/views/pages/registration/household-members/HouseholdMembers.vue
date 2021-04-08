<template>
  <v-row>
    <div class="rc-body14 mt-n8 mb-12">
      {{ $t('registration.household_member.definition') }}
    </div>
    <v-row justify="center" class="householdMembers pa-0 ma-0">
      <v-col class="ma-0 pa-0">
        <div class="rc-heading-5 mb-4">
          {{ $t('registration.household_members.title') }} ({{ householdMembers.length }})
        </div>
        <div class="householdMembers">
          <div v-for="(member, i) in householdMembers" :key="i" class="row-data rc-body14 fw-bold" :data-test="`householdMember_${i}`">
            <div class="flex-grow-1" data-test="householdMember-identity">
              {{ member.firstName }} {{ member.lastName }}
            </div>
            <div>
              <v-btn icon :data-test="`edit-householdMember_${i}`" @click.native="showDialog(i)">
                <v-icon small>
                  mdi-pencil
                </v-icon>
              </v-btn>
              <v-btn icon :data-test="`delete-householdMember_${i}`" @click.native="showConfirmationDelete(i)">
                <v-icon small>
                  mdi-delete
                </v-icon>
              </v-btn>
            </div>
          </div>
        </div>
        <v-btn
          class="mt-2"
          color="primary"
          :disabled="disabledAdd"
          data-test="add-householdMember"
          @click.native="addHouseholdMember()">
          <v-icon left>
            mdi-plus
          </v-icon> {{ $t('registration.household_members.add.label') }}
        </v-btn>
      </v-col>
    </v-row>
    <add-edit-household-members
      v-if="showAddHouseholdMember"
      :show.sync="showAddHouseholdMember"
      :index="index"
      :household-member="currentHouseholdMember" />
    <rc-confirmation-dialog
      v-if="showDeleteDialog"
      submit-button-key="common.yes"
      cancel-button-key="common.no"
      :title="$t('common.deletion.title')"
      :show="showDeleteDialog"
      :messages="$t('registration.household_members.delete.message')"
      @close="showDeleteDialog = false"
      @cancel="showDeleteDialog = false"
      @submit="deleteHouseholdMember()" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { IPerson, Person } from '@/entities/value-objects/person';
import AddEditHouseholdMembers from '@/ui/views/pages/registration/household-members/AddEditHouseholdMembers.vue';
import { RcConfirmationDialog } from '@crctech/component-library';
import { MAX_HOUSEHOLDMEMBERS } from '@/constants/validations';

export default Vue.extend({
  name: 'HouseholdMembers',

  components: {
    AddEditHouseholdMembers,
    RcConfirmationDialog,
  },

  data() {
    return {
      showAddHouseholdMember: false,
      currentHouseholdMember: null,
      index: -1,
      showDeleteDialog: false,
      disabledAdd: false,
    };
  },

  computed: {
    householdMembers(): IPerson[] {
      return this.$storage.beneficiary.getters.beneficiary().householdMembers;
    },
  },

  methods: {
    showDialog(index: number) {
      this.currentHouseholdMember = index === -1 ? new Person() : this.householdMembers[index];
      this.index = index;
      this.showAddHouseholdMember = true;
    },

    deleteHouseholdMember() {
      this.$storage.beneficiary.mutations.removeHouseholdMember(this.index);
      this.showDeleteDialog = false;

      if (this.householdMembers.length < MAX_HOUSEHOLDMEMBERS) {
        this.disabledAdd = false;
      }
    },

    showConfirmationDelete(index: number) {
      this.showDeleteDialog = true;
      this.index = index;
    },

    addHouseholdMember() {
      if (this.householdMembers.length < MAX_HOUSEHOLDMEMBERS) {
        this.showDialog(-1);
      } else {
        this.$toasted.global.warning(this.$t('warning.max_householdmembers_reached', { x: MAX_HOUSEHOLDMEMBERS }));
        this.disabledAdd = true;
      }
    },
  },
});
</script>

<style  lang="scss">
.householdMembers {
  & .row-data {
    min-height: 40px;
    display: flex;
    justify-items: center;
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
}
</style>
