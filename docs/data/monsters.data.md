# Monster Data

> Complete definitions for all monsters and bosses.
> Schema: `schemas/monster.schema.md`
> Combat System: `systems/combat.system.md`

---

## Monster Type Reference

| Type | Mechanic | Introduced |
|------|----------|------------|
| `normal` | Standard HP, no special mechanic | Zone 1 |
| `swift` | 8s escape timer, damages player on escape | Zone 2 |
| `aggressive` | Attack cycle, damages player if clicked during attack | Zone 2 |
| `regenerating` | Regenerates 3% HP/sec | Zone 3 |
| `armored` | Flat damage reduction | Zone 4 |
| `shielded` | 30% HP shield, 50% damage reduction while shielded | Zone 4 |

**Bosses:** Always `aggressive` + may have secondary type (e.g., `aggressive+armored`)

---

## Zone 1: Whisperwood Glen (Levels 1-10)

### Forest Sprite
```javascript
{
  id: "whisperwood_sprite",
  name: "Forest Sprite",
  description: "A mischievous nature spirit that flickers between the trees. Mostly harmless, but annoying.",
  zone: "whisperwood",
  type: "normal",
  isBoss: false,
  levelMin: 1,
  levelMax: 4,
  baseHealth: 20,
  healthPerLevel: 5,
  goldMin: 2,
  goldMax: 4,
  goldPerLevel: 1,
  xpMin: 8,
  xpMax: 12,
  xpPerLevel: 2,
  lootTable: [
    { itemId: "weapon_whisperwood_common_01", chance: 0.08 }
  ],
  emoji: "🧚",
  sprite: null,
  deathEmoji: "✨",
  spawnWeight: 30
}
```

### Wild Boar
```javascript
{
  id: "whisperwood_boar",
  name: "Wild Boar",
  description: "A territorial beast with sharp tusks. Charges at anything that disturbs its foraging.",
  zone: "whisperwood",
  type: "normal",
  isBoss: false,
  levelMin: 2,
  levelMax: 6,
  baseHealth: 35,
  healthPerLevel: 8,
  goldMin: 3,
  goldMax: 6,
  goldPerLevel: 1,
  xpMin: 10,
  xpMax: 15,
  xpPerLevel: 3,
  lootTable: [
    { itemId: "weapon_whisperwood_common_01", chance: 0.06 },
    { itemId: "weapon_whisperwood_common_02", chance: 0.06 }
  ],
  emoji: "🐗",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 25
}
```

### Timber Wolf
```javascript
{
  id: "whisperwood_wolf",
  name: "Timber Wolf",
  description: "A cunning predator of the forest. Usually hunts in packs, but this one strayed from its family.",
  zone: "whisperwood",
  type: "normal",
  isBoss: false,
  levelMin: 4,
  levelMax: 8,
  baseHealth: 45,
  healthPerLevel: 10,
  goldMin: 4,
  goldMax: 8,
  goldPerLevel: 2,
  xpMin: 12,
  xpMax: 18,
  xpPerLevel: 3,
  lootTable: [
    { itemId: "weapon_whisperwood_common_02", chance: 0.08 },
    { itemId: "weapon_whisperwood_uncommon_01", chance: 0.03 }
  ],
  emoji: "🐺",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 25
}
```

### Grumpy Treant
```javascript
{
  id: "whisperwood_treant",
  name: "Grumpy Treant",
  description: "An awakened tree spirit, cranky from centuries of standing in one place. Don't disturb its roots.",
  zone: "whisperwood",
  type: "normal",
  isBoss: false,
  levelMin: 6,
  levelMax: 10,
  baseHealth: 70,
  healthPerLevel: 15,
  goldMin: 5,
  goldMax: 10,
  goldPerLevel: 2,
  xpMin: 15,
  xpMax: 22,
  xpPerLevel: 4,
  lootTable: [
    { itemId: "weapon_whisperwood_uncommon_01", chance: 0.05 },
    { itemId: "accessory_whisperwood_common_01", chance: 0.06 },
    { itemId: "weapon_whisperwood_rare_01", chance: 0.005 }
  ],
  emoji: "🌳",
  sprite: null,
  deathEmoji: "🪵",
  spawnWeight: 20
}
```

### BOSS: Old Mossback
```javascript
{
  id: "boss_mossback",
  name: "Old Mossback",
  description: "An ancient treant who has guarded Whisperwood for centuries. His bark is thick with age and moss, and his fury is legendary. Defeating him proves you're ready for greater challenges.",
  zone: "whisperwood",
  type: "aggressive",           // Bosses are always aggressive
  isBoss: true,
  levelMin: 10,
  levelMax: 10,
  baseHealth: 500,
  healthPerLevel: 0,
  goldMin: 100,
  goldMax: 150,
  goldPerLevel: 0,
  xpMin: 200,
  xpMax: 250,
  xpPerLevel: 0,
  // Aggressive attack pattern
  attackCycle: {
    safeTime: 4000,             // 4s safe phase
    warningTime: 800,           // 0.8s warning
    attackTime: 1200            // 1.2s attack phase
  },
  lootTable: [
    { itemId: "weapon_whisperwood_rare_01", chance: 1.0 }
  ],
  emoji: "🌲",
  sprite: null,
  deathEmoji: "🪵",
  spawnWeight: 0
}
```

