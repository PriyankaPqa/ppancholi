export interface IAllUserData {
  id: uuid;
  displayName: string;
  givenName: string;
  userPrincipalName: string;
  mail: string;
  jobTitle: string;
}

export interface IRolesData {
  id: uuid;
  description: string;
  displayName: string;
  isEnabled: boolean;
  origin: string;
  value: string;
}

export interface IAppUserAzureData {
  id: uuid;
  displayName: string;
  roles: Array<uuid>
}

export interface IAppUserData extends IAllUserData {
  roles: Array<IRolesData>
}
