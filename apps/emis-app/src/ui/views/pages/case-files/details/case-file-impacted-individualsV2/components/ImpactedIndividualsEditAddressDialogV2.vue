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
          <div class="rc-body16 fw-bold" data-test="same_current_address">
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
            :current-address="currentAddressWithFormattedDate"
            @change="setCurrentAddress($event)" />
        </v-col>
      </v-row>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { VForm } from '@libs/shared-lib/types';
import helpers from '@libs/entities-lib/helpers';
import uiHelpers from '@/ui/helpers/helpers';
import { IMember } from '@libs/entities-lib/household-create';
import { TranslateResult } from 'vue-i18n';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { localStorageKeys } from '@/constants/localStorage';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';
import { RcDialog } from '@libs/component-lib/components';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { IEventGenericLocation, EEventLocationStatus } from '@libs/entities-lib/event';
import { CaseFileIndividualEntity, ICaseFileIndividualEntity, MembershipStatus, TemporaryAddress } from '@libs/entities-lib/case-file-individual';
import { useCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual';
import { CurrentAddress, ICurrentAddressData } from '@libs/entities-lib/value-objects/current-address';
import caseFileDetail from '../../caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'ImpactedIndividualsEditAddressDialog',

  components: {
    CurrentAddressForm,
    RcDialog,
  },

  props: {
    individual: {
      type: Object as () => ICaseFileIndividualEntity,
      required: true,
    },

    member: {
      type: Object as () => IMember,
      required: true,
    },

    show: {
      type: Boolean,
      required: true,
    },

    shelterLocationsList: {
      type: Array as () => IEventGenericLocation[],
      default: null,
    },

    isPrimaryMember: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const { getCurrentAddressTypeItems } = useAddresses();
    return { getCurrentAddressTypeItems };
  },

  data() {
    return {
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY,
      submitLoading: false,
      editedAddress: null as CurrentAddress,
      backupAddress: null as CurrentAddress,
      sameAddress: null,
      changedAddress: false,
      noFixedHome: false,
    };
  },

  computed: {
    individuals(): CaseFileIndividualEntity[] {
      return useCaseFileIndividualStore().getByCaseFile(this.caseFileId).sort((x) => (this.household?.primaryBeneficiary === x.personId ? -1 : 1))
        .map((i) => new CaseFileIndividualEntity(i));
    },

    shelterLocations(): IEventGenericLocation[] {
      const locations = this.shelterLocationsList || [];
      return locations.filter((s: IEventGenericLocation) => s.status === EEventLocationStatus.Active || s.id === this.individual?.currentAddress?.shelterLocationId);
    },

    primaryAddress(): CurrentAddress {
      const address = this.individuals.find((x) => this.household?.primaryBeneficiary === x.personId)?.currentAddress;
      return this.temporaryAddressAsCurrentAddress(address);
    },

    rules() {
      return {
        isSameAddress: { requiredCheckbox: true, oneOf: [false, true] },
      };
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      return this.getCurrentAddressTypeItems(this.$i18n, this.noFixedHome, !!this.shelterLocations.length);
    },

    title(): TranslateResult {
      const fullName = `${this.member.identitySet.firstName} ${this.member.identitySet.lastName}`;

      return this.$t('impactedIndividuals.temporary_address.edit.title', { x: fullName });
    },

    submitButtonDisabled(): (failed: boolean) => boolean {
      return (failed) => failed || !this.changedAddress || this.submitLoading;
    },

    currentAddressWithFormattedDate(): CurrentAddress {
      const currentAddress = new CurrentAddress(_cloneDeep(this.editedAddress));
      currentAddress.checkIn = uiHelpers.getLocalStringDate(currentAddress.checkIn, 'CaseFileIndividual.checkIn');
      currentAddress.checkOut = uiHelpers.getLocalStringDate(currentAddress.checkOut, 'CaseFileIndividual.checkOut');
      return currentAddress;
    },
  },

  created() {
    if (this.primaryMember) {
      this.backupAddress = this.temporaryAddressAsCurrentAddress(this.individual.currentAddress);
      this.editedAddress = new CurrentAddress(_cloneDeep(this.backupAddress));
      this.sameAddress = _isEqual(this.editedAddress, this.primaryAddress);
      this.noFixedHome = this.household?.address?.address === null;
    }
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    temporaryAddressAsCurrentAddress(address: TemporaryAddress) : CurrentAddress {
      const currentAddress = new CurrentAddress(_cloneDeep(address));
      // find when not found return undefined which is not equal to the default null
      currentAddress.shelterLocation = this.shelterLocations.find((s) => s.id === address?.shelterLocationId) || null;
      return currentAddress;
    },

    async submitUpdatedAddress() {
      this.submitLoading = true;
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        const newAddress = _cloneDeep(this.editedAddress) as ICurrentAddressData;
        newAddress.shelterLocationId = this.editedAddress.shelterLocation?.id;
        const updatedMember = await useCaseFileIndividualStore().addTemporaryAddress(this.caseFileId, this.individual.id, newAddress);

        if (!!updatedMember && this.isPrimaryMember && this.individuals.length > 1) {
          await this.updateAdditionalMembersWithSameAddress(newAddress);
        }

        this.close();
      } else {
        this.submitLoading = false;
        helpers.scrollToFirstError('dialogScrollAnchor');
      }
    },

    async updateAdditionalMembersWithSameAddress(newAddress: ICurrentAddressData) {
      const promises = [] as Array<Promise<ICaseFileIndividualEntity>>;

      const members = this.individuals.filter((i) => i.membershipStatus === MembershipStatus.Active
        && i.id !== this.individual.id && _isEqual(this.temporaryAddressAsCurrentAddress(i.currentAddress), this.backupAddress));
      members.forEach((otherMember) => {
        promises.push(useCaseFileIndividualStore().addTemporaryAddress(this.caseFileId, otherMember.id, newAddress));
      });
      await Promise.all(promises);
    },

    changeSameAddress(sameAddress: boolean) {
      return sameAddress ? this.setCurrentAddress(this.primaryAddress) : this.setCurrentAddress(this.backupAddress);
    },

    setCurrentAddress(form: CurrentAddress) {
      if (!_isEqual(new CurrentAddress(form), new CurrentAddress(this.backupAddress))) {
        this.changedAddress = true;
      } else {
        this.changedAddress = false;
      }
      this.editedAddress = form;
    },
  },
});
</script>

<style lang="scss" scoped>
.min-width {
  min-width: 60px;
}

</style>