---

## Zone 2: Dustwind Plains (Levels 10-20)

### Prairie Dog
```javascript
{
  id: "dustwind_dog",
  name: "Prairie Dog",
  description: "These oversized rodents have adapted to the harsh plains. They bite harder than they look.",
  zone: "dustwind",
  type: "normal",
  isBoss: false,
  levelMin: 10,
  levelMax: 13,
  baseHealth: 80,
  healthPerLevel: 12,
  goldMin: 6,
  goldMax: 12,
  goldPerLevel: 2,
  xpMin: 18,
  xpMax: 25,
  xpPerLevel: 4,
  lootTable: [
    { itemId: "weapon_dustwind_common_01", chance: 0.08 }
  ],
  emoji: "🐿️",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 30
}
```

### Dust Devil
```javascript
{
  id: "dustwind_devil",
  name: "Dust Devil",
  description: "A small air elemental that whips up debris into a stinging whirlwind. Annoying and persistent.",
  zone: "dustwind",
  type: "swift",                // First Swift type!
  isBoss: false,
  levelMin: 11,
  levelMax: 15,
  baseHealth: 95,
  healthPerLevel: 15,
  goldMin: 8,
  goldMax: 15,
  goldPerLevel: 2,
  xpMin: 22,
  xpMax: 30,
  xpPerLevel: 4,
  escapeTimer: 8000,            // 8 seconds to kill
  escapeDamage: 0.05,           // 5% max HP on escape
  lootTable: [
    { itemId: "weapon_dustwind_common_01", chance: 0.06 },
    { itemId: "accessory_dustwind_common_01", chance: 0.05 }
  ],
  emoji: "🌪️",
  sprite: null,
  deathEmoji: "💨",
  spawnWeight: 25
}
```

### Bandit Scout
```javascript
{
  id: "dustwind_bandit",
  name: "Bandit Scout",
  description: "A lowly member of Redfang's gang, sent to patrol the roads and rob unwary travelers.",
  zone: "dustwind",
  type: "aggressive",           // First Aggressive regular monster!
  isBoss: false,
  levelMin: 13,
  levelMax: 17,
  baseHealth: 120,
  healthPerLevel: 18,
  goldMin: 10,
  goldMax: 20,
  goldPerLevel: 3,
  xpMin: 28,
  xpMax: 38,
  xpPerLevel: 5,
  attackCycle: {
    safeTime: 5000,             // 5s safe phase
    warningTime: 600,           // 0.6s warning
    attackTime: 800             // 0.8s attack phase
  },
  lootTable: [
    { itemId: "weapon_dustwind_common_02", chance: 0.08 },
    { itemId: "weapon_dustwind_uncommon_01", chance: 0.04 }
  ],
  emoji: "🗡️",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 25
}
```

### Plains Stalker
```javascript
{
  id: "dustwind_stalker",
  name: "Plains Stalker",
  description: "A large predatory cat that hunts the grasslands. Silent, fast, and deadly.",
  zone: "dustwind",
  type: "swift",
  isBoss: false,
  levelMin: 15,
  levelMax: 20,
  baseHealth: 150,
  healthPerLevel: 20,
  goldMin: 12,
  goldMax: 25,
  goldPerLevel: 3,
  xpMin: 35,
  xpMax: 48,
  xpPerLevel: 6,
  escapeTimer: 7000,            // 7 seconds (faster than Dust Devil)
  escapeDamage: 0.08,           // 8% max HP on escape
  lootTable: [
    { itemId: "weapon_dustwind_uncommon_01", chance: 0.05 },
    { itemId: "weapon_dustwind_rare_01", chance: 0.008 },
    { itemId: "accessory_dustwind_uncommon_01", chance: 0.03 }
  ],
  emoji: "🐆",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 20
}
```

### BOSS: Redfang the Bandit King
```javascript
{
  id: "boss_redfang",
  name: "Redfang the Bandit King",
  description: "The notorious leader of the Dustwind bandits. His crimson blade has ended countless lives. They say he once was a noble knight, now corrupted by greed and the Void's whispers.",
  zone: "dustwind",
  type: "aggressive",
  isBoss: true,
  levelMin: 20,
  levelMax: 20,
  baseHealth: 1200,
  healthPerLevel: 0,
  goldMin: 300,
  goldMax: 450,
  goldPerLevel: 0,
  xpMin: 500,
  xpMax: 600,
  xpPerLevel: 0,
  attackCycle: {
    safeTime: 3500,             // Faster attacks than Mossback
    warningTime: 700,
    attackTime: 1000
  },
  lootTable: [
    { itemId: "weapon_dustwind_rare_01", chance: 1.0 },
    { itemId: "accessory_dustwind_rare_01", chance: 0.25 }
  ],
  emoji: "👑",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 0
}
```

