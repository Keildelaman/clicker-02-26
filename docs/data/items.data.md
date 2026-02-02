# Item Data

> Complete definitions for all weapons and accessories.
> Schema: `schemas/item.schema.md`

---

## Pricing Reference

| Zone | Common | Uncommon | Rare | Epic | Legendary |
|------|--------|----------|------|------|-----------|
| Whisperwood | 50 | 125 | 300 | 750 | 2,500 |
| Dustwind | 200 | 500 | 1,200 | 3,000 | 10,000 |
| Shadowmire | 500 | 1,250 | 3,000 | 7,500 | 25,000 |
| Ironhold | 1,500 | 3,750 | 9,000 | 22,500 | 75,000 |
| Emberfell | 4,000 | 10,000 | 24,000 | 60,000 | 200,000 |
| Frostpeak | 10,000 | 25,000 | 60,000 | 150,000 | 500,000 |
| Voidrift | 25,000 | 62,500 | 150,000 | 375,000 | 1,250,000 |

---

## Zone 1: Whisperwood Glen

### Weapons

#### Rusty Sword (Common)
```javascript
{
  id: "weapon_whisperwood_common_01",
  name: "Rusty Sword",
  description: "A weathered blade found in the forest. It's seen better days, but it's better than nothing.",
  type: "weapon",
  rarity: "common",
  zone: "whisperwood",
  requiredLevel: 1,
  stats: {
    attack: 4
  },
  buyPrice: 50,
  sellPrice: 12,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🗡️"
}
```

#### Wooden Club (Common)
```javascript
{
  id: "weapon_whisperwood_common_02",
  name: "Wooden Club",
  description: "A sturdy branch shaped into a crude weapon. Simple but effective against forest creatures.",
  type: "weapon",
  rarity: "common",
  zone: "whisperwood",
  requiredLevel: 3,
  stats: {
    attack: 6
  },
  buyPrice: 50,
  sellPrice: 12,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🪵"
}
```

#### Hunter's Blade (Uncommon)
```javascript
{
  id: "weapon_whisperwood_uncommon_01",
  name: "Hunter's Blade",
  description: "A well-crafted hunting knife. The previous owner carved notches for each kill.",
  type: "weapon",
  rarity: "uncommon",
  zone: "whisperwood",
  requiredLevel: 5,
  stats: {
    attack: 8,
    critChance: 0.02
  },
  buyPrice: 125,
  sellPrice: 31,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🔪"
}
```

#### Mossback's Branch (Rare) - Boss Drop
```javascript
{
  id: "weapon_whisperwood_rare_01",
  name: "Mossback's Branch",
  description: "A branch torn from the ancient treant. It pulses with nature magic and seems almost alive.",
  type: "weapon",
  rarity: "rare",
  zone: "whisperwood",
  requiredLevel: 8,
  stats: {
    attack: 12,
    critChance: 0.03
  },
  buyPrice: 300,
  sellPrice: 75,
  shopAvailable: false,
  dropOnly: true,
  emoji: "🌿"
}
```

### Accessories

#### Lucky Pebble (Common)
```javascript
{
  id: "accessory_whisperwood_common_01",
  name: "Lucky Pebble",
  description: "A smooth stone that feels warm in your pocket. Probably just superstition... probably.",
  type: "accessory",
  rarity: "common",
  zone: "whisperwood",
  requiredLevel: 1,
  stats: {
    goldFind: 0.05
  },
  buyPrice: 50,
  sellPrice: 12,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🪨"
}
```

#### Rabbit's Foot (Uncommon)
```javascript
{
  id: "accessory_whisperwood_uncommon_01",
  name: "Rabbit's Foot",
  description: "The previous owner wasn't so lucky, but you might be. Increases fortune slightly.",
  type: "accessory",
  rarity: "uncommon",
  zone: "whisperwood",
  requiredLevel: 4,
  stats: {
    goldFind: 0.08,
    critChance: 0.02
  },
  buyPrice: 125,
  sellPrice: 31,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🐾"
}
```

---

## Zone 2: Dustwind Plains

### Weapons

