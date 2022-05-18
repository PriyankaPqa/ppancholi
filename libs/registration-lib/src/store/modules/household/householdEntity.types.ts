import { IHouseholdEntity } from '../../../entities/household';

import { IState } from '../base/base.types';

export interface IHouseholdEntityState extends IState <IHouseholdEntity> {
  searchResultsShown: boolean;
}
