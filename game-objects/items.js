
//
// Weapon objects
//
//



class weapon {
    constructor({name, dmgDie, dmgType, rarity}) {
        this.name = name;
        this.dmgDie = dmgDie;
        this.dmgType = dmgType;
        this.rarity = rarity;
        this.enchant = 0;
    }
}




export const WEAPONS = Object.freeze({
    SPEAR: 'SPEAR',
    DAGGER: 'DAGGER',
    SCIMITAR: 'SCIMITAR',
    SWORD: 'SWORD',
    BATTLE_AXE: 'BATTLE_AXE',
    GREAT_SWORD: 'GREAT_SWORD',
    BARE_HANDS: 'BARE_HANDS',

})
let WEAPONmap = {}
//dmg dice d(amount)
WEAPONmap[WEAPONS.SPEAR] = '1d6'
WEAPONmap[WEAPONS.SCIMITAR] = '2d4'
WEAPONmap[WEAPONS.DAGGER] = '1d4'
WEAPONmap[WEAPONS.SWORD] = '1d8'
WEAPONmap[WEAPONS.BATTLE_AXE] = '1d10'
WEAPONmap[WEAPONS.GREAT_SWORD] = '2d6'
WEAPONmap[WEAPONS.BARE_HANDS] = '1d2' //coin flip
export { WEAPONmap };

export const ARMOUR = Object.freeze({
    LOIN_CLOTH: 'LOIN_CLOTH',
    OXFORD_BLUE_ROBE: 'OXFORD_BLUE_ROBE',
    CAMBRIDGE_BLUE_ROBE: 'CAMBRIDGE_BLUE_ROBE',
    LABCOAT: 'LABCOAT',
    PLATE: 'PLATE',
    GANDALFS_WHITE_ROBES: 'GANDALFS_WHITE_ROBES',
    CHAINMAIL: 'CHAINMAIL',
})

let ARMOURmap = {}
ARMOURmap[ARMOUR.LOIN_CLOTH] = 10
ARMOURmap[ARMOUR.OXFORD_BLUE_ROBE] = 12
ARMOURmap[ARMOUR.CAMBRIDGE_BLUE_ROBE] = 14
ARMOURmap[ARMOUR.LABCOAT] = 16
ARMOURmap[ARMOUR.PLATE] = 18
ARMOURmap[ARMOUR.GANDALFS_WHITE_ROBES] = 20
ARMOURmap[ARMOUR.CHAINMAIL] = 22


export { ARMOURmap };