#### Bandit's Dagger (Common)
```javascript
{
  id: "weapon_dustwind_common_01",
  name: "Bandit's Dagger",
  description: "A quick blade favored by the plains bandits. Good for surprise attacks.",
  type: "weapon",
  rarity: "common",
  zone: "dustwind",
  requiredLevel: 10,
  stats: {
    attack: 12
  },
  buyPrice: 200,
  sellPrice: 50,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🗡️"
}
```

#### Plains Machete (Common)
```javascript
{
  id: "weapon_dustwind_common_02",
  name: "Plains Machete",
  description: "A broad blade used for clearing brush... and enemies.",
  type: "weapon",
  rarity: "common",
  zone: "dustwind",
  requiredLevel: 12,
  stats: {
    attack: 16
  },
  buyPrice: 200,
  sellPrice: 50,
  shopAvailable: true,
  dropOnly: false,
  emoji: "⚔️"
}
```

#### Windcutter (Uncommon)
```javascript
{
  id: "weapon_dustwind_uncommon_01",
  name: "Windcutter",
  description: "A curved blade that seems to whistle through the air. Cuts cleaner than it should.",
  type: "weapon",
  rarity: "uncommon",
  zone: "dustwind",
  requiredLevel: 15,
  stats: {
    attack: 22,
    critChance: 0.03
  },
  buyPrice: 500,
  sellPrice: 125,
  shopAvailable: true,
  dropOnly: false,
  emoji: "💨"
}
```

#### Redfang's Fang (Rare) - Boss Drop
```javascript
{
  id: "weapon_dustwind_rare_01",
  name: "Redfang's Fang",
  description: "The crimson blade of the bandit king himself. Still stained with the blood of his victims.",
  type: "weapon",
  rarity: "rare",
  zone: "dustwind",
  requiredLevel: 18,
  stats: {
    attack: 32,
    critChance: 0.04,
    critDamage: 0.2
  },
  buyPrice: 1200,
  sellPrice: 300,
  shopAvailable: false,
  dropOnly: true,
  emoji: "🔴"
}
```

### Accessories

#### Dustwind Charm (Common)
```javascript
{
  id: "accessory_dustwind_common_01",
  name: "Dustwind Charm",
  description: "A trinket that locals believe wards off bad luck on the plains.",
  type: "accessory",
  rarity: "common",
  zone: "dustwind",
  requiredLevel: 10,
  stats: {
    goldFind: 0.08
  },
  buyPrice: 200,
  sellPrice: 50,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🎪"
}
```

#### Scout's Spyglass (Uncommon)
```javascript
{
  id: "accessory_dustwind_uncommon_01",
  name: "Scout's Spyglass",
  description: "Helps you spot valuable loot from afar. Also useful for avoiding trouble.",
  type: "accessory",
  rarity: "uncommon",
  zone: "dustwind",
  requiredLevel: 13,
  stats: {
    goldFind: 0.12,
    xpBonus: 0.05
  },
  buyPrice: 500,
  sellPrice: 125,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🔭"
}
```

---

## Zone 3: Shadowmire Swamp

### Weapons

#### Bog Iron Blade (Common)
```javascript
{
  id: "weapon_shadowmire_common_01",
  name: "Bog Iron Blade",
  description: "Forged from iron pulled from the swamp. Has a dark, oily sheen.",
  type: "weapon",
  rarity: "common",
  zone: "shadowmire",
  requiredLevel: 20,
  stats: {
    attack: 28
  },
  buyPrice: 500,
  sellPrice: 125,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🗡️"
}
```

#### Cursed Cleaver (Common)
```javascript
{
  id: "weapon_shadowmire_common_02",
  name: "Cursed Cleaver",
  description: "A heavy blade that whispers dark thoughts. The curse is weak, but present.",
  type: "weapon",
  rarity: "common",
  zone: "shadowmire",
  requiredLevel: 23,
  stats: {
    attack: 36
  },
  buyPrice: 500,
  sellPrice: 125,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🪓"
}
```

#### Hexblade (Uncommon)
```javascript
{
  id: "weapon_shadowmire_uncommon_01",
  name: "Hexblade",
  description: "A weapon enchanted by swamp witches. Glows faintly green in darkness.",
  type: "weapon",
  rarity: "uncommon",
  zone: "shadowmire",
  requiredLevel: 25,
  stats: {
    attack: 50,
    critChance: 0.04
  },
  buyPrice: 1250,
  sellPrice: 312,
  shopAvailable: true,
  dropOnly: false,
  emoji: "💚"
}
```

