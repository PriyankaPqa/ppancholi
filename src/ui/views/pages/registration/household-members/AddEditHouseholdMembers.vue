<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="getTitle"
      :cancel-action-label="$t('common.cancel')"
      :submit-action-label="editMode ? $t('common.save') : $t('common.add')"
      :show.sync="show"
      :content-only-scrolling="true"
      :persistent="true"
      fullscreen
      :submit-button-disabled="failed"
      @cancel="close()"
      @close="close()"
      @submit="validate()">
      <v-row justify="center" class="mt-12" no-gutters>
        <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
          <household-member-form :same-address.sync="sameAddress" :person="householdMember" />
        </v-col>
      </v-row>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import HouseholdMemberForm from '@/ui/views/pages/registration/household-members/HouseholdMemberForm.vue';
import { RcDialog } from '@crctech/component-library';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { VForm } from '@/types';
import helpers from '@/ui/helpers';
import { IPerson } from '@/entities/value-objects/person';
import _isEqual from 'lodash/isEqual';

export default Vue.extend({
  name: 'HouseholdMemberDialog',

  components: {
    HouseholdMemberForm,
    RcDialog,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    householdMember: {
      type: Object as () => IPerson,
      required: true,
    },

    index: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      sameAddress: true,
    };
  },

  computed: {
    editMode(): boolean {
      return this.index !== -1;
    },

    getTitle(): TranslateResult {
      if (this.editMode) {
        return this.$t('registration.household_member.edit.title');
      }
      return this.$t('registration.household_member.add.title');
    },
  },

  mounted() {
    if (this.editMode) {
      this.sameAddress = _isEqual(this.householdMember.temporaryAddress, this.$storage.beneficiary.getters.beneficiary().person.temporaryAddress);
    }
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    async validate() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (!isValid) {
        helpers.scrollToFirstErrorDialog('householdMemberDialog');
        return;
      }

      if (this.editMode) {
        this.$storage.beneficiary.mutations.editHouseholdMember(this.householdMember, this.index, this.sameAddress);
      } else {
        this.$storage.beneficiary.mutations.addHouseholdMember(this.householdMember, this.sameAddress);
      }
      this.close();
    },
  },
});
</script>

<style scoped lang="scss">
@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .householdMembersForm {
    margin: 0px;
    padding: 0px 0px 8px !important;
  }
}
@media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-md-max) {
  .householdMembersForm {
    margin: 0px;
    padding: 8px 0px 16px !important;
  }
}
@media only screen and (min-width: $breakpoint-lg-min) {
  .householdMembersForm {
    margin: 0px;
    padding: 16px 276px 16px !important;
  }
}
</style>
