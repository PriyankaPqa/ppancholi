<template>
  <v-row justify="center" class="mt-12" no-gutters>
    <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
      <identity-form :form="householdMember" prefix-data-test="houseHoldMember" />
      <indigenous-identity-form :form="householdMember" prefix-data-test="houseHoldMember" />
      <v-row class="grey-container pa-2 pb-0">
        <v-col class="pt-4 px-4">
          <div class="rc-body16 fw-bold">
            {{ $t('registration.household_member.sameAddress') }}
          </div>

          <v-radio-group :value="sameAddress" @change="$emit('update:sameAddress', $event)">
            <div class="flex-contain">
              <span>
                <v-radio data-test="sameTemporaryAddressYes" :label="$t('common.yes')" :value="true" />
              </span>
              <span class="rc-body12 ml-5">
                {{ $t('registration.household_member.sameAddress.yes.detail') }}
              </span>
            </div>
            <div v-if="false" class="flex-contain mt-2">
              <span>
                <v-radio data-test="sameTemporaryAddressNo" :label="$t('common.no')" :value="false" />
              </span>
              <span class="rc-body12 ml-5">
                {{ $t('registration.household_member.sameAddress.no.detail') }}
              </span>
            </div>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import IdentityForm from '@/ui/views/components/shared/form/IdentityForm.vue';
import IndigenousIdentityForm from '@/ui/views/components/shared/form/IndigenousIdentityForm.vue';
import months from '@/constants/months';
import { IPerson } from '@/entities/value-objects/person';

export default Vue.extend({
  name: 'HouseholdMemberForm',

  components: {
    IdentityForm,
    IndigenousIdentityForm,
  },

  props: {
    householdMember: {
      type: Object as () => IPerson,
      required: true,
    },
    sameAddress: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      months,
    };
  },
});
</script>

<style scoped lang="scss">
.grey-container {
  background-clip: content-box;
}

.flex-contain {
  display: flex;
  align-items: center;
}

</style>