#### Mire Mother's Claw (Rare) - Boss Drop
```javascript
{
  id: "weapon_shadowmire_rare_01",
  name: "Mire Mother's Claw",
  description: "A talon from the swamp's dark queen. It drips with eternal poison.",
  type: "weapon",
  rarity: "rare",
  zone: "shadowmire",
  requiredLevel: 28,
  stats: {
    attack: 70,
    critChance: 0.05,
    critDamage: 0.3
  },
  buyPrice: 3000,
  sellPrice: 750,
  shopAvailable: false,
  dropOnly: true,
  emoji: "🦴"
}
```

### Accessories

#### Wisp Lantern (Common)
```javascript
{
  id: "accessory_shadowmire_common_01",
  name: "Wisp Lantern",
  description: "Contains a captured will-o-wisp. Its light reveals hidden treasures.",
  type: "accessory",
  rarity: "common",
  zone: "shadowmire",
  requiredLevel: 20,
  stats: {
    goldFind: 0.10
  },
  buyPrice: 500,
  sellPrice: 125,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🏮"
}
```

#### Hag's Eye (Uncommon)
```javascript
{
  id: "accessory_shadowmire_uncommon_01",
  name: "Hag's Eye",
  description: "A preserved eye that still seems to watch. Grants insight into weakness.",
  type: "accessory",
  rarity: "uncommon",
  zone: "shadowmire",
  requiredLevel: 24,
  stats: {
    critChance: 0.05,
    xpBonus: 0.08
  },
  buyPrice: 1250,
  sellPrice: 312,
  shopAvailable: true,
  dropOnly: false,
  emoji: "👁️"
}
```

---

## Zone 4: Ironhold Peaks

### Weapons

#### Dwarven Hand Axe (Common)
```javascript
{
  id: "weapon_ironhold_common_01",
  name: "Dwarven Hand Axe",
  description: "A sturdy axe of dwarven make. Simple but reliable craftsmanship.",
  type: "weapon",
  rarity: "common",
  zone: "ironhold",
  requiredLevel: 30,
  stats: {
    attack: 55
  },
  buyPrice: 1500,
  sellPrice: 375,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🪓"
}
```

#### Crystal Shard Blade (Common)
```javascript
{
  id: "weapon_ironhold_common_02",
  name: "Crystal Shard Blade",
  description: "A sword with crystal fragments embedded in the edge. Sparkles dangerously.",
  type: "weapon",
  rarity: "common",
  zone: "ironhold",
  requiredLevel: 35,
  stats: {
    attack: 72
  },
  buyPrice: 1500,
  sellPrice: 375,
  shopAvailable: true,
  dropOnly: false,
  emoji: "💎"
}
```

#### Runeforged Blade (Uncommon)
```javascript
{
  id: "weapon_ironhold_uncommon_01",
  name: "Runeforged Blade",
  description: "Ancient dwarven runes glow along its length. The enchantments still hold power.",
  type: "weapon",
  rarity: "uncommon",
  zone: "ironhold",
  requiredLevel: 38,
  stats: {
    attack: 100,
    critChance: 0.05,
    critDamage: 0.2
  },
  buyPrice: 3750,
  sellPrice: 937,
  shopAvailable: true,
  dropOnly: false,
  emoji: "⚔️"
}
```

#### Grimstone's Heart (Rare) - Boss Drop
```javascript
{
  id: "weapon_ironhold_rare_01",
  name: "Grimstone's Heart",
  description: "The crystalline core of the eternal guardian. Pulses with ancient power.",
  type: "weapon",
  rarity: "rare",
  zone: "ironhold",
  requiredLevel: 42,
  stats: {
    attack: 145,
    critChance: 0.06,
    critDamage: 0.4
  },
  buyPrice: 9000,
  sellPrice: 2250,
  shopAvailable: false,
  dropOnly: true,
  emoji: "💠"
}
```

### Accessories

#### Miner's Charm (Common)
```javascript
{
  id: "accessory_ironhold_common_01",
  name: "Miner's Charm",
  description: "A good luck charm carried by dwarven miners. Smells faintly of ale.",
  type: "accessory",
  rarity: "common",
  zone: "ironhold",
  requiredLevel: 30,
  stats: {
    goldFind: 0.12
  },
  buyPrice: 1500,
  sellPrice: 375,
  shopAvailable: true,
  dropOnly: false,
  emoji: "⛏️"
}
```

