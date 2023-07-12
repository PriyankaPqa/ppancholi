<template>
  <rc-dialog
    :title="$t('system_management.userAccounts.add_new_user')"
    :submit-action-label="$t('common.buttons.add')"
    :submit-button-disabled="!isSubmitAllowed"
    :loading="loading"
    :cancel-action-label="$t('common.buttons.cancel')"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    fullscreen
    persistent
    show-close
    @close="close"
    @cancel="close"
    @submit="submit">
    <v-row>
      <v-col cols="12" md="8" class="px-6 mx-auto">
        <div>
          <p class="rc-body16 fw-bold">
            {{ $t('user.accountSettings.member_details') }}
          </p>
        </div>
        <validation-observer ref="form">
          <v-row>
            <v-col cols="6">
              <v-text-field-with-validation
                v-model="user.firstName"
                data-test="first-name"
                :label="`${$t('user.accountSettings.first_name')} *`"
                :rules="rules.name" />
            </v-col>

            <v-col cols="6">
              <v-text-field-with-validation
                v-model="user.lastName"
                data-test="last-name"
                :label="`${$t('user.accountSettings.last_name')} *`"
                :rules="rules.name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field-with-validation
                v-model="user.emailAddress"
                data-test="email"
                :label="`${$t('user.accountSettings.email_username')} *`"
                :rules="rules.email" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-select-with-validation
                dense
                outlined
                return-object
                hide-details
                :item-text="(item) => item ? $m(item.text) : ''"
                :label="$t('system_management.userAccounts.role_header')"
                :items="allAccessLevelRoles"
                @change="onRoleSelected($event)" />
            </v-col>
          </v-row>
        </validation-observer>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, VSelectWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import { IOptionSubItem } from '@libs/entities-lib/optionItem';
import { IAppUserData } from '@libs/entities-lib/app-user';
import { IMultilingual, VForm } from '@libs/shared-lib/types';
import { useUserAccountStore } from '@/pinia/user-account/user-account';

import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';

interface IAppUser extends IAppUserData {
  firstName: string;
  lastName: string;
}

export default Vue.extend({
  name: 'AddUserAccount',

  components: {
    RcDialog,
    VTextFieldWithValidation,
    VSelectWithValidation,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    allSubRoles: {
      type: Array,
      default: () => [] as Array<IOptionSubItem>,
      required: true,
    },
    allAccessLevelRoles: {
      type: Array as ()=> { header?: string, value?: string, name?: IMultilingual }[],
      required: true,
    },
  },

  data() {
    return {
      user: {} as IAppUser,
      loading: false,
      isSubmitAllowed: false as boolean,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        email: {
          required: true,
          email: true,
          max: MAX_LENGTH_MD,
        },
      };
    },
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    onRoleSelected(roleData: { text: IMultilingual, value: string }) {
      if (roleData) {
        this.user.roles = [
          {
            id: roleData.value,
            displayName: this.$m(roleData.text),
            value: null,
          },
        ];
        this.isSubmitAllowed = true;
      }
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid && this.isSubmitAllowed) {
        this.loading = true;
        await this.createUserAccount(this.user);
        this.close();
        this.$emit('users-added');
      }
    },

    getSubRoleById(roleId: string) {
      return (this.allSubRoles as IOptionSubItem[]).find((r) => r.id === roleId);
    },

    async createUserAccount(user: IAppUser) {
      const subRole:IOptionSubItem = this.getSubRoleById(user.roles[0].id);

      if (subRole) {
        const payload = {
          emailAddress: user.emailAddress,
          givenName: user.firstName,
          surname: user.lastName,
          roleId: subRole.id,
        };

        const userAccount = await useUserAccountStore().createUserAccount(payload);
        if (userAccount) {
          this.$toasted.global.success(this.$t('system_management.add_users.success'));
        } else {
          this.$toasted.global.error(this.$t('system_management.add_users.error'));
        }
      }
    },
  },
});
</script>
