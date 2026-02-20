/**
 * items.data.js - Item Definitions (v2)
 *
 * v2 uses procedurally generated items. The old fixed ITEMS
 * export is kept as an empty object for backward compatibility
 * (economy.js, loot.js, shop-ui.js still import it until Phase 12.5).
 *
 * LEGACY_ITEM_PRICES contains all 96 v1 item buyPrices, used only
 * by storage.js for v4→v5 migration gold compensation.
 *
 * @see docs/design/item-system-v2.md
 */

export const ITEMS = {};

/**
 * Legacy v1 item buyPrices — used for v4→v5 save migration only.
 * Maps old item ID → buyPrice for 50% gold compensation.
 */
export const LEGACY_ITEM_PRICES = {
  // Zone 1: Whisperwood Glen
  weapon_whisperwood_common_01: 150,
  weapon_whisperwood_common_02: 150,
  weapon_whisperwood_uncommon_01: 375,
  weapon_whisperwood_rare_01: 900,
  accessory_whisperwood_common_01: 150,
  accessory_whisperwood_uncommon_01: 375,
  armor_whisperwood_common_01: 225,
  armor_whisperwood_uncommon_01: 450,
  armor_whisperwood_rare_01: 1200,

  // Zone 2: Dustwind Plains
  weapon_dustwind_common_01: 600,
  weapon_dustwind_common_02: 600,
  weapon_dustwind_uncommon_01: 1500,
  weapon_dustwind_rare_01: 3600,
  accessory_dustwind_common_01: 600,
  accessory_dustwind_uncommon_01: 1500,
  accessory_dustwind_rare_01: 3600,
  armor_dustwind_common_01: 750,
  armor_dustwind_uncommon_01: 1800,
  armor_dustwind_rare_01: 4500,

  // Zone 3: Shadowmire Swamp
  weapon_shadowmire_common_01: 1500,
  weapon_shadowmire_common_02: 1500,
  weapon_shadowmire_uncommon_01: 3750,
  weapon_shadowmire_rare_01: 9000,
  accessory_shadowmire_common_01: 1500,
  accessory_shadowmire_uncommon_01: 3750,
  accessory_shadowmire_rare_01: 9000,
  armor_shadowmire_common_01: 1800,
  armor_shadowmire_uncommon_01: 4500,
  armor_shadowmire_rare_01: 12000,

  // Zone 4: Ironhold Peaks
  weapon_ironhold_common_01: 4500,
  weapon_ironhold_common_02: 4500,
  weapon_ironhold_uncommon_01: 11250,
  weapon_ironhold_rare_01: 27000,
  accessory_ironhold_common_01: 4500,
  accessory_ironhold_uncommon_01: 11250,
  accessory_ironhold_rare_01: 27000,
  armor_ironhold_common_01: 5400,
  armor_ironhold_uncommon_01: 13500,
  armor_ironhold_rare_01: 36000,

  // Zone 5: Emberfell Wastes
  weapon_emberfell_common_01: 12000,
  weapon_emberfell_common_02: 12000,
  weapon_emberfell_uncommon_01: 30000,
  weapon_emberfell_rare_01: 72000,
  accessory_emberfell_common_01: 12000,
  accessory_emberfell_uncommon_01: 30000,
  accessory_emberfell_rare_01: 72000,
  armor_emberfell_common_01: 15000,
  armor_emberfell_uncommon_01: 36000,
  armor_emberfell_rare_01: 90000,

  // Zone 6: Frostpeak Summit
  weapon_frostpeak_common_01: 30000,
  weapon_frostpeak_common_02: 30000,
  weapon_frostpeak_uncommon_01: 75000,
  weapon_frostpeak_rare_01: 180000,
  accessory_frostpeak_common_01: 30000,
  accessory_frostpeak_uncommon_01: 75000,
  accessory_frostpeak_rare_01: 180000,
  armor_frostpeak_common_01: 36000,
  armor_frostpeak_uncommon_01: 90000,
  armor_frostpeak_rare_01: 225000,

  // Zone 7: The Void Rift
  weapon_voidrift_common_01: 75000,
  weapon_voidrift_common_02: 75000,
  weapon_voidrift_uncommon_01: 187500,
  weapon_voidrift_rare_01: 450000,
  weapon_voidrift_epic_01: 1125000,
  weapon_voidrift_legendary_01: 3750000,
  accessory_voidrift_common_01: 75000,
  accessory_voidrift_uncommon_01: 187500,
  accessory_voidrift_rare_01: 450000,
  accessory_voidrift_legendary_01: 3750000,
  armor_voidrift_common_01: 90000,
  armor_voidrift_uncommon_01: 225000,
  armor_voidrift_rare_01: 540000,
  armor_voidrift_legendary_01: 4500000,

  // Epic & Legendary (mid-game)
  weapon_shadowmire_epic_01: 22500,
  weapon_ironhold_epic_01: 67500,
  armor_ironhold_epic_01: 67500,
  weapon_emberfell_epic_01: 180000,
  armor_emberfell_epic_01: 180000,
  weapon_frostpeak_legendary_01: 1500000,
  armor_frostpeak_legendary_01: 1500000,

  // Skill-enhancing accessories
  accessory_skillboost_berserk_01: 5400,
  accessory_skillboost_berserk_02: 750000,
  accessory_skillboost_heal_01: 12000,
  accessory_skillboost_heal_02: 540000,
  accessory_skillboost_power_strike_01: 36000,
  accessory_skillboost_power_strike_02: 225000,
  accessory_skillboost_execute_01: 45000,
  accessory_skillboost_execute_02: 1500000,
  accessory_skillboost_general_01: 300000
};
