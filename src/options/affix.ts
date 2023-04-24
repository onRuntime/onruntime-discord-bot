import { DixtPluginAffixOptions } from "dixt-plugin-affix";
import ROLES from "../constants/roles";

const dixtPluginAffixOptions: DixtPluginAffixOptions = {
  prefix: {
    [ROLES.ONRUNTIME.ADMIN]: "Admin",
    [ROLES.ONRUNTIME.LEAD]: "Lead",
    [ROLES.ONRUNTIME.DEVELOPER]: "Dev",
    [ROLES.ONRUNTIME.DESIGNER]: "Designer",
    [ROLES.ONRUNTIME.COMMUNITY_MANAGER]: "CM",
  },
};

export default dixtPluginAffixOptions;
