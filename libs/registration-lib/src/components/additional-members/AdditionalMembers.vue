<template>
  <v-row class="d-block">
    <div class="rc-body14 mt-n8 mb-12">
      {{ $t('registration.household_member.definition') }}
    </div>
    <v-row justify="center" class="additionalMembers pa-0 ma-0">
      <v-col class="ma-0 pa-0">
        <div class="rc-heading-5 mb-4">
          {{ $t('registration.household_members.title') }} ({{ additionalMembers.length }})
        </div>
        <div class="additionalMembers">
          <div v-for="(member, i) in additionalMembers" :key="i" class="row-data rc-body14 fw-bold" :data-test="`additionalMember_${i}`">
            <div class="flex-grow-1" data-test="additionalMember-identity">
              {{ member.identitySet.firstName }} {{ member.identitySet.lastName }}
            </div>
            <div>
              <v-btn
                icon
                :aria-label="`${member.identitySet.firstName} ${member.identitySet.lastName} ${$t('common.buttons.edit')}`"
                :data-test="`edit-additionalMember_${i}`"
                @click.native="showDialog(i)">
                <v-icon small>
                  mdi-pencil
                </v-icon>
              </v-btn>
              <v-btn
                icon
                :aria-label="`${member.identitySet.firstName} ${member.identitySet.lastName} ${$t('common.buttons.remove')}`"
                :data-test="`delete-additionalMember_${i}`"
                @click.native="showConfirmationDelete(i)">
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
          data-test="add-additionalMember"
          @click.native="addAdditionalMember()">
          <v-icon left>
            mdi-plus
          </v-icon> {{ $t('registration.household_members.add.label') }}
        </v-btn>
      </v-col>
    </v-row>
    <add-edit-additional-members
      v-if="showAddAdditionalMember"
      :i18n="i18n"
      :show.sync="showAddAdditionalMember"
      :index="index"
      :disable-autocomplete="disableAutocomplete"
      :member="currentAdditionalMember" />
    <rc-confirmation-dialog
      v-if="showDeleteDialog"
      submit-button-key="common.yes"
      cancel-button-key="common.no"
      :title="$t('common.deletion.title')"
      :show="showDeleteDialog"
      :messages="$t('registration.household_members.delete.message')"
      @close="showDeleteDialog = false"
      @cancel="showDeleteDialog = false"
      @submit="deleteAdditionalMember()" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcConfirmationDialog } from '@libs/component-lib/components';
import VueI18n from 'vue-i18n';
import { MAX_ADDITIONAL_MEMBERS } from '../../constants/validations';
import AddEditAdditionalMembers from './AddEditAdditionalMembers.vue';
import { IMember, Member } from '../../entities/value-objects/member';

export default Vue.extend({
  name: 'AdditionalMembers',

  components: {
    AddEditAdditionalMembers,
    RcConfirmationDialog,
  },

  props: {
    i18n: {
      type: Object as () => VueI18n,
      required: true,
    },

    disableAutocomplete: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      showAddAdditionalMember: false,
      currentAdditionalMember: null,
      index: -1,
      showDeleteDialog: false,
      disabledAdd: false,
    };
  },

  computed: {
    additionalMembers(): IMember[] {
      return this.$storage.registration.getters.householdCreate().additionalMembers;
    },
  },

  methods: {
    showDialog(index: number) {
      this.currentAdditionalMember = index === -1 ? new Member() : this.additionalMembers[index];
      this.index = index;
      this.showAddAdditionalMember = true;
    },

    deleteAdditionalMember() {
      this.$storage.registration.mutations.removeAdditionalMember(this.index);
      this.showDeleteDialog = false;

      if (this.additionalMembers.length < MAX_ADDITIONAL_MEMBERS) {
        this.disabledAdd = false;
      }
    },

    showConfirmationDelete(index: number) {
      this.showDeleteDialog = true;
      this.index = index;
    },

    addAdditionalMember() {
      if (this.additionalMembers.length < MAX_ADDITIONAL_MEMBERS) {
        this.showDialog(-1);
      } else {
        this.$toasted.global.warning(this.$t('warning.MAX_ADDITIONAL_MEMBERS_reached', { x: MAX_ADDITIONAL_MEMBERS }));
        this.disabledAdd = true;
      }
    },
  },
});
</script>

<style  lang="scss">
.additionalMembers {
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