---

## Zone 3: Shadowmire Swamp (Levels 20-30)

### Bog Crawler
```javascript
{
  id: "shadowmire_crawler",
  name: "Bog Crawler",
  description: "A many-legged creature that lurks beneath the murky water. Its bite carries swamp disease.",
  zone: "shadowmire",
  type: "normal",
  isBoss: false,
  levelMin: 20,
  levelMax: 24,
  baseHealth: 200,
  healthPerLevel: 25,
  goldMin: 15,
  goldMax: 30,
  goldPerLevel: 4,
  xpMin: 45,
  xpMax: 60,
  xpPerLevel: 7,
  lootTable: [
    { itemId: "weapon_shadowmire_common_01", chance: 0.08 }
  ],
  emoji: "🦂",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 30
}
```

### Will-o-Wisp
```javascript
{
  id: "shadowmire_wisp",
  name: "Will-o-Wisp",
  description: "Deceptive lights that lead travelers astray. Actually malevolent spirits feeding on confusion.",
  zone: "shadowmire",
  type: "swift",
  isBoss: false,
  levelMin: 21,
  levelMax: 26,
  baseHealth: 180,
  healthPerLevel: 22,
  goldMin: 18,
  goldMax: 35,
  goldPerLevel: 4,
  xpMin: 50,
  xpMax: 68,
  xpPerLevel: 8,
  escapeTimer: 6000,            // Very fast escape
  escapeDamage: 0.07,
  lootTable: [
    { itemId: "weapon_shadowmire_common_02", chance: 0.07 },
    { itemId: "accessory_shadowmire_common_01", chance: 0.05 }
  ],
  emoji: "👻",
  sprite: null,
  deathEmoji: "✨",
  spawnWeight: 25
}
```

### Swamp Hag
```javascript
{
  id: "shadowmire_hag",
  name: "Swamp Hag",
  description: "A twisted crone who made dark pacts for power. She collects bones and weaves curses.",
  zone: "shadowmire",
  type: "regenerating",         // First Regenerating type!
  isBoss: false,
  levelMin: 24,
  levelMax: 28,
  baseHealth: 280,
  healthPerLevel: 30,
  goldMin: 25,
  goldMax: 45,
  goldPerLevel: 5,
  xpMin: 60,
  xpMax: 82,
  xpPerLevel: 9,
  regenRate: 0.03,              // 3% HP per second
  lootTable: [
    { itemId: "weapon_shadowmire_uncommon_01", chance: 0.05 },
    { itemId: "accessory_shadowmire_uncommon_01", chance: 0.04 }
  ],
  emoji: "🧙‍♀️",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 25
}
```

### Rotting Husk
```javascript
{
  id: "shadowmire_husk",
  name: "Rotting Husk",
  description: "The animated remains of those who died in the swamp. Shambles forward with mindless hunger.",
  zone: "shadowmire",
  type: "aggressive",
  isBoss: false,
  levelMin: 26,
  levelMax: 30,
  baseHealth: 350,
  healthPerLevel: 35,
  goldMin: 30,
  goldMax: 55,
  goldPerLevel: 6,
  xpMin: 72,
  xpMax: 95,
  xpPerLevel: 10,
  attackCycle: {
    safeTime: 4500,
    warningTime: 600,
    attackTime: 900
  },
  lootTable: [
    { itemId: "weapon_shadowmire_uncommon_01", chance: 0.06 },
    { itemId: "weapon_shadowmire_rare_01", chance: 0.008 }
  ],
  emoji: "🧟",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 20
}
```

### BOSS: The Mire Mother
```javascript
{
  id: "boss_mire_mother",
  name: "The Mire Mother",
  description: "A primordial entity born from the swamp's corruption. She is the source of the undead that plague Shadowmire. Her form shifts between beautiful and horrific.",
  zone: "shadowmire",
  type: "aggressive+regenerating", // Boss with secondary type
  isBoss: true,
  levelMin: 30,
  levelMax: 30,
  baseHealth: 3000,
  healthPerLevel: 0,
  goldMin: 700,
  goldMax: 1000,
  goldPerLevel: 0,
  xpMin: 1200,
  xpMax: 1500,
  xpPerLevel: 0,
  attackCycle: {
    safeTime: 3000,
    warningTime: 700,
    attackTime: 1100
  },
  regenRate: 0.02,              // 2% HP per second (slower than regular)
  lootTable: [
    { itemId: "weapon_shadowmire_rare_01", chance: 1.0 },
    { itemId: "accessory_shadowmire_rare_01", chance: 0.25 }
  ],
  emoji: "👁️",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 0
}
```

---

## Zone 4: Ironhold Peaks (Levels 30-45)

