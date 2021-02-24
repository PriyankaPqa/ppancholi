<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <page-content
      :title="headerTitle"
      :show-add-button="false">
      <v-container>
        <v-row justify="center">
          <v-col xl="9" md="10" sm="12">
            <v-row class="firstSection">
              <v-col xl="8" md="9" sm="12">
                <div class="flex flex-row mb-4">
                  <h5 data-test="team-title" class="rc-heading-5 mr-3">
                    {{ teamTitle }}
                  </h5>
                  <status-select
                    v-model="currentStatus"
                    :statuses="statuses"
                    status-name="ETeamStatus" />
                </div>

                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field-with-validation
                      v-model="team.name"
                      data-test="team-name"
                      :label="`${$t('teams.form.team_name')}*`"
                      :rules="rules.name" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-autocomplete-with-validation
                      data-test="team-contact"
                      :label="`${$t('teams.form.primary_contact')}*`"
                      :items="userResults"
                      :search-input.sync="primaryContactQuery"
                      :loading="fetchingUsers"
                      :rules="rules.primaryContact"
                      hide-no-data
                      hide-selected
                      return-object
                      no-filter
                      :placeholder="$t('common.inputs.start_typing_to_search')"
                      @change="setPrimaryContact($event)" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-autocomplete-with-validation
                      data-test="events"
                      item-value="id"
                      :item-text="(item) => $m(item.name)"
                      :label="`${$t('teams.form.event')}${teamType === 'standard'?'': '*'}`"
                      :items="availableEvents"
                      :multiple="teamType === 'standard'"
                      :rules="rules.event"
                      @change="setEventIds($event)" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="firstSection__actions">
                    <v-btn data-test="createEditTeam__cancel" @click="onCancel(dirty)">
                      {{ $t('common.buttons.cancel') }}
                    </v-btn>
                    <v-btn
                      color="primary"
                      data-test="createEditTeam__submit"
                      :loading="isSubmitting"
                      :disabled="isSubmitDisabled(failed, dirty)"
                      @click="submit()">
                      {{ submitLabel }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="mt-12">
              <v-col class="pa-0">
                <team-members-table :team-members="[]" :is-edit-mode="isEditMode" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </page-content>

    <rc-confirmation-dialog
      data-test="createEditTeam__confirmCancelDialog"
      :show.sync="showCancelConfirmationDialog"
      :title="$t('confirmCancelDialog.title')"
      :messages="$t('confirmCancelDialog.message')"
      @submit="navigateToHome()"
      @cancel="showCancelConfirmationDialog = false"
      @close="showCancelConfirmationDialog = false" />
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import { Route, NavigationGuardNext } from 'vue-router';
import { TranslateResult } from 'vue-i18n';
import _debounce from 'lodash/debounce';
import { ETeamStatus, ETeamType, Team } from '@/entities/team';
import { EEventStatus } from '@/entities/event';
import PageContent from '@/ui/views/components/layout/PageContent.vue';
import TeamMembersTable from '@/ui/views/pages/teams/create-edit/TeamMembersTable.vue';
import {
  VTextFieldWithValidation, VAutocompleteWithValidation, RcConfirmationDialog,
} from '@crctech/component-library';
// import helpers from '@/ui/helpers';
import routes from '@/constants/routes';
import { MAX_LENGTH_MD } from '@/constants/validations';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { VForm } from '@/types';

export default Vue.extend({
  name: 'CreateEditTeam',

  components: {
    PageContent,
    VTextFieldWithValidation,
    VAutocompleteWithValidation,
    TeamMembersTable,
    StatusSelect,
    RcConfirmationDialog,
  },

  beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext) {
    ['standard', 'adhoc'].indexOf(to.params.teamType) === -1 ? next(from) : next();
  },

  props: {
    teamType: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      isSubmitting: false,
      team: new Team(),
      availableEvents: [],
      userResults: [],
      primaryContactQuery: '',
      fetchingUsers: false,
      map: [null, 'standard', 'adhoc'],
      statuses: [ETeamStatus.Active, ETeamStatus.Inactive],
      currentStatus: ETeamStatus.Active,
      showCancelConfirmationDialog: false,
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.teams.edit.name;
    },

    headerTitle(): TranslateResult {
      if (this.isEditMode) {
        return this.$t('teams.edit_team');
      }
      return this.$t('teams.create_team');
    },

    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        primaryContact: {
          required: true,
        },
        event: {
          required: this.teamType === 'adhoc',
        },
      };
    },

    teamTitle(): TranslateResult {
      if (this.map.indexOf(this.teamType) === ETeamType.Standard) {
        return this.$t('teams.types.standard');
      }
      return this.$t('teams.types.adhoc');
    },

    submitLabel(): TranslateResult {
      return this.isEditMode ? this.$t('common.save') : this.$t('common.buttons.create');
    },

    // teamStatuses(): Record<string, unknown>[] {
    //   return helpers.enumToTranslatedCollection(ETeamStatus, 'teams.status');
    // },
  },

  watch: {
    primaryContactQuery() {
      this.searchPrimaryContacts();
    },

    $route() {
      (this.$refs.form as VForm).reset();
    },
  },

  async mounted() {
    this.availableEvents = await this.$storage.event.actions.searchEvents({ filter: { Schedule: { Status: EEventStatus.Open } } });
  },

  methods: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    searchPrimaryContacts: _debounce(async function debounced(this: any) {
      this.fetchingUsers = true;
      // TODO call storage user to search with this.primaryContactQuery
      this.fetchingUsers = false;
    }),

    setPrimaryContact() {
      // TODO Add user to team member display it on the table and flag him as primary contact
      // TODO When primary contact is already present, flag to false the previous one
    },

    setEventIds(eventId: string | Array<string>) {
      // if single select is used (for adhoc teams)
      if (typeof eventId === 'string') {
        this.team.eventIds = [eventId];
      // if multiple select is used (for standard teams)
      } else {
        this.team.eventIds = eventId;
      }
    },

    isSubmitDisabled(isFailed: boolean, isDirty:boolean) {
      return isFailed || (this.isEditMode && !isDirty);
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.$router.replace({ name: routes.teams.edit.name });
      // TODO in create mode - send data to BE, get the new team ID and open the edit page with the new ID
      }
    },

    navigateToHome() {
      this.$router.push({ name: routes.teams.home.name });
    },

    async onCancel(isDirty: boolean) {
      if (isDirty) {
        this.showCancelConfirmationDialog = true;
      } else {
        this.navigateToHome();
      }
    },
  },
});
</script>

<style scoped lang="scss">

.firstSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: solid 1px var(--v-grey-lighten2);
  border-radius: 4px;
  padding-top: 16px;
  padding-bottom: 32px;

  &__actions {
    display: flex;
    justify-content: flex-end;

    button {
      margin: 0 0 0 16px;
    }
  }
}

</style>
