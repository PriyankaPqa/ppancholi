import { IMultilingual } from './IMultilingual';

export interface IOptionItemData {
    id: string;
    name: IMultilingual;
    orderRank: number;
    isOther: boolean;
    isDefault: boolean;
    status?: number;
}