### Rock Elemental
```javascript
{
  id: "ironhold_elemental",
  name: "Rock Elemental",
  description: "Living stone animated by ancient dwarven magic. Guards the old mining tunnels with tireless vigilance.",
  zone: "ironhold",
  type: "armored",              // First Armored type!
  isBoss: false,
  levelMin: 30,
  levelMax: 36,
  baseHealth: 450,
  healthPerLevel: 40,
  goldMin: 40,
  goldMax: 75,
  goldPerLevel: 6,
  xpMin: 90,
  xpMax: 120,
  xpPerLevel: 10,
  armorValue: 15,               // Reduces each hit by 15
  lootTable: [
    { itemId: "weapon_ironhold_common_01", chance: 0.08 }
  ],
  emoji: "🗿",
  sprite: null,
  deathEmoji: "💎",
  spawnWeight: 30
}
```

### Cave Bat Swarm
```javascript
{
  id: "ironhold_bat",
  name: "Cave Bat Swarm",
  description: "Hundreds of small bats moving as one hungry cloud. Their collective bites can drain a warrior dry.",
  zone: "ironhold",
  type: "swift",
  isBoss: false,
  levelMin: 32,
  levelMax: 38,
  baseHealth: 400,
  healthPerLevel: 35,
  goldMin: 45,
  goldMax: 85,
  goldPerLevel: 7,
  xpMin: 100,
  xpMax: 135,
  xpPerLevel: 11,
  escapeTimer: 6000,
  escapeDamage: 0.10,           // Higher damage on escape
  lootTable: [
    { itemId: "weapon_ironhold_common_02", chance: 0.07 },
    { itemId: "accessory_ironhold_common_01", chance: 0.05 }
  ],
  emoji: "🦇",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 25
}
```

### Kobold Miner
```javascript
{
  id: "ironhold_kobold",
  name: "Kobold Miner",
  description: "Small but vicious creatures who claimed the abandoned mines. Wields a pickaxe with surprising skill.",
  zone: "ironhold",
  type: "aggressive",
  isBoss: false,
  levelMin: 35,
  levelMax: 42,
  baseHealth: 520,
  healthPerLevel: 45,
  goldMin: 55,
  goldMax: 100,
  goldPerLevel: 8,
  xpMin: 115,
  xpMax: 155,
  xpPerLevel: 12,
  attackCycle: {
    safeTime: 4000,
    warningTime: 500,           // Quick warning
    attackTime: 700
  },
  lootTable: [
    { itemId: "weapon_ironhold_uncommon_01", chance: 0.05 },
    { itemId: "accessory_ironhold_uncommon_01", chance: 0.04 }
  ],
  emoji: "⛏️",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 25
}
```

### Crystal Golem
```javascript
{
  id: "ironhold_golem",
  name: "Crystal Golem",
  description: "A construct of pure crystal, refracting light into deadly beams. The dwarves' greatest creation, now masterless.",
  zone: "ironhold",
  type: "shielded",             // First Shielded type!
  isBoss: false,
  levelMin: 38,
  levelMax: 45,
  baseHealth: 700,
  healthPerLevel: 55,
  goldMin: 70,
  goldMax: 130,
  goldPerLevel: 10,
  xpMin: 140,
  xpMax: 190,
  xpPerLevel: 14,
  shieldPercent: 0.30,          // 30% max HP as shield
  shieldDamageReduction: 0.50,  // 50% damage reduction while shielded
  lootTable: [
    { itemId: "weapon_ironhold_uncommon_01", chance: 0.06 },
    { itemId: "weapon_ironhold_rare_01", chance: 0.01 }
  ],
  emoji: "💎",
  sprite: null,
  deathEmoji: "✨",
  spawnWeight: 20
}
```

### BOSS: Grimstone the Eternal
```javascript
{
  id: "boss_grimstone",
  name: "Grimstone the Eternal",
  description: "The last guardian of Ironhold, a golem of immense power created by the dwarven high king himself. It has waited millennia for intruders to destroy.",
  zone: "ironhold",
  type: "aggressive+armored",   // Aggressive + secondary type
  isBoss: true,
  levelMin: 45,
  levelMax: 45,
  baseHealth: 8000,
  healthPerLevel: 0,
  goldMin: 1500,
  goldMax: 2200,
  goldPerLevel: 0,
  xpMin: 3000,
  xpMax: 3800,
  xpPerLevel: 0,
  attackCycle: {
    safeTime: 2800,
    warningTime: 800,
    attackTime: 1200
  },
  armorValue: 25,               // High armor
  lootTable: [
    { itemId: "weapon_ironhold_rare_01", chance: 1.0 },
    { itemId: "accessory_ironhold_rare_01", chance: 0.25 }
  ],
  emoji: "🏔️",
  sprite: null,
  deathEmoji: "💥",
  spawnWeight: 0
}
```

---

