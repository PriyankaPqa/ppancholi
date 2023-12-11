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
                v-model="user.givenName"
                data-test="first-name"
                :label="`${$t('user.accountSettings.first_name')} *`"
                :rules="rules.name" />
            </v-col>

            <v-col cols="6">
              <v-text-field-with-validation
                v-model="user.surname"
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
import { IMultilingual, VForm } from '@libs/shared-lib/types';
import { useUserAccountStore } from '@/pinia/user-account/user-account';

import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { IServerError } from '@libs/shared-lib/src/types';
import { IUserProfileData, IRolesData } from '@libs/entities-lib/user-account';

interface IAppUser extends IUserProfileData {
  role: IRolesData
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
        this.user.role = {
          id: roleData.value,
          displayName: this.$m(roleData.text),
          value: null,
        };
        this.isSubmitAllowed = true;
      }
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid && this.isSubmitAllowed) {
        this.loading = true;
        const closePage = await this.createUserAccount(this.user);
        if (closePage) {
          this.close();
          this.$emit('users-added');
        } else {
          this.loading = false;
        }
      }
    },

    getSubRoleById(roleId: string) {
      return (this.allSubRoles as IOptionSubItem[]).find((r) => r.id === roleId);
    },

    async createUserAccount(user: IAppUser) : Promise<boolean> {
      const subRole:IOptionSubItem = this.getSubRoleById(user.role.id);
      let errorCode = 'system_management.add_users.error';

      if (subRole) {
        const payload = {
          emailAddress: user.emailAddress,
          givenName: user.givenName,
          surname: user.surname,
          roleId: subRole.id,
        };

        try {
          const userAccount = await useUserAccountStore().createUserAccount(payload, true);
          if (userAccount) {
            this.$toasted.global.success(this.$t('system_management.add_users.success'));
            return true;
          }
        } catch (e) {
          const errorData = (e as IServerError)?.response?.data?.errors;
          if (errorData?.length && errorData.length > 0 && errorData[0].code) {
            errorCode = errorData[0].code;
          }
        }
      }

      this.$toasted.global.error(this.$t(errorCode));
      return false;
    },
  },
});
</script>
