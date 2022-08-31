import { mockBaseData } from '../../base';
import { IApprovalGroup, IApprovalGroupData } from './approvalGroup.types';
import { ApprovalGroup } from './approvalGroup';

export const mockApprovalGroupData = (force? : Partial<IApprovalGroupData>): IApprovalGroupData => ({
  ...mockBaseData(),
  roles: ['1bdf0ed1-284d-47e3-9366-a515d6af910d', 'a6ffce22-8396-43c9-bdc3-6532925af251'],
  minimumAmount: 1,
  maximumAmount: 10,
  editMode: false,
  addMode: false,
  ...force,
});

export const mockApprovalGroup = (force = mockApprovalGroupData()): IApprovalGroup => new ApprovalGroup(force);