## Zone 5: Emberfell Wastes (Levels 45-60)

### Magma Slime
```javascript
{
  id: "emberfell_slime",
  name: "Magma Slime",
  description: "A blob of living lava that oozes across the volcanic rock. Its touch melts steel.",
  zone: "emberfell",
  type: "regenerating",
  isBoss: false,
  levelMin: 45,
  levelMax: 51,
  baseHealth: 800,
  healthPerLevel: 55,
  goldMin: 90,
  goldMax: 170,
  goldPerLevel: 10,
  xpMin: 180,
  xpMax: 240,
  xpPerLevel: 15,
  regenRate: 0.04,              // 4% HP per second
  lootTable: [
    { itemId: "weapon_emberfell_common_01", chance: 0.08 }
  ],
  emoji: "🔴",
  sprite: null,
  deathEmoji: "💧",
  spawnWeight: 30
}
```

### Fire Imp
```javascript
{
  id: "emberfell_imp",
  name: "Fire Imp",
  description: "A cackling demon of flame, delighting in setting things ablaze. Small but dangerously unpredictable.",
  zone: "emberfell",
  type: "aggressive",
  isBoss: false,
  levelMin: 47,
  levelMax: 54,
  baseHealth: 750,
  healthPerLevel: 50,
  goldMin: 100,
  goldMax: 190,
  goldPerLevel: 11,
  xpMin: 200,
  xpMax: 270,
  xpPerLevel: 16,
  attackCycle: {
    safeTime: 3500,
    warningTime: 400,           // Very quick warning
    attackTime: 600
  },
  lootTable: [
    { itemId: "weapon_emberfell_common_02", chance: 0.07 },
    { itemId: "accessory_emberfell_common_01", chance: 0.05 }
  ],
  emoji: "😈",
  sprite: null,
  deathEmoji: "🔥",
  spawnWeight: 25
}
```

### Ash Wraith
```javascript
{
  id: "emberfell_wraith",
  name: "Ash Wraith",
  description: "The spirit of one who died in volcanic fire. Now it spreads that suffering to others.",
  zone: "emberfell",
  type: "shielded",
  isBoss: false,
  levelMin: 50,
  levelMax: 57,
  baseHealth: 950,
  healthPerLevel: 60,
  goldMin: 120,
  goldMax: 220,
  goldPerLevel: 13,
  xpMin: 230,
  xpMax: 310,
  xpPerLevel: 18,
  shieldPercent: 0.35,
  shieldDamageReduction: 0.50,
  lootTable: [
    { itemId: "weapon_emberfell_uncommon_01", chance: 0.05 },
    { itemId: "accessory_emberfell_uncommon_01", chance: 0.04 }
  ],
  emoji: "👤",
  sprite: null,
  deathEmoji: "💨",
  spawnWeight: 25
}
```

### Molten Giant
```javascript
{
  id: "emberfell_giant",
  name: "Molten Giant",
  description: "A towering humanoid of living rock and fire. Each step leaves burning footprints.",
  zone: "emberfell",
  type: "armored",
  isBoss: false,
  levelMin: 54,
  levelMax: 60,
  baseHealth: 1300,
  healthPerLevel: 80,
  goldMin: 150,
  goldMax: 280,
  goldPerLevel: 15,
  xpMin: 280,
  xpMax: 380,
  xpPerLevel: 20,
  armorValue: 30,
  lootTable: [
    { itemId: "weapon_emberfell_uncommon_01", chance: 0.06 },
    { itemId: "weapon_emberfell_rare_01", chance: 0.01 }
  ],
  emoji: "🔥",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 20
}
```

### BOSS: Pyrax the Flamelord
```javascript
{
  id: "boss_pyrax",
  name: "Pyrax the Flamelord",
  description: "A fire elemental of immense power who claims the Emberfell as his domain. His flames burn hotter than any forge. Some say he was once a mortal mage consumed by his own ambition.",
  zone: "emberfell",
  type: "aggressive+shielded",
  isBoss: true,
  levelMin: 60,
  levelMax: 60,
  baseHealth: 20000,
  healthPerLevel: 0,
  goldMin: 3500,
  goldMax: 5000,
  goldPerLevel: 0,
  xpMin: 7500,
  xpMax: 9500,
  xpPerLevel: 0,
  attackCycle: {
    safeTime: 2500,
    warningTime: 600,
    attackTime: 1000
  },
  shieldPercent: 0.25,
  shieldDamageReduction: 0.40,
  lootTable: [
    { itemId: "weapon_emberfell_rare_01", chance: 1.0 },
    { itemId: "accessory_emberfell_rare_01", chance: 0.25 }
  ],
  emoji: "🌟",
  sprite: null,
  deathEmoji: "💥",
  spawnWeight: 0
}
```

---

## Zone 6: Frostpeak Summit (Levels 60-75)

