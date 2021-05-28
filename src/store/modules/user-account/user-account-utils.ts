import { ActionContext } from 'vuex';
import { IUserAccountSearchData, IUserAccountData, IUserAccount } from '@/entities/user-account';
import { IState } from './user-account.types';

export const mapUserAccountToSearchData = (
  userAccount: IUserAccountData,
  context: ActionContext<IState, IState>,
  originalUserAccountId: uuid,
): IUserAccountSearchData => {
  let originalUserAccount = context.state.userAccounts.find((e) => e.userAccountId === originalUserAccountId);
  // For the round-trip IUserAccountSearchData -> IUserAccount -> IUserAccountSearchData case
  if (!originalUserAccount) {
    originalUserAccount = context.state.userAccounts.find((e) => (e as unknown as IUserAccount).id === originalUserAccountId);
  }

  return {
    userAccountId: userAccount.id,
    userAccountStatus: userAccount.status,
    accountStatus: userAccount.accountStatus,
    tenantId: userAccount.tenantId,

    givenName: originalUserAccount?.givenName,
    surname: originalUserAccount?.surname,
    displayName: originalUserAccount?.displayName,
    emailAddress: originalUserAccount?.emailAddress,
    phoneNumber: originalUserAccount?.phoneNumber,
    roleId: originalUserAccount?.roleId,
    roleName: originalUserAccount?.roleName,
    filters: originalUserAccount?.filters,
    teamCount: originalUserAccount?.teamCount,
    caseFilesCount: originalUserAccount?.caseFilesCount,
    openCaseFilesCount: originalUserAccount?.openCaseFilesCount,
    inactiveCaseFilesCount: originalUserAccount?.inactiveCaseFilesCount,
  };
};
