import { IOptionSubItem } from '@libs/entities-lib/optionItem';
import { IRolesData, IUserProfileQueryResponse } from '@libs/entities-lib/user-account';
import { IServerError } from '@libs/shared-lib/types';
import VueI18n from 'vue-i18n';
import { Toasted } from 'vue-toasted';

export interface IAppUser extends IUserProfileQueryResponse {
  role: IRolesData
}

export function getSubRoleById(roleId: string, allSubRoles: IOptionSubItem[]) {
  return (allSubRoles as IOptionSubItem[]).find((r) => r.id === roleId);
}

// eslint-disable-next-line max-params
export async function createUserAccount(user: IAppUser, allSubRoles: IOptionSubItem[], createAccountFn: Function, i18n: VueI18n, toasted: Toasted) : Promise<boolean> {
  const subRole:IOptionSubItem = getSubRoleById(user.role.id, allSubRoles);
  let errorCode = 'system_management.add_users.error';

  if (subRole) {
    const payload = {
      emailAddress: user.emailAddress,
      givenName: user.givenName,
      surname: user.surname,
      roleId: subRole.id,
      id: user.id,
    };

    try {
      const userAccount = await createAccountFn(payload, true);

      if (userAccount) {
        toasted.global.success(i18n.t('system_management.add_users.success'));
        return true;
      }
    } catch (e) {
      const errorData = (e as IServerError)?.response?.data?.errors;
      if (errorData?.length && errorData.length > 0 && errorData[0].code) {
        errorCode = errorData[0].code;
      }
    }
  }

  toasted.global.error(i18n.t(errorCode));
  return false;
}