### Frost Sprite
```javascript
{
  id: "frostpeak_sprite",
  name: "Frost Sprite",
  description: "A cold-hearted fae creature made of living ice. Beautiful and deadly in equal measure.",
  zone: "frostpeak",
  type: "swift",
  isBoss: false,
  levelMin: 60,
  levelMax: 66,
  baseHealth: 1400,
  healthPerLevel: 80,
  goldMin: 200,
  goldMax: 380,
  goldPerLevel: 18,
  xpMin: 350,
  xpMax: 470,
  xpPerLevel: 22,
  escapeTimer: 5000,            // Very fast
  escapeDamage: 0.12,
  lootTable: [
    { itemId: "weapon_frostpeak_common_01", chance: 0.08 }
  ],
  emoji: "❄️",
  sprite: null,
  deathEmoji: "✨",
  spawnWeight: 30
}
```

### Snow Prowler
```javascript
{
  id: "frostpeak_prowler",
  name: "Snow Prowler",
  description: "A massive white-furred predator, nearly invisible against the snow. Hunts with patience and precision.",
  zone: "frostpeak",
  type: "aggressive",
  isBoss: false,
  levelMin: 62,
  levelMax: 68,
  baseHealth: 1600,
  healthPerLevel: 90,
  goldMin: 230,
  goldMax: 430,
  goldPerLevel: 20,
  xpMin: 400,
  xpMax: 540,
  xpPerLevel: 25,
  attackCycle: {
    safeTime: 3000,
    warningTime: 400,
    attackTime: 800
  },
  lootTable: [
    { itemId: "weapon_frostpeak_common_02", chance: 0.07 },
    { itemId: "accessory_frostpeak_common_01", chance: 0.05 }
  ],
  emoji: "🐻‍❄️",
  sprite: null,
  deathEmoji: "💀",
  spawnWeight: 25
}
```

### Ice Wraith
```javascript
{
  id: "frostpeak_wraith",
  name: "Ice Wraith",
  description: "The frozen soul of a climber who never made it down. Its touch brings a chill that reaches your bones.",
  zone: "frostpeak",
  type: "regenerating",
  isBoss: false,
  levelMin: 65,
  levelMax: 72,
  baseHealth: 1900,
  healthPerLevel: 100,
  goldMin: 270,
  goldMax: 500,
  goldPerLevel: 22,
  xpMin: 470,
  xpMax: 630,
  xpPerLevel: 28,
  regenRate: 0.05,              // 5% HP per second
  lootTable: [
    { itemId: "weapon_frostpeak_uncommon_01", chance: 0.05 },
    { itemId: "accessory_frostpeak_uncommon_01", chance: 0.04 }
  ],
  emoji: "👻",
  sprite: null,
  deathEmoji: "❄️",
  spawnWeight: 25
}
```

### Frozen Giant
```javascript
{
  id: "frostpeak_giant",
  name: "Frozen Giant",
  description: "An ancient titan encased in eternal ice. It moves slowly but each blow carries the weight of glaciers.",
  zone: "frostpeak",
  type: "armored",
  isBoss: false,
  levelMin: 68,
  levelMax: 75,
  baseHealth: 2500,
  healthPerLevel: 120,
  goldMin: 320,
  goldMax: 600,
  goldPerLevel: 25,
  xpMin: 560,
  xpMax: 750,
  xpPerLevel: 32,
  armorValue: 45,               // Very high armor
  lootTable: [
    { itemId: "weapon_frostpeak_uncommon_01", chance: 0.06 },
    { itemId: "weapon_frostpeak_rare_01", chance: 0.01 }
  ],
  emoji: "🧊",
  sprite: null,
  deathEmoji: "💎",
  spawnWeight: 20
}
```

### BOSS: Queen Glacielle
```javascript
{
  id: "boss_glacielle",
  name: "Queen Glacielle",
  description: "The immortal queen of winter, who has ruled Frostpeak since before recorded history. Her beauty is matched only by her cruelty. They say she froze her own heart to gain eternal life.",
  zone: "frostpeak",
  type: "aggressive+regenerating",
  isBoss: true,
  levelMin: 75,
  levelMax: 75,
  baseHealth: 50000,
  healthPerLevel: 0,
  goldMin: 8000,
  goldMax: 12000,
  goldPerLevel: 0,
  xpMin: 18000,
  xpMax: 23000,
  xpPerLevel: 0,
  attackCycle: {
    safeTime: 2200,
    warningTime: 500,
    attackTime: 900
  },
  regenRate: 0.015,             // 1.5% HP per second (still a lot at 50k HP)
  lootTable: [
    { itemId: "weapon_frostpeak_rare_01", chance: 1.0 },
    { itemId: "accessory_frostpeak_rare_01", chance: 0.25 }
  ],
  emoji: "👑",
  sprite: null,
  deathEmoji: "❄️",
  spawnWeight: 0
}
```

---

## Zone 7: The Void Rift (Levels 75-100)

