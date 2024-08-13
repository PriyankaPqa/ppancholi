<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      v-if="show"
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.buttons.continue')"
      :submit-button-disabled="failed"
      :loading="loading"
      :content-only-scrolling="true"
      :persistent="true"
      :show-help="false"
      :tooltip-label="$t('common.tooltip_label')"
      :max-width="750"
      :min-height="450"
      content-padding="5"
      data-test="individuals-dialog"
      @cancel="cancel"
      @close="close"
      @submit="submit">
      <div class="px-4">
        <validation-provider v-slot="{ errors }" class="cb-validation" :rules="{ required: true }">
          <!-- there are no v-checkbox-group - this does the same for error handling-->
          <v-radio-group :error-messages="errors" class="ma-0 pa-0">
            <v-row>
              <v-col cols="12">
                <div class="fw-bold">
                  {{ textUserSelection }}
                </div>
              </v-col>
            </v-row>
            <div class="border-all rounded-lg pa-3 mt-4 lined">
              <v-row
                v-for="individual in individuals"
                :key="individual.caseFileIndividualId"
                :class="{ selected: userInput.selectedIndividuals.indexOf(individual.caseFileIndividualId) > -1 }">
                <v-col cols="12" class="pb-1 d-flex">
                  <v-checkbox
                    v-model="userInput.selectedIndividuals"
                    class="mt-0 mr-auto"
                    :label="individual.identitySet.firstName + ' ' + individual.identitySet.lastName"
                    :value="individual.caseFileIndividualId"
                    hide-details />
                  <v-chip
                    v-if="individual.isPrimary"
                    class="px-2"
                    small
                    label
                    color="white"
                    text-color="grey-darken"
                    data-test="primary_member_label">
                    <v-icon color="secondary" small class="mr-1">
                      mdi-account
                    </v-icon>
                    <span class="text-uppercase"> {{ $t('household.profile.member.primary_member') }} </span>
                  </v-chip>
                </v-col>
              </v-row>
            </div>
          </v-radio-group>
        </validation-provider>
      </div>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';
import {
  RcDialog,
} from '@libs/component-lib/components';
import { VForm } from '@libs/shared-lib/types';
import { IMemberEntity } from '@libs/entities-lib/household-create';

export interface IMemberForSelection extends IMemberEntity {
  caseFileIndividualId: string;
  isPrimary?: boolean;
}

export default Vue.extend({
  name: 'RationaleDialog',

  components: {
    RcDialog,
  },

  data() {
    return {
      userInput: { answered: false, selectedIndividuals: [] as string[] },
      promise: null,
      individuals: [] as IMemberForSelection[],
      show: false,
      title: null as string,
      textUserSelection: null as string,
      loading: false,
    };
  },

  methods: {
    // Used to open programmatically the dialog
    // The promise returns the answer
    open(params: { title: string, textUserSelection: string, individuals: IMemberForSelection[] }): Promise<boolean> {
      this.show = true;
      this.title = params.title;
      this.textUserSelection = params.textUserSelection;
      this.individuals = params.individuals;
      return new Promise((resolve) => {
        this.promise = resolve;
      });
    },
    cancel(): void {
      this.doClose('cancel');
    },
    close(): void {
      this.doClose('close');
    },
    doClose(emitted: string) {
      this.userInput.answered = false;
      this.userInput.selectedIndividuals = [];
      if (this.promise) {
        this.promise(this.userInput);
      }
      this.loading = false;
      this.show = false;
      this.$emit(emitted);
    },
    async submit(): Promise<void> {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.loading = true;
        this.userInput.answered = true;
        if (this.promise) {
          this.promise(this.userInput);
        }
        this.$emit('submit');
      }
    },
  },

});

</script>

<style scoped lang="scss">
  .cb-validation {
    width: 100%;
  }
  ::v-deep .cb-validation .error--text {
    padding-left: 16px;
    padding-bottom: 4px;
  }

  .lined > .row:not(:last-child) {
    border-bottom: 1px solid var(--v-grey-lighten2);
  }

  .selected {
    background-color: var(--v-primary-lighten2) !important;
  }
</style>
