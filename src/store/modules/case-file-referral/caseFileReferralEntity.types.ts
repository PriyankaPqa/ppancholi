import { ICaseFileReferralEntity } from '@/entities/case-file-referral';
import { IOptionItem } from '@/entities/optionItem';
import { IState } from '../base/base.types';

export interface ICaseFileReferralEntityState extends IState<ICaseFileReferralEntity> {
  types: IOptionItem[];
  outcomeStatuses: IOptionItem[];
  typesFetched: boolean;
  outcomeStatusesFetched: boolean;
}