#### Gem-Studded Ring (Uncommon)
```javascript
{
  id: "accessory_ironhold_uncommon_01",
  name: "Gem-Studded Ring",
  description: "A ring set with small but valuable gems. Attracts wealth to its wearer.",
  type: "accessory",
  rarity: "uncommon",
  zone: "ironhold",
  requiredLevel: 35,
  stats: {
    goldFind: 0.15,
    critChance: 0.04
  },
  buyPrice: 3750,
  sellPrice: 937,
  shopAvailable: true,
  dropOnly: false,
  emoji: "💍"
}
```

---

## Zone 5: Emberfell Wastes

### Weapons

#### Obsidian Edge (Common)
```javascript
{
  id: "weapon_emberfell_common_01",
  name: "Obsidian Edge",
  description: "A blade of volcanic glass. Incredibly sharp but prone to chipping.",
  type: "weapon",
  rarity: "common",
  zone: "emberfell",
  requiredLevel: 45,
  stats: {
    attack: 110
  },
  buyPrice: 4000,
  sellPrice: 1000,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🖤"
}
```

#### Flamesteel Sword (Common)
```javascript
{
  id: "weapon_emberfell_common_02",
  name: "Flamesteel Sword",
  description: "Forged in volcanic heat, this blade never fully cools. Handle with care.",
  type: "weapon",
  rarity: "common",
  zone: "emberfell",
  requiredLevel: 50,
  stats: {
    attack: 145
  },
  buyPrice: 4000,
  sellPrice: 1000,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🔥"
}
```

#### Inferno Blade (Uncommon)
```javascript
{
  id: "weapon_emberfell_uncommon_01",
  name: "Inferno Blade",
  description: "Fire elementals fear this weapon. It burns with their stolen essence.",
  type: "weapon",
  rarity: "uncommon",
  zone: "emberfell",
  requiredLevel: 53,
  stats: {
    attack: 200,
    critChance: 0.06,
    critDamage: 0.3
  },
  buyPrice: 10000,
  sellPrice: 2500,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🌋"
}
```

#### Pyrax's Fury (Rare) - Boss Drop
```javascript
{
  id: "weapon_emberfell_rare_01",
  name: "Pyrax's Fury",
  description: "A blade forged from the Flamelord's own essence. Burns with eternal fire.",
  type: "weapon",
  rarity: "rare",
  zone: "emberfell",
  requiredLevel: 57,
  stats: {
    attack: 290,
    critChance: 0.07,
    critDamage: 0.5
  },
  buyPrice: 24000,
  sellPrice: 6000,
  shopAvailable: false,
  dropOnly: true,
  emoji: "☀️"
}
```

### Accessories

#### Ember Pendant (Common)
```javascript
{
  id: "accessory_emberfell_common_01",
  name: "Ember Pendant",
  description: "A gem that glows with inner fire. Warm to the touch, never hot.",
  type: "accessory",
  rarity: "common",
  zone: "emberfell",
  requiredLevel: 45,
  stats: {
    goldFind: 0.15
  },
  buyPrice: 4000,
  sellPrice: 1000,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🔶"
}
```

#### Phoenix Feather (Uncommon)
```javascript
{
  id: "accessory_emberfell_uncommon_01",
  name: "Phoenix Feather",
  description: "A feather from the legendary firebird. Brings fortune from the ashes.",
  type: "accessory",
  rarity: "uncommon",
  zone: "emberfell",
  requiredLevel: 50,
  stats: {
    goldFind: 0.18,
    xpBonus: 0.12
  },
  buyPrice: 10000,
  sellPrice: 2500,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🪶"
}
```

---

## Zone 6: Frostpeak Summit

### Weapons

#### Icicle Dagger (Common)
```javascript
{
  id: "weapon_frostpeak_common_01",
  name: "Icicle Dagger",
  description: "A blade of eternal ice. Never melts, never dulls, always cold.",
  type: "weapon",
  rarity: "common",
  zone: "frostpeak",
  requiredLevel: 60,
  stats: {
    attack: 220
  },
  buyPrice: 10000,
  sellPrice: 2500,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🧊"
}
```

