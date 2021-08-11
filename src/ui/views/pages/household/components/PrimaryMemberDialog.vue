<template>
  <ValidationObserver ref="form" v-slot="{ failed, pristine }">
    <rc-dialog
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.save')"
      :content-only-scrolling="true"
      fullscreen
      persistent
      show-close
      :submit-button-disabled="failed || pristine"
      @close="onCancel"
      @cancel="onCancel"
      @submit="onSubmit">
      <v-row class="justify-center">
        <v-col cols="12" md="8">
          <lib-personal-information :i18n="i18n" />
        </v-col>
      </v-row>
    </rc-dialog>
  </ValidationObserver>
</template>

<script lang='ts'>
import Vue from 'vue';
import { PersonalInformation as LibPersonalInformation } from '@crctech/registration-lib';
import { RcDialog } from '@crctech/component-library';
import { IContactInformation, IMember } from '@crctech/registration-lib/src/entities/household-create';
import { TranslateResult } from 'vue-i18n';
import { VForm } from '@/types';

export default Vue.extend({
  name: 'PrimaryMemberDialog',

  components: {
    LibPersonalInformation,
    RcDialog,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      i18n: this.$i18n,
      backupPersonalInfo: null as IMember & IContactInformation,
    };
  },

  computed: {
    title(): TranslateResult {
      const fullName = `${this.member.identitySet.firstName} ${this.member.identitySet.lastName}`;
      return this.$t('household.details.edit.title', { x: fullName });
    },

    member() : IMember {
      const household = this.$storage.registration.getters.householdCreate();
      return household?.primaryBeneficiary;
    },

  },

  created() {
    this.backupPersonalInfo = this.$storage.registration.getters.personalInformation();
  },

  methods: {
    onCancel() {
      this.$storage.registration.mutations.setPersonalInformation(this.backupPersonalInfo);
      this.$emit('close');
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        try {
          await this.$services.households.updatePersonIdentity(
            this.member.id,
            this.member.identitySet,
          );
          await this.$services.households.updatePersonContactInformation(
            this.member.id,
            this.member.contactInformation,
          );
        } finally {
          this.$emit('close');
        }
      }
    },
  },

});

</script>