### Void Walker
```javascript
{
  id: "voidrift_walker",
  name: "Void Walker",
  description: "A humanoid shape made of pure darkness. It phases in and out of reality, striking from impossible angles.",
  zone: "voidrift",
  type: "shielded",
  isBoss: false,
  levelMin: 75,
  levelMax: 84,
  baseHealth: 3000,
  healthPerLevel: 150,
  goldMin: 450,
  goldMax: 850,
  goldPerLevel: 35,
  xpMin: 700,
  xpMax: 950,
  xpPerLevel: 40,
  shieldPercent: 0.40,
  shieldDamageReduction: 0.60,
  lootTable: [
    { itemId: "weapon_voidrift_common_01", chance: 0.08 }
  ],
  emoji: "🕳️",
  sprite: null,
  deathEmoji: "✨",
  spawnWeight: 30
}
```

### Chaos Imp
```javascript
{
  id: "voidrift_imp",
  name: "Chaos Imp",
  description: "A small demon of pure chaos. Its form constantly shifts, making it hard to track.",
  zone: "voidrift",
  type: "swift",
  isBoss: false,
  levelMin: 78,
  levelMax: 88,
  baseHealth: 2800,
  healthPerLevel: 140,
  goldMin: 500,
  goldMax: 950,
  goldPerLevel: 38,
  xpMin: 780,
  xpMax: 1050,
  xpPerLevel: 45,
  escapeTimer: 4000,            // Very fast escape
  escapeDamage: 0.15,
  lootTable: [
    { itemId: "weapon_voidrift_common_02", chance: 0.07 },
    { itemId: "accessory_voidrift_common_01", chance: 0.05 }
  ],
  emoji: "👿",
  sprite: null,
  deathEmoji: "💫",
  spawnWeight: 25
}
```

### Reality Bender
```javascript
{
  id: "voidrift_bender",
  name: "Reality Bender",
  description: "A creature that doesn't obey the laws of physics. Space warps around it, making distance meaningless.",
  zone: "voidrift",
  type: "aggressive",
  isBoss: false,
  levelMin: 82,
  levelMax: 93,
  baseHealth: 4000,
  healthPerLevel: 180,
  goldMin: 600,
  goldMax: 1100,
  goldPerLevel: 42,
  xpMin: 900,
  xpMax: 1200,
  xpPerLevel: 50,
  attackCycle: {
    safeTime: 2000,             // Very aggressive
    warningTime: 300,
    attackTime: 700
  },
  lootTable: [
    { itemId: "weapon_voidrift_uncommon_01", chance: 0.05 },
    { itemId: "accessory_voidrift_uncommon_01", chance: 0.04 }
  ],
  emoji: "🌀",
  sprite: null,
  deathEmoji: "💥",
  spawnWeight: 25
}
```

### Eldritch Horror
```javascript
{
  id: "voidrift_horror",
  name: "Eldritch Horror",
  description: "Something that should not exist. Looking at it too long causes madness. Its true form is incomprehensible.",
  zone: "voidrift",
  type: "armored+regenerating", // Dual type regular monster
  isBoss: false,
  levelMin: 88,
  levelMax: 100,
  baseHealth: 5500,
  healthPerLevel: 220,
  goldMin: 750,
  goldMax: 1400,
  goldPerLevel: 50,
  xpMin: 1100,
  xpMax: 1500,
  xpPerLevel: 60,
  armorValue: 50,
  regenRate: 0.03,
  lootTable: [
    { itemId: "weapon_voidrift_uncommon_01", chance: 0.06 },
    { itemId: "weapon_voidrift_rare_01", chance: 0.015 },
    { itemId: "weapon_voidrift_epic_01", chance: 0.003 }
  ],
  emoji: "👁️‍🗨️",
  sprite: null,
  deathEmoji: "🕳️",
  spawnWeight: 20
}
```

### BOSS: Xal'theron, the Void King
```javascript
{
  id: "boss_xaltheron",
  name: "Xal'theron, the Void King",
  description: "The source of the corruption, a god-like entity from beyond reality. He seeks to consume all of Clickoria into the endless void. This is the final battle. Everything you've fought for comes down to this moment.",
  zone: "voidrift",
  type: "aggressive+shielded+regenerating", // Triple threat final boss
  isBoss: true,
  levelMin: 100,
  levelMax: 100,
  baseHealth: 150000,
  healthPerLevel: 0,
  goldMin: 25000,
  goldMax: 40000,
  goldPerLevel: 0,
  xpMin: 50000,
  xpMax: 65000,
  xpPerLevel: 0,
  attackCycle: {
    safeTime: 1800,             // Very fast attack cycle
    warningTime: 400,
    attackTime: 800
  },
  shieldPercent: 0.20,
  shieldDamageReduction: 0.50,
  regenRate: 0.01,              // 1% = 1500 HP/sec
  lootTable: [
    { itemId: "weapon_voidrift_legendary_01", chance: 1.0 },
    { itemId: "accessory_voidrift_legendary_01", chance: 0.5 }
  ],
  emoji: "⚫",
  sprite: null,
  deathEmoji: "💥",
  spawnWeight: 0
}
```