#### Frostbite Axe (Common)
```javascript
{
  id: "weapon_frostpeak_common_02",
  name: "Frostbite Axe",
  description: "Its edge causes frostbite on contact. Even a scratch is dangerous.",
  type: "weapon",
  rarity: "common",
  zone: "frostpeak",
  requiredLevel: 65,
  stats: {
    attack: 290
  },
  buyPrice: 10000,
  sellPrice: 2500,
  shopAvailable: true,
  dropOnly: false,
  emoji: "❄️"
}
```

#### Glacial Greatsword (Uncommon)
```javascript
{
  id: "weapon_frostpeak_uncommon_01",
  name: "Glacial Greatsword",
  description: "A massive blade of blue ice. Each swing brings winter's wrath.",
  type: "weapon",
  rarity: "uncommon",
  zone: "frostpeak",
  requiredLevel: 68,
  stats: {
    attack: 400,
    critChance: 0.07,
    critDamage: 0.4
  },
  buyPrice: 25000,
  sellPrice: 6250,
  shopAvailable: true,
  dropOnly: false,
  emoji: "⚔️"
}
```

#### Glacielle's Kiss (Rare) - Boss Drop
```javascript
{
  id: "weapon_frostpeak_rare_01",
  name: "Glacielle's Kiss",
  description: "The frozen blade of the Winter Queen herself. Its touch is death.",
  type: "weapon",
  rarity: "rare",
  zone: "frostpeak",
  requiredLevel: 72,
  stats: {
    attack: 580,
    critChance: 0.08,
    critDamage: 0.6
  },
  buyPrice: 60000,
  sellPrice: 15000,
  shopAvailable: false,
  dropOnly: true,
  emoji: "💋"
}
```

### Accessories

#### Frozen Heart Gem (Common)
```javascript
{
  id: "accessory_frostpeak_common_01",
  name: "Frozen Heart Gem",
  description: "A gem that beats with cold energy. Numbs emotions but sharpens focus.",
  type: "accessory",
  rarity: "common",
  zone: "frostpeak",
  requiredLevel: 60,
  stats: {
    goldFind: 0.18
  },
  buyPrice: 10000,
  sellPrice: 2500,
  shopAvailable: true,
  dropOnly: false,
  emoji: "💙"
}
```

#### Aurora Pendant (Uncommon)
```javascript
{
  id: "accessory_frostpeak_uncommon_01",
  name: "Aurora Pendant",
  description: "Captures the northern lights within crystal. Radiates mysterious fortune.",
  type: "accessory",
  rarity: "uncommon",
  zone: "frostpeak",
  requiredLevel: 65,
  stats: {
    goldFind: 0.22,
    critChance: 0.06
  },
  buyPrice: 25000,
  sellPrice: 6250,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🌌"
}
```

---

## Zone 7: The Void Rift

### Weapons

#### Void Shard Blade (Common)
```javascript
{
  id: "weapon_voidrift_common_01",
  name: "Void Shard Blade",
  description: "A blade made from solidified void energy. Reality bends around its edge.",
  type: "weapon",
  rarity: "common",
  zone: "voidrift",
  requiredLevel: 75,
  stats: {
    attack: 450
  },
  buyPrice: 25000,
  sellPrice: 6250,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🌑"
}
```

#### Chaos Edge (Common)
```javascript
{
  id: "weapon_voidrift_common_02",
  name: "Chaos Edge",
  description: "Its form constantly shifts. You can never be sure where it will strike.",
  type: "weapon",
  rarity: "common",
  zone: "voidrift",
  requiredLevel: 82,
  stats: {
    attack: 590
  },
  buyPrice: 25000,
  sellPrice: 6250,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🌀"
}
```

#### Reality Render (Uncommon)
```javascript
{
  id: "weapon_voidrift_uncommon_01",
  name: "Reality Render",
  description: "This blade cuts through the fabric of existence itself. Handle with extreme caution.",
  type: "weapon",
  rarity: "uncommon",
  zone: "voidrift",
  requiredLevel: 85,
  stats: {
    attack: 820,
    critChance: 0.08,
    critDamage: 0.5
  },
  buyPrice: 62500,
  sellPrice: 15625,
  shopAvailable: true,
  dropOnly: false,
  emoji: "✂️"
}
```

