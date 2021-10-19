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
    <div v-for="(m, i) in members" :key="i" :class="[ i !== members.length-1 ? 'border-bottom' : '', 'pa-4']">
      <v-row>
        <v-col cols="9" sm="7" xs>
          <v-btn icon small class="mt-n1 ml-n1 mr-1" @click="showHide(i)">
            <v-icon>
              {{ expand[i] ? 'mdi-menu-up': 'mdi-menu-down' }}
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

            <v-btn v-else-if="i !== 0 && showMoveButton" small data-test="move" color="primary" @click="move(m)">
              <v-icon left>
                {{ position === 'left' ? 'mdi-arrow-right': 'mdi-arrow-left' }}
              </v-icon>
              {{ $t('household.move.action.button') }}
            </v-btn>
          </v-row>
        </v-col>
      </v-row>
      <div v-show="expand[i]" style="margin-left: 29px">
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
            <current-address-template :current-address="m.currentAddress" />
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { HouseholdCreate, IMember } from '@crctech/registration-lib/src/entities/household-create';
import { CurrentAddressTemplate } from '@crctech/registration-lib';
import helpers from '@/ui/helpers/helpers';
import householdHelpers from '@/ui/helpers/household';

export default Vue.extend({
  name: 'HouseholdCard',

  components: {
    CurrentAddressTemplate,
  },

  props: {
    household: {
      type: Object as () => HouseholdCreate,
      required: true,
    },

    showMoveButton: {
      type: Boolean,
      default: false,
    },

    position: {
      type: String,
      required: true,
      validator: (value: string) => (
        ['left', 'right'].indexOf(value) > -1),
    },
  },

  data() {
    return {
      expand: [],
      helpers,
      householdHelpers,
    };
  },

  computed: {
    // The main beneficiary must be first
    members(): IMember[] {
      return [this.household.primaryBeneficiary, ...this.household.additionalMembers];
    },
  },

  created() {
    this.expand = Array(this.members.length).fill(false);
  },

  methods: {
    showHide(i: number) {
      Vue.set(this.expand, i, !this.expand[i]);
    },

    move(member: IMember) {
      const direction = this.position === 'left' ? 'right' : 'left';

      this.$emit('move', { direction, member });
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
</style>
