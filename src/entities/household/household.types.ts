import { IAddressData } from '../value-objects/address';

export interface IHouseholdAddress {
  address?: IAddressData;
  from?: string;
  to?: string;
}

export type Status = 1 | 2;

export interface IHouseholdData {
  id?: string;
  tenantId?: string;
  created?: string;
  timestamp?: string;
  status?: Status;
  eTag?: string;
  address?: IHouseholdAddress;
  addressHistory?: Array<IHouseholdAddress>;
  members?: Array<string>;
  primaryBeneficiary?: string;
  registrationNumber?: string;
}
