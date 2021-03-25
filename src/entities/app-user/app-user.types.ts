export interface IAllUserData {
  id: uuid;
  mail: string;
  mobilePhone: string;
  businessPhones: Array<string>;
}

export interface IRolesData {
  id: uuid;
  displayName: string;
  value: string;
}

export interface IAppUserAzureData {
  id: uuid;
  displayName: string;
  roles: Array<uuid>
}

export interface IAppUserData {
  id: uuid;
  emailAddress: string;
  phoneNumber: string;
  displayName: string
  roles: Array<IRolesData>
}
