export interface IRolesData {
  id: uuid;
  displayName: string;
  value: string;
}

export interface IAppUserData {
  id: uuid;
  emailAddress: string;
  phoneNumber: string;
  displayName: string
  roles: Array<IRolesData>
}