#### Nightmare's Edge (Rare)
```javascript
{
  id: "weapon_voidrift_rare_01",
  name: "Nightmare's Edge",
  description: "Forged from the dreams of dying gods. Whispers secrets of destruction.",
  type: "weapon",
  rarity: "rare",
  zone: "voidrift",
  requiredLevel: 90,
  stats: {
    attack: 1150,
    critChance: 0.09,
    critDamage: 0.7
  },
  buyPrice: 150000,
  sellPrice: 37500,
  shopAvailable: false,
  dropOnly: true,
  emoji: "😱"
}
```

#### Abyssal Devastator (Epic)
```javascript
{
  id: "weapon_voidrift_epic_01",
  name: "Abyssal Devastator",
  description: "A weapon that should not exist. It hungers for the end of all things.",
  type: "weapon",
  rarity: "epic",
  zone: "voidrift",
  requiredLevel: 95,
  stats: {
    attack: 1700,
    critChance: 0.10,
    critDamage: 0.9
  },
  buyPrice: 375000,
  sellPrice: 93750,
  shopAvailable: false,
  dropOnly: true,
  emoji: "⚫"
}
```

#### Xal'theron's Demise (Legendary) - Final Boss Drop
```javascript
{
  id: "weapon_voidrift_legendary_01",
  name: "Xal'theron's Demise",
  description: "The crystallized essence of the Void King's defeat. Contains the power of a dead god. You have saved Clickoria.",
  type: "weapon",
  rarity: "legendary",
  zone: "voidrift",
  requiredLevel: 100,
  stats: {
    attack: 2500,
    critChance: 0.12,
    critDamage: 1.0
  },
  buyPrice: 1250000,
  sellPrice: 312500,
  shopAvailable: false,
  dropOnly: true,
  emoji: "👑"
}
```

### Accessories

#### Void Fragment (Common)
```javascript
{
  id: "accessory_voidrift_common_01",
  name: "Void Fragment",
  description: "A piece of solidified nothing. Strangely valuable.",
  type: "accessory",
  rarity: "common",
  zone: "voidrift",
  requiredLevel: 75,
  stats: {
    goldFind: 0.22
  },
  buyPrice: 25000,
  sellPrice: 6250,
  shopAvailable: true,
  dropOnly: false,
  emoji: "🔮"
}
```

#### Chaos Crystal (Uncommon)
```javascript
{
  id: "accessory_voidrift_uncommon_01",
  name: "Chaos Crystal",
  description: "Order and chaos wage eternal war within this gem. Both sides grant power.",
  type: "accessory",
  rarity: "uncommon",
  zone: "voidrift",
  requiredLevel: 82,
  stats: {
    goldFind: 0.25,
    critChance: 0.07
  },
  buyPrice: 62500,
  sellPrice: 15625,
  shopAvailable: true,
  dropOnly: false,
  emoji: "💎"
}
```

#### Reality Anchor (Rare)
```javascript
{
  id: "accessory_voidrift_rare_01",
  name: "Reality Anchor",
  description: "Keeps you grounded in existence. Critical for surviving the Void Rift.",
  type: "accessory",
  rarity: "rare",
  zone: "voidrift",
  requiredLevel: 88,
  stats: {
    goldFind: 0.30,
    xpBonus: 0.20,
    critChance: 0.05
  },
  buyPrice: 150000,
  sellPrice: 37500,
  shopAvailable: false,
  dropOnly: true,
  emoji: "⚓"
}
```

---

## Item Summary Table

| Zone | Item | Type | Rarity | Level | Attack | Special |
|------|------|------|--------|-------|--------|---------|
| Whisperwood | Rusty Sword | Weapon | Common | 1 | 4 | - |
| Whisperwood | Wooden Club | Weapon | Common | 3 | 6 | - |
| Whisperwood | Hunter's Blade | Weapon | Uncommon | 5 | 8 | +2% crit |
| Whisperwood | Mossback's Branch | Weapon | Rare | 8 | 12 | +3% crit |
| ... | ... | ... | ... | ... | ... | ... |
| Voidrift | Xal'theron's Demise | Weapon | Legendary | 100 | 2500 | +12% crit, +100% crit dmg |

---

*References: item.schema.md, zone.schema.md, economy.system.md*
