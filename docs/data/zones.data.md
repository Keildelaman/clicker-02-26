# Zone Data

> Complete definitions for all 7 game zones.
> Schema: `schemas/zone.schema.md`

---

## Zone 1: Whisperwood Glen

```javascript
{
  id: "whisperwood",
  name: "Whisperwood Glen",
  description: "A peaceful forest where new adventurers take their first steps. Ancient oaks tower overhead, their leaves whispering secrets of old. The creatures here are wary but not yet corrupted by the Void's influence. Perfect for honing your clicking skills.",

  order: 1,
  levelMin: 1,
  levelMax: 10,

  unlockCondition: {
    type: "default"
  },

  monsters: [
    "whisperwood_sprite",
    "whisperwood_boar",
    "whisperwood_wolf",
    "whisperwood_treant"
  ],
  bossId: "boss_mossback",

  items: [
    "weapon_whisperwood_common_01",
    "weapon_whisperwood_common_02",
    "weapon_whisperwood_uncommon_01",
    "weapon_whisperwood_rare_01",
    "accessory_whisperwood_common_01",
    "accessory_whisperwood_uncommon_01"
  ],

  theme: {
    primary: "#2d5a27",
    secondary: "#1a3518",
    accent: "#90EE90",
    atmosphere: "Peaceful forest, dappled sunlight, rustling leaves, birdsong"
  },

  emoji: "🌲",
  backgroundCSS: "linear-gradient(180deg, #2d5a27 0%, #1a3518 100%)"
}
```

---

## Zone 2: Dustwind Plains

```javascript
{
  id: "dustwind",
  name: "Dustwind Plains",
  description: "Rolling golden plains stretching to the horizon, plagued by roaming bandits and territorial beasts. The wind carries dust and the distant sound of conflict. Travelers are advised to keep their weapons ready.",

  order: 2,
  levelMin: 10,
  levelMax: 20,

  unlockCondition: {
    type: "boss",
    bossId: "boss_mossback"
  },

  monsters: [
    "dustwind_dog",
    "dustwind_devil",
    "dustwind_bandit",
    "dustwind_stalker"
  ],
  bossId: "boss_redfang",

  items: [
    "weapon_dustwind_common_01",
    "weapon_dustwind_common_02",
    "weapon_dustwind_uncommon_01",
    "weapon_dustwind_rare_01",
    "accessory_dustwind_common_01",
    "accessory_dustwind_uncommon_01"
  ],

  theme: {
    primary: "#c2a366",
    secondary: "#8b7355",
    accent: "#FFD700",
    atmosphere: "Windy grasslands, golden wheat, dusty roads, frontier settlement"
  },

  emoji: "🌾",
  backgroundCSS: "linear-gradient(180deg, #c2a366 0%, #8b7355 100%)"
}
```

---

## Zone 3: Shadowmire Swamp

```javascript
{
  id: "shadowmire",
  name: "Shadowmire Swamp",
  description: "A cursed wetland where dark magic festers in stagnant pools. Strange lights flicker between dead trees, and the air is thick with decay. Those who enter unprepared rarely return. The Void's corruption is strong here.",

  order: 3,
  levelMin: 20,
  levelMax: 30,

  unlockCondition: {
    type: "boss",
    bossId: "boss_redfang"
  },

  monsters: [
    "shadowmire_crawler",
    "shadowmire_wisp",
    "shadowmire_hag",
    "shadowmire_husk"
  ],
  bossId: "boss_mire_mother",

  items: [
    "weapon_shadowmire_common_01",
    "weapon_shadowmire_common_02",
    "weapon_shadowmire_uncommon_01",
    "weapon_shadowmire_rare_01",
    "accessory_shadowmire_common_01",
    "accessory_shadowmire_uncommon_01"
  ],

  theme: {
    primary: "#2d4a3e",
    secondary: "#1a2f28",
    accent: "#00ff88",
    atmosphere: "Eerie fog, bubbling pools, twisted trees, ethereal glow"
  },

  emoji: "🌫️",
  backgroundCSS: "linear-gradient(180deg, #2d4a3e 0%, #1a2f28 100%)"
}
```

---

## Zone 4: Ironhold Peaks

```javascript
{
  id: "ironhold",
  name: "Ironhold Peaks",
  description: "Ancient mountains riddled with abandoned dwarven mines. Crystal formations glow in the depths, and stone creatures guard treasures long forgotten. The echoes of pickaxes past still ring through the tunnels.",

  order: 4,
  levelMin: 30,
  levelMax: 45,

  unlockCondition: {
    type: "boss",
    bossId: "boss_mire_mother"
  },

  monsters: [
    "ironhold_elemental",
    "ironhold_bat",
    "ironhold_kobold",
    "ironhold_golem"
  ],
  bossId: "boss_grimstone",

  items: [
    "weapon_ironhold_common_01",
    "weapon_ironhold_common_02",
    "weapon_ironhold_uncommon_01",
    "weapon_ironhold_rare_01",
    "accessory_ironhold_common_01",
    "accessory_ironhold_uncommon_01"
  ],

  theme: {
    primary: "#5a5a5a",
    secondary: "#3d3d3d",
    accent: "#87CEEB",
    atmosphere: "Rocky caverns, glowing crystals, echoing chambers, ancient runes"
  },

  emoji: "⛰️",
  backgroundCSS: "linear-gradient(180deg, #5a5a5a 0%, #3d3d3d 100%)"
}
```

