import { mockBaseData } from '../../base';
import { IApprovalGroup, IApprovalGroupData } from './approvalGroup.types';
import { ApprovalGroup } from './approvalGroup';

export const mockApprovalGroupData = (force? : Partial<IApprovalGroupData>): IApprovalGroupData => ({
  ...mockBaseData(),
  roles: ['e626199b-7358-40d3-a246-c5f8759862c6', 'ebbf9e55-d817-4a35-8f4c-653993f73956'],
  minimumAmount: 1,
  maximumAmount: 10,
  editMode: false,
  addMode: false,
  ...force,
});

export const mockApprovalGroup = (force = mockApprovalGroupData()): IApprovalGroup => new ApprovalGroup(force);
