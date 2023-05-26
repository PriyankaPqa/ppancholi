<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="title"
      :cancel-action-label="$t('common.cancel')"
      :submit-action-label="$t('common.save')"
      :show.sync="show"
      :content-only-scrolling="true"
      :persistent="true"
      fullscreen
      :submit-button-disabled="submitButtonDisabled(failed)"
      @cancel="close()"
      @close="close()"
      @submit="submitUpdatedAddress()">
      <div v-if="!isPrimaryMember" class="d-flex justify-center mb-8">
        <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12" class="pa-0">
          <div class="rc-body16 fw-bold">
            {{ $t('registration.household_member.sameAddress') }} *
          </div>
          <validation-provider v-slot="{ errors }" :rules="rules.isSameAddress">
            <v-radio-group
              v-model="sameAddress"
              :value="sameAddress"
              :error-messages="errors"
              @change="changeSameAddress($event)">
              <div class="d-flex">
                <div class="min-width">
                  <v-radio data-test="same_current_address_yes" :label="$t('common.yes')" :value="true" />
                </div>
                <div class="rc-body12 ml-5 d-flex align-center">
                  {{ $t('registration.household_member.sameAddress.yes.detail') }}
                </div>
              </div>
              <div class="d-flex mt-2">
                <div class="min-width">
                  <v-radio data-test="same_current_address_no" :label="$t('common.no')" :value="false" />
                </div>
                <div class="rc-body12 ml-5 d-flex align-center">
                  {{ $t('registration.household_member.sameAddress.no.detail') }}
                </div>
              </div>
            </v-radio-group>
          </validation-provider>
        </v-col>
      </div>

      <v-row v-if="isPrimaryMember || !sameAddress" justify="center" no-gutters>
        <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
          <current-address-form
            :shelter-locations="shelterLocations"
            :canadian-provinces-items="canadianProvincesItems"
            :current-address-type-items="currentAddressTypeItems"
            :no-fixed-home="false"
            :api-key="apiKey"
            :disable-autocomplete="false"
            show-crc-provided-and-check-in-check-out
            :current-address="memberClone.currentAddress"
            @change="setCurrentAddress($event)" />
        </v-col>
      </v-row>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import { CurrentAddress, ECurrentAddressTypes, ICurrentAddress, IShelterLocationData } from '@libs/entities-lib/value-objects/current-address';
import { EOptionItemStatus, VForm } from '@libs/shared-lib/types';
import helpers from '@libs/entities-lib/helpers';
import { IMember } from '@libs/entities-lib/household-create';
import { TranslateResult } from 'vue-i18n';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { localStorageKeys } from '@/constants/localStorage';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';
import { useRegistrationStore } from '@/pinia/registration/registration';

export default Vue.extend({
  name: 'ImpactedIndividualsEditAddressDialog',

  components: {
    CurrentAddressForm,
  },

  props: {
    member: {
      type: Object as () => IMember,
      required: true,
    },

    show: {
      type: Boolean,
      required: true,
    },

    shelterLocationsList: {
      type: Array as () => IShelterLocationData[],
      default: null,
    },

    isPrimaryMember: {
      type: Boolean,
      default: false,
    },

    index: {
      type: Number,
      default: -1,
    },
  },

  data() {
    return {
      i18n: this.$i18n,
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY,
      primaryBeneficiary: {} as IMember,
      additionalMembers: [] as IMember[],
      submitLoading: false,
      backupAddress: null as ICurrentAddress,
      memberClone: null as IMember,
      sameAddress: null,
      changedAddress: false,
    };
  },

  computed: {
    rules() {
      return {
        isSameAddress: { requiredCheckbox: true, oneOf: [false, true] },
      };
    },

    shelterLocations(): IShelterLocationData[] {
      const locations = this.shelterLocationsList || this.$registrationStore.getEvent()?.shelterLocations || [];
      return locations.filter((s: IShelterLocationData) => s.status === EOptionItemStatus.Active || s.id === this.member?.currentAddress?.shelterLocation?.id);
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.i18n);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      let list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', this.i18n);

      if (this.shelterLocations.length === 0) {
        list = list.filter((item) => (item.value !== ECurrentAddressTypes.Shelter));
      }

      return list;
    },

    title(): TranslateResult {
      const fullName = `${this.member.identitySet.firstName} ${this.member.identitySet.lastName}`;

      return this.$t('impactedIndividuals.temporary_address.edit.title', { x: fullName });
    },

    submitButtonDisabled(): (failed: boolean) => boolean {
      return (failed) => failed || !this.changedAddress || this.submitLoading;
    },

  },

  created() {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const household = useRegistrationStore().getHouseholdCreate();
    if (household) {
      this.primaryBeneficiary = household.primaryBeneficiary;
      this.additionalMembers = [...household.additionalMembers];
      this.backupAddress = _cloneDeep(this.member.currentAddress);
      this.sameAddress = _isEqual(this.member.currentAddress, household.primaryBeneficiary.currentAddress);
      this.memberClone = _cloneDeep(this.member);
    }
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    async submitUpdatedAddress() {
      this.submitLoading = true;
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        const params = this.isPrimaryMember ? {
          member: this.memberClone, isPrimaryMember: true,
        } : {
          member: this.memberClone, isPrimaryMember: false, index: this.index, sameAddress: this.sameAddress,
        };

        const updatedMember = await useRegistrationStore().updatePersonAddress(params);

        if (!!updatedMember && this.isPrimaryMember && this.additionalMembers) {
          await this.updateAdditionalMembersWithSameAddress();
        }

        this.close();
      } else {
        this.submitLoading = false;
        helpers.scrollToFirstError('dialogScrollAnchor');
      }
    },

    async updateAdditionalMembersWithSameAddress() {
      const promises = [] as Array<Promise<IMember>>;

      this.additionalMembers.forEach(async (otherMember, index) => {
        if (_isEqual(otherMember.currentAddress, this.backupAddress)) {
          otherMember.setCurrentAddress(this.memberClone.currentAddress);
          promises.push(useRegistrationStore().updatePersonAddress({
            member: otherMember, isPrimaryMember: false, index,
          }) as Promise<IMember>);
        }
      });
      await Promise.all(promises);
    },

    changeSameAddress(sameAddress: boolean) {
      return sameAddress ? this.setCurrentAddress(this.primaryBeneficiary.currentAddress) : this.setCurrentAddress(this.backupAddress);
    },

    setCurrentAddress(form: ICurrentAddress) {
      if (!_isEqual(new CurrentAddress(form), new CurrentAddress(this.backupAddress))) {
        this.changedAddress = true;
      } else {
        this.changedAddress = false;
      }
      this.memberClone.setCurrentAddress(form);
    },
  },
});
</script>

<style lang="scss" scoped>
.min-width {
  min-width: 60px;
}

</style>
