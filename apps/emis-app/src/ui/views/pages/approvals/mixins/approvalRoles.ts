import Vue from 'vue';
import { IApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { UserRolesNames } from '@libs/entities-lib/user';
import { Status } from '@libs/entities-lib/base';
import { IApprovalBaseEntity } from '@libs/entities-lib/approvals/approvals-base';

export default Vue.extend({
  data() {
    return {
      roles: [],
      localApproval: {} as IApprovalBaseEntity,
    };
  },

  computed: {
    usedRolesIds(): Set<string> {
      const roleIds = this.localApproval.groups.reduce((acc, group) => acc.concat(group.roles), []);
      return new Set(roleIds);
    },

    availableRoles(): IOptionItem[] {
      const level3And4Roles = this.roles.filter((r: IOptionItem) => r.name.translation.en === UserRolesNames.level3 || r.name.translation.en === UserRolesNames.level4);

      if (level3And4Roles.length > 0) {
        return level3And4Roles.map((r) => r.subitems)
          .reduce((prev, current) => [...prev, ...current])
          .filter((r: IOptionSubItem) => r.status === Status.Active || this.usedRolesIds.has(r.id))
          .map((r: IOptionSubItem) => ({ name: r.name, id: r.id }))
          .sort((a: IOptionSubItem, b: IOptionSubItem) => this.$m(a.name).localeCompare(this.$m(b.name)));
      }
      return [];
    },
  },

  methods: {
    buildRoleString(group: IApprovalGroup): string {
      if (this.availableRoles) {
        return group.roles.map((roleId) => {
          const roleName = this.availableRoles.find((x) => x.id === roleId)?.name;
          return this.$m(roleName);
        }).join(', ');
      }
      return '';
    },
  },
});
