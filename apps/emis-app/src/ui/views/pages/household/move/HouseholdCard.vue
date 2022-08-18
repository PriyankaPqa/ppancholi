<template>
  <div class="border">
    <v-row no-gutters class="grey-container px-4 py-4">
      <v-col>
        <v-icon size="16" class="pr-2" color="secondary">
          mdi-clipboard-text
        </v-icon>
        <span class="rc-body14 fw-bold">{{ $t('household.move.card.registration.number') }}</span>
      </v-col>
      <v-col>
        <span class="rc-body14">
          {{ household.registrationNumber }}
        </span>
      </v-col>
    </v-row>
    <v-row no-gutters class="grey-container px-4 pt-1 pb-2">
      <v-col>
        <v-icon size="16" class="pr-2" color="secondary">
          mdi-map-marker
        </v-icon>
        <span class="rc-body14 fw-bold">{{ $t('household.move.card.address') }}</span>
      </v-col>
      <v-col>
        <div class="rc-body14">
          {{ householdHelpers.addressLine1(household) }}
        </div>
        <div class="rc-body14">
          {{ householdHelpers.addressLine2(household) }}    {{ householdHelpers.country(household) }}
        </div>
      </v-col>
    </v-row>
    <v-row no-gutters class="grey-container px-4 pt-1 pb-4">
      <v-col>
        <v-btn
          v-if="moveSubmitted"
          small
          color="primary"
          data-test="household-profile-btn"
          @click="goToHouseholdProfile()">
          {{ $t('household.move.view_household') }}
        </v-btn>
      </v-col>
    </v-row>
    <div v-for="(m, i) in members" :key="i" :class="[ i !== members.length-1 ? 'border-bottom' : '', 'pa-4']">
      <v-row>
        <v-col cols="9" sm="7" xs>
          <v-btn
            icon
            small
            class="mt-n1 ml-n1 mr-1"
            :disabled="expandDisabled(m)"
            @click="showHide(m.id)">
            <v-icon>
              {{ expand.includes(m.id) ? 'mdi-menu-up': 'mdi-menu-down' }}
            </v-icon>
          </v-btn>
          <span class="rc-heading-5">{{ m.identitySet.firstName }} {{ m.identitySet.lastName }}</span>
        </v-col>
        <v-col cols="3" sm="5" align-self="center">
          <v-row justify="end" class="mr-0 full-width">
            <v-chip
              v-if="i === 0"
              class="px-2 mt-1"
              small
              label
              color="grey darken-3"
              outlined
              data-test="household_profile_member_primary_member_label">
              <v-icon color="secondary" small class="mr-1">
                mdi-account
              </v-icon>
              <span class="text-uppercase fw-bold"> {{ $t('household.profile.member.primary_member') }} </span>
            </v-chip>

            <v-btn
              v-if="showMoveButton(i)"
              :disabled="errorOutstandingPayments(i)"
              small
              :data-test="`move_${m.identitySet.firstName}_${m.identitySet.lastName}`"
              color="primary"
              class="ml-2 mt-1 mt-xl-0"
              @click="move(m)">
              <v-icon left>
                {{ position === 'left' ? 'mdi-arrow-right': 'mdi-arrow-left' }}
              </v-icon>
              {{ $t('household.move.action.button') }}
            </v-btn>
          </v-row>
        </v-col>
        <message-box
          v-if="errorOutstandingPayments(i)"
          icon="mdi-alert"
          :message="m.identitySet.firstName + ' ' + m.identitySet.lastName + ' ' + $t('household.move.errorOutstandingPayments')" />
      </v-row>
      <div v-show="expand.includes(m.id)" style="margin-left: 29px">
        <v-row no-gutters class="rc-body14 mb-1">
          <v-col cols="5">
            <span class="fw-bold"> {{ $t('household.move.card.gender') }} </span>
          </v-col>
          <v-col cols="6" class="ml-8">
            {{ householdHelpers.gender(m) }}
          </v-col>
        </v-row>

        <v-row no-gutters class="rc-body14 mb-1">
          <v-col cols="5">
            <span class="fw-bold"> {{ $t('household.move.card.dateOfBirth') }} </span>
          </v-col>
          <v-col cols="6" class="ml-8">
            {{ householdHelpers.getBirthDateDisplayWithAge(m.identitySet.birthDate) }}
          </v-col>
        </v-row>

        <v-row no-gutters class="rc-body14 mb-1">
          <v-col cols="5">
            <span class="fw-bold"> {{ $t('household.move.card.indigenous') }} </span>
          </v-col>
          <v-col cols="6" class="ml-8">
            {{ householdHelpers.indigenousIdentity(m) }}
          </v-col>
        </v-row>

        <v-row v-if="i ===0" no-gutters class="rc-body14 mb-1">
          <v-col cols="5">
            <span class="fw-bold">{{ $t('household.move.card.email') }}</span>
          </v-col>
          <v-col cols="6" class="ml-8">
            {{ m.contactInformation && m.contactInformation.email || '-' }}
          </v-col>
        </v-row>

        <v-row v-if="i ===0" no-gutters class="rc-body14 mb-1">
          <v-col cols="5">
            <span class="fw-bold">{{ $t('household.move.card.phone') }}</span>
          </v-col>
          <v-col cols="6" class="ml-8">
            <div>
              {{ $t('household.profile.member.phone_numbers.home') }}: {{ householdHelpers.homePhoneNumber(m) }}
            </div>
            <div>
              {{ $t('household.profile.member.phone_numbers.mobile') }}:  {{ householdHelpers.mobilePhoneNumber(m) }}
            </div>
            <div>
              {{ $t('household.profile.member.phone_numbers.alternate') }}: {{ householdHelpers.alternatePhoneNumber(m) }}
            </div>
            <div>
              {{ $t('household.profile.member.phone_numbers.extension') }}:  {{ householdHelpers.alternatePhoneExtension(m) }}
            </div>
          </v-col>
        </v-row>

        <v-row no-gutters class="rc-body14 mb-1">
          <v-col cols="5">
            <span class="fw-bold"> {{ $t('household.move.card.temporaryAddress') }} </span>
          </v-col>
          <v-col cols="6" class="ml-8">
            <current-address-template v-if="!m.selectedCurrentAddress" :current-address="m.currentAddress" hide-title />

            <div v-else>
              <validation-provider v-slot="{ errors }" :rules="rules.newAddress">
                <v-radio-group
                  v-model="m.selectedCurrentAddress.sameAddressSelected"
                  class="mt-1"
                  :hide-details="!errors.length"
                  small
                  :error-messages="errors">
                  <v-radio
                    :label=" $t('household.move.same_as_primary')"
                    :value="1"
                    :disabled="i===0"
                    :data-test="`household_move_same_address_${m.identitySet.firstName}_${m.identitySet.lastName}`" />
                  <v-radio
                    :label=" $t('household.move.new_address')"
                    :value="0"
                    :data-test="`household_move_new_address_${m.identitySet.firstName}_${m.identitySet.lastName}`"
                    @click="!m.selectedCurrentAddress.newAddress && openNewAddressDialog(m)" />
                </v-radio-group>
              </validation-provider>

              <div v-if="m.selectedCurrentAddress.newAddress" class="ml-8 my-0">
                <current-address-template
                  :current-address="m.selectedCurrentAddress.newAddress"
                  hide-title />
              </div>

              <v-btn
                v-if="m.selectedCurrentAddress.newAddress"
                class="ml-8 mt-2"
                small
                color="primary"
                :disabled="!!m.selectedCurrentAddress.sameAddressSelected"
                @click="openNewAddressDialog(m)">
                {{ $t('household.move.edit_address') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
    <validation-observer ref="addressForm" v-slot="{ failed }">
      <rc-dialog
        v-if="showNewAddressDialog"
        :title="$t('household.move.card.temporaryAddress')"
        :show="showNewAddressDialog"
        :content-only-scrolling="true"
        :submit-action-label="$t('common.buttons.save')"
        :submit-button-disabled="failed"
        :persistent="true"
        :max-width="750"
        :min-height="600"
        :show-cancel="false"
        @submit="setAddress"
        @close="resetSelectNewAddress">
        <div>
          <current-address-form
            :shelter-locations="shelterLocations"
            :canadian-provinces-items="canadianProvincesItems"
            :current-address-type-items="currentAddressTypeItems"
            :no-fixed-home="false"
            :api-key="apiKey"
            hide-title
            compact-view
            :current-address="newAddress || new CurrentAddress()"
            @change="updateAddress" />
        </div>
      </rc-dialog>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import {
  ECurrentAddressTypes, IMember, CurrentAddress, ICurrentAddress,
} from '@libs/entities-lib/household-create';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import CurrentAddressTemplate from '@libs/registration-lib/components/review/addresses/CurrentAddressTemplate.vue';
import libHelpers from '@libs/entities-lib/helpers';
import { IEventGenericLocation } from '@libs/entities-lib/registration-event';
import { RcDialog } from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';
import householdHelpers from '@/ui/helpers/household';
import { localStorageKeys } from '@/constants/localStorage';
import MessageBox from '@/ui/shared-components/MessageBox.vue';
import { VForm } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import { EEventLocationStatus } from '@libs/entities-lib/event';
import { IMovingHouseholdCreate, IMovingMember } from './MoveHouseholdMembers.vue';

export default Vue.extend({
  name: 'HouseholdCard',

  components: {
    CurrentAddressTemplate,
    CurrentAddressForm,
    RcDialog,
    MessageBox,
  },

  props: {
    household: {
      type: Object as () => IMovingHouseholdCreate,
      required: true,
    },

    enabledMove: {
      type: Boolean,
      default: false,
    },

    position: {
      type: String,
      required: true,
      validator: (value: string) => (
        ['left', 'right'].indexOf(value) > -1),
    },

    shelterLocations: {
      type: Array as () => IEventGenericLocation[],
      required: true,
    },

    moveSubmitted: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      showNewAddressDialog: false,
      expand: [] as string[],
      helpers,
      householdHelpers,
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,
      selectedMember: null as IMovingMember,
      newAddress: null as ICurrentAddress,
      CurrentAddress,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        newAddress: {
          required: { messageKey: 'household.move.address_select_error_message' },
          oneOf: [0, 1],
        },
      };
    },

    // The main beneficiary must be first
    members(): IMovingMember[] {
      let members = [];

      if (this.household.primaryBeneficiary) {
        members.push(this.household.primaryBeneficiary);
      }
      members = members.concat(...this.household.additionalMembers, ...this.household.movingAdditionalMembers);

      return members;
    },

    showMoveButton(): (index: number) => boolean {
      return (index: number) => this.enabledMove && !this.moveSubmitted && (index > 0 || this.members.length === 1);
    },

    errorOutstandingPayments(): (index: number) => boolean {
      return (index: number) => this.enabledMove && index === 0 && this.members.length === 1
        && this.household.hasOutstandingPayments !== false;
    },

    expandDisabled(): (m:IMovingMember) => boolean {
      return (m:IMovingMember) => m.selectedCurrentAddress && m.selectedCurrentAddress.sameAddressSelected == null && this.expand.includes(m.id);
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return libHelpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      let items = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes');

      if (this.shelterLocations.every((s) => s.status === EEventLocationStatus.Inactive)) {
        items = items.filter((i) => i.value !== ECurrentAddressTypes.Shelter);
      }

      return items;
    },

    movingAdditionalMembers():IMovingMember[] {
      return this.household.movingAdditionalMembers;
    },
  },

  watch: {
    movingAdditionalMembers(newMembers, oldMembers) {
      if (newMembers.length > oldMembers.length) {
        this.expand.push(newMembers[newMembers.length - 1].id);
      }
    },
  },

  methods: {
    showHide(id: string) {
      if (this.expand.includes(id)) {
        this.expand = this.expand.filter((item) => item !== id);
      } else {
        this.expand.push(id);
      }
    },

    move(member: IMember) {
      const direction = this.position === 'left' ? 'right' : 'left';
      this.$emit('move', { direction, member });
    },

    openNewAddressDialog(member: IMovingMember) {
      this.selectedMember = member;
      this.newAddress = _cloneDeep(member.selectedCurrentAddress.newAddress);
      this.showNewAddressDialog = true;
    },

    updateAddress(address: ICurrentAddress) {
      this.newAddress = address;
    },

    async setAddress() {
      const isValid = await (this.$refs.addressForm as VForm).validate();
      if (isValid) {
        const updatedMember = this.members.find((m) => m.id === this.selectedMember.id);
        updatedMember.selectedCurrentAddress.newAddress = this.newAddress;

        this.closeNewAddressDialog();
      }
    },

    resetSelectNewAddress() {
      const updatedMember = this.members.find((m) => m.id === this.selectedMember.id);
      if (updatedMember.selectedCurrentAddress.newAddress == null) {
        updatedMember.selectedCurrentAddress.sameAddressSelected = null;
      }
      this.closeNewAddressDialog();
    },

    closeNewAddressDialog() {
      this.showNewAddressDialog = false;
      this.selectedMember = null;
      this.newAddress = null;
    },

    goToHouseholdProfile() {
      this.$router.replace({
        name: routes.household.householdProfile.name,
        params: {
          id: this.household.id,
        },
      });
    },

  },
});
</script>

<style lang="scss" scoped>
 .border {
   border: 1px solid var(--v-grey-lighten2);
   border-radius: 4px;
 }

 .border-bottom {
   border-bottom: 1px solid var(--v-grey-lighten2);
 }

 ::v-deep .v-icon {
   font-size: 21px;
 }

 ::v-deep .v-radio .v-label {
   font-size: 14px;
 }

 ::v-deep .v-radio:not(.v-radio--is-disabled) .v-label {
   color: var(--v-grey-darken4);
   font-weight: bold;
 }

 ::v-deep .v-input--radio-group--column {
   margin-bottom: 0px;
 }

 .error-outstanding-payments {
   background-color: var(--v-status_red_pale-base) !important;
 }
</style>
