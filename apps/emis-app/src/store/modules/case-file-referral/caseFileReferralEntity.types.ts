import { ICaseFileReferralEntity } from '@libs/entities-lib/case-file-referral';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IState } from '../base/base.types';

export interface ICaseFileReferralEntityState extends IState<ICaseFileReferralEntity> {
  types: IOptionItem[];
  outcomeStatuses: IOptionItem[];
  typesFetched: boolean;
  outcomeStatusesFetched: boolean;
}