---

## Monster Summary Table

| Zone | Monster | Type | Levels | Base HP | Special |
|------|---------|------|--------|---------|---------|
| Whisperwood | Forest Sprite | Normal | 1-4 | 20 | - |
| Whisperwood | Wild Boar | Normal | 2-6 | 35 | - |
| Whisperwood | Timber Wolf | Normal | 4-8 | 45 | - |
| Whisperwood | Grumpy Treant | Normal | 6-10 | 70 | - |
| Whisperwood | **Old Mossback** | Aggressive | 10 | 500 | Boss |
| Dustwind | Prairie Dog | Normal | 10-13 | 80 | - |
| Dustwind | Dust Devil | Swift | 11-15 | 95 | 8s escape |
| Dustwind | Bandit Scout | Aggressive | 13-17 | 120 | Attacks |
| Dustwind | Plains Stalker | Swift | 15-20 | 150 | 7s escape |
| Dustwind | **Redfang** | Aggressive | 20 | 1200 | Boss |
| Shadowmire | Bog Crawler | Normal | 20-24 | 200 | - |
| Shadowmire | Will-o-Wisp | Swift | 21-26 | 180 | 6s escape |
| Shadowmire | Swamp Hag | Regenerating | 24-28 | 280 | 3% HP/s |
| Shadowmire | Rotting Husk | Aggressive | 26-30 | 350 | Attacks |
| Shadowmire | **Mire Mother** | Aggr+Regen | 30 | 3000 | Boss |
| Ironhold | Rock Elemental | Armored | 30-36 | 450 | 15 armor |
| Ironhold | Cave Bat Swarm | Swift | 32-38 | 400 | 6s escape |
| Ironhold | Kobold Miner | Aggressive | 35-42 | 520 | Attacks |
| Ironhold | Crystal Golem | Shielded | 38-45 | 700 | 30% shield |
| Ironhold | **Grimstone** | Aggr+Armor | 45 | 8000 | Boss |
| Emberfell | Magma Slime | Regenerating | 45-51 | 800 | 4% HP/s |
| Emberfell | Fire Imp | Aggressive | 47-54 | 750 | Attacks |
| Emberfell | Ash Wraith | Shielded | 50-57 | 950 | 35% shield |
| Emberfell | Molten Giant | Armored | 54-60 | 1300 | 30 armor |
| Emberfell | **Pyrax** | Aggr+Shield | 60 | 20000 | Boss |
| Frostpeak | Frost Sprite | Swift | 60-66 | 1400 | 5s escape |
| Frostpeak | Snow Prowler | Aggressive | 62-68 | 1600 | Attacks |
| Frostpeak | Ice Wraith | Regenerating | 65-72 | 1900 | 5% HP/s |
| Frostpeak | Frozen Giant | Armored | 68-75 | 2500 | 45 armor |
| Frostpeak | **Glacielle** | Aggr+Regen | 75 | 50000 | Boss |
| Voidrift | Void Walker | Shielded | 75-84 | 3000 | 40% shield |
| Voidrift | Chaos Imp | Swift | 78-88 | 2800 | 4s escape |
| Voidrift | Reality Bender | Aggressive | 82-93 | 4000 | Attacks |
| Voidrift | Eldritch Horror | Armor+Regen | 88-100 | 5500 | Dual type |
| Voidrift | **Xal'theron** | Triple | 100 | 150000 | Final Boss |

---

## Monster Type Constants

```javascript
const MONSTER_TYPE_CONSTANTS = {
  // Swift type
  SWIFT_DEFAULT_TIMER: 8000,          // 8 seconds
  SWIFT_MIN_TIMER: 4000,              // 4 seconds (Void)
  SWIFT_DEFAULT_ESCAPE_DAMAGE: 0.05,  // 5% max HP
  SWIFT_MAX_ESCAPE_DAMAGE: 0.15,      // 15% max HP (Void)

  // Aggressive type
  AGGRESSIVE_ATTACK_DAMAGE: 0.10,     // 10% max HP
  AGGRESSIVE_MIN_SAFE_TIME: 1800,     // 1.8 seconds
  AGGRESSIVE_MAX_SAFE_TIME: 5000,     // 5 seconds

  // Regenerating type
  REGEN_MIN_RATE: 0.02,               // 2% per second
  REGEN_MAX_RATE: 0.05,               // 5% per second

  // Armored type
  ARMOR_MIN_VALUE: 15,
  ARMOR_MAX_VALUE: 50,

  // Shielded type
  SHIELD_DEFAULT_PERCENT: 0.30,       // 30% max HP
  SHIELD_DAMAGE_REDUCTION: 0.50       // 50% reduction
};
```

---

*References: monster.schema.md, zone.schema.md, item.schema.md, combat.system.md*
