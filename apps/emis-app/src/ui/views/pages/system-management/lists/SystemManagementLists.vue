<template>
  <rc-page-content
    :full-height="false"
    :outer-scroll="true"
    :title="$t('system_management.leftMenu.lists_title')"
    :help-link="$t('zendesk.help_link.view_option_lists')"
    :show-help="false"
    show-search
    content-padding="0"
    @search="searchString = $event">
    <div class="lists__container">
      <div class="lists__list">
        <v-list aria-busy="true">
          <v-subheader class="rc-body14 fw-bold pl-4 pointer" @click="toggleSorting">
            {{ $t('system_management.lists.lists_header') }}
            <v-icon size="16px">
              {{ sortingIcon }}
            </v-icon>
          </v-subheader>

          <v-divider />

          <template v-for="(list, index) in optionListsSorted">
            <v-list-item
              :key="`customizable-list-id-${list.dataTest}`"
              :data-test="`customizable-list-id-${list.dataTest}`"
              role="link"
              :to="{ name: list.route }">
              <v-list-item-content class="full-height rc-link14 fw-bold">
                {{ $t(list.name) }}
              </v-list-item-content>
            </v-list-item>

            <v-divider
              v-if="index < optionListsSorted.length"
              :key="index" />
          </template>
        </v-list>
      </div>
    </div>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import { RcPageContent } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import helpers from '@libs/shared-lib/helpers/helpers';

interface IList {
  name: string;
  route: string;
  dataTest: string;
}

export default Vue.extend({
  name: 'OptionLists',

  components: {
    RcPageContent,
  },

  data() {
    const optionLists: Array<IList> = [
      {
        name: 'system_management.lists.caseFileTags',
        route: routes.systemManagement.caseFileTags.name,
        dataTest: 'caseFileTags',
      }, {
        name: 'system_management.lists.eventTypes',
        route: routes.systemManagement.eventTypes.name,
        dataTest: 'eventTypes',
      },
      {
        name: 'system_management.lists.genders',
        route: routes.systemManagement.genders.name,
        dataTest: 'genders',
      },
      // commenting because this may be used in the future again
      // {
      //   name: 'system_management.lists.preferredLanguages',
      //   route: routes.systemManagement.preferredLanguages.name,
      //   dataTest: 'preferredLanguages',
      // },
      {
        name: 'system_management.lists.primarySpokenLanguages',
        route: routes.systemManagement.primarySpokenLanguages.name,
        dataTest: 'primarySpokenLanguages',
      },
      {
        name: 'system_management.lists.agreementTypes',
        route: routes.systemManagement.agreementTypes.name,
        dataTest: 'agreementTypes',
      },
      {
        name: 'system_management.lists.caseFileInactiveReasons',
        route: routes.systemManagement.caseFileInactiveReasons.name,
        dataTest: 'caseFileInactiveReasons',
      },
      {
        name: 'system_management.lists.caseNoteCategories',
        route: routes.systemManagement.caseNoteCategories.name,
        dataTest: 'caseNoteCategories',
      },
      {
        name: 'system_management.lists.caseFileCloseReasons',
        route: routes.systemManagement.caseFileCloseReasons.name,
        dataTest: 'caseFileCloseReasons',
      },
      {
        name: 'system_management.lists.referralOutcomeStatuses',
        route: routes.systemManagement.referralOutcomeStatuses.name,
        dataTest: 'referralOutcomeStatuses',
      },
      {
        name: 'system_management.lists.referralTypes',
        route: routes.systemManagement.referralTypes.name,
        dataTest: 'referralTypes',
      },
      {
        name: 'system_management.lists.financialAssistance',
        route: routes.systemManagement.financialAssistance.name,
        dataTest: 'financialAssistance',
      },
      {
        name: 'system_management.lists.screeningId',
        route: routes.systemManagement.screeningId.name,
        dataTest: 'screeningId',
      },
      {
        name: 'system_management.lists.documentCategories',
        route: routes.systemManagement.documentCategories.name,
        dataTest: 'documentCategories',
      },
      {
        name: 'system_management.lists.exceptionalAuthenticationTypes',
        route: routes.systemManagement.exceptionalAuthenticationTypes.name,
        dataTest: 'exceptionalAuthenticationTypes',
      },
    ];

    if (this.$hasFeature(this.$featureKeys.TaskManagement)) {
      optionLists.push({
        name: 'system_management.lists.taskCategories',
        route: routes.systemManagement.taskCategories.name,
        dataTest: 'taskCategories',
      });
    }

    if (this.$hasFeature(this.$featureKeys.AppointmentBooking)) {
      optionLists.push(...[{
        name: 'system_management.lists.appointmentModalities',
        route: routes.systemManagement.appointmentModalities.name,
        dataTest: 'appointmentModalities',
      },
      {
        name: 'system_management.lists.serviceOptionTypes',
        route: routes.systemManagement.serviceOptionTypes.name,
        dataTest: 'serviceOptionTypes',
      },
    ]);
    }

    return {
      ascendingSort: true,
      searchString: '',
      dateSortDesc: false,
      optionLists,
    };
  },

  computed: {
    sortingIcon() {
      if (this.ascendingSort) {
        return 'arrow_upward';
      }
      return 'arrow_downward';
    },

    optionListsSorted(): Array<IList> {
      const filtered = this.searchString
        ? this.optionLists.filter((list: IList) => {
          const name = helpers.getNormalizedString(this.$t(list.name) as string).toLowerCase();
          return name.indexOf(this.searchString.toLowerCase()) > -1;
        })
        : this.optionLists;

      const sorted = _orderBy(filtered, (list: IList) => helpers.getNormalizedString(this.$t(list.name) as string));

      if (!this.ascendingSort) {
        return sorted.slice().reverse();
      }

      return sorted;
    },
  },

  methods: {
    clearSearch() {
      this.searchString = '';
    },

    toggleSorting() {
      this.ascendingSort = !this.ascendingSort;
    },
  },
});
</script>

<style scoped lang="scss">
.pointer {
  cursor:pointer;
  padding: 8px;
}
::v-deep #actions {
  padding: 0!important;
}

.lists__container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.lists__list {
  flex: 1;
}

.lists__footer {
  padding: 16px;
}
</style>
