import { IHouseholdEntity } from '@libs/entities-lib/household';

import { IState } from '../base/base.types';

export interface IHouseholdEntityState extends IState <IHouseholdEntity> {
  searchResultsShown: boolean;
}