---

## Zone 5: Emberfell Wastes

```javascript
{
  id: "emberfell",
  name: "Emberfell Wastes",
  description: "A volcanic hellscape where rivers of lava carve through blackite rock. Fire elementals roam freely, and the very air burns. Only the bravest - or most foolish - venture into this inferno.",

  order: 5,
  levelMin: 45,
  levelMax: 60,

  unlockCondition: {
    type: "boss",
    bossId: "boss_grimstone"
  },

  monsters: [
    "emberfell_slime",
    "emberfell_imp",
    "emberfell_wraith",
    "emberfell_giant"
  ],
  bossId: "boss_pyrax",

  items: [
    "weapon_emberfell_common_01",
    "weapon_emberfell_common_02",
    "weapon_emberfell_uncommon_01",
    "weapon_emberfell_rare_01",
    "accessory_emberfell_common_01",
    "accessory_emberfell_uncommon_01"
  ],

  theme: {
    primary: "#8b2500",
    secondary: "#4a1200",
    accent: "#ff4500",
    atmosphere: "Volcanic heat, lava flows, ash clouds, scorched earth"
  },

  emoji: "🌋",
  backgroundCSS: "linear-gradient(180deg, #8b2500 0%, #4a1200 100%)"
}
```

---

## Zone 6: Frostpeak Summit

```javascript
{
  id: "frostpeak",
  name: "Frostpeak Summit",
  description: "The frozen roof of the world, where eternal blizzards rage and ancient ice creatures dwell. The cold seeps into your bones, but legendary treasures await those who can endure. The aurora dances overhead.",

  order: 6,
  levelMin: 60,
  levelMax: 75,

  unlockCondition: {
    type: "boss",
    bossId: "boss_pyrax"
  },

  monsters: [
    "frostpeak_sprite",
    "frostpeak_prowler",
    "frostpeak_wraith",
    "frostpeak_giant"
  ],
  bossId: "boss_glacielle",

  items: [
    "weapon_frostpeak_common_01",
    "weapon_frostpeak_common_02",
    "weapon_frostpeak_uncommon_01",
    "weapon_frostpeak_rare_01",
    "accessory_frostpeak_common_01",
    "accessory_frostpeak_uncommon_01"
  ],

  theme: {
    primary: "#a5c7d3",
    secondary: "#7ba3b3",
    accent: "#00BFFF",
    atmosphere: "Blizzard winds, ice crystals, aurora borealis, frozen silence"
  },

  emoji: "❄️",
  backgroundCSS: "linear-gradient(180deg, #a5c7d3 0%, #7ba3b3 100%)"
}
```

---

## Zone 7: The Void Rift

```javascript
{
  id: "voidrift",
  name: "The Void Rift",
  description: "The source of all corruption - a tear in reality itself. Here, the laws of nature bend and break. Eldritch horrors from beyond existence lurk in the purple darkness. This is where legends are made... or unmade.",

  order: 7,
  levelMin: 75,
  levelMax: 100,

  unlockCondition: {
    type: "boss",
    bossId: "boss_glacielle"
  },

  monsters: [
    "voidrift_walker",
    "voidrift_imp",
    "voidrift_bender",
    "voidrift_horror"
  ],
  bossId: "boss_xaltheron",

  items: [
    "weapon_voidrift_common_01",
    "weapon_voidrift_common_02",
    "weapon_voidrift_uncommon_01",
    "weapon_voidrift_rare_01",
    "weapon_voidrift_epic_01",
    "weapon_voidrift_legendary_01",
    "accessory_voidrift_common_01",
    "accessory_voidrift_uncommon_01",
    "accessory_voidrift_rare_01"
  ],

  theme: {
    primary: "#2d1b4e",
    secondary: "#1a0f2e",
    accent: "#9370DB",
    atmosphere: "Reality warping, cosmic void, eldritch whispers, purple energy"
  },

  emoji: "🌀",
  backgroundCSS: "linear-gradient(180deg, #2d1b4e 0%, #1a0f2e 100%)"
}
```

---

## Zone Progression Summary

| # | Zone | Levels | Unlock | Boss |
|---|------|--------|--------|------|
| 1 | Whisperwood Glen | 1-10 | Start | Old Mossback |
| 2 | Dustwind Plains | 10-20 | Mossback | Redfang |
| 3 | Shadowmire Swamp | 20-30 | Redfang | Mire Mother |
| 4 | Ironhold Peaks | 30-45 | Mire Mother | Grimstone |
| 5 | Emberfell Wastes | 45-60 | Grimstone | Pyrax |
| 6 | Frostpeak Summit | 60-75 | Pyrax | Glacielle |
| 7 | The Void Rift | 75-100 | Glacielle | Xal'theron |

---

## Implementation Export

```javascript
export const ZONES = {
  whisperwood: { /* ... */ },
  dustwind: { /* ... */ },
  shadowmire: { /* ... */ },
  ironhold: { /* ... */ },
  emberfell: { /* ... */ },
  frostpeak: { /* ... */ },
  voidrift: { /* ... */ }
};

export const ZONE_ORDER = [
  "whisperwood",
  "dustwind",
  "shadowmire",
  "ironhold",
  "emberfell",
  "frostpeak",
  "voidrift"
];
```

---

*References: zone.schema.md, monster.schema.md, item.schema.md*
