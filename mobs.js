
import Chance from 'chance';
import { Player } from './player.js';
const chance1 = new Chance();
//make roll initiative function in main file

export class monster {/*12always hostile 0 inverse */
    constructor(name = '', hitDie = 2, ac = 10, aggro, morale, weapon, dmgDie, rarity) {
        this.name = name;
        this.hitDie = hitDie;
        this.ac = ac;
        this.morale = morale;
        this.weapon = weapon;
        this.dmgDie = dmgDie;
        this.aggro = aggro;
        this.rarity = rarity;
        this.hp = chance1.rpg(`${this.hitDie}d6`, { sum: true });
    }
    // attack(target=new(Player)){
    //     if (this.#rollToHit() >= target.ac) {
    //         target.decreaseHP(this.#rollDamage())
    //     }
    // }
    rollDamage() {
        // later change to bring consistancy simaler to player class
        return chance1.rpg(`1d${this.dmgDie}`, { sum: true })
    }
    rollToHit() {
        return chance1.rpg(`1d20`, { sum: true }) + chance1.rpg(`${this.hitDie}d6`, { sum: true })
    }

}
export function copyMonster(monsterToCopy) {
    return new monster(
        monsterToCopy.name,
        monsterToCopy.hitDie,
        monsterToCopy.AC,
        monsterToCopy.aggro,
        monsterToCopy.morale,
        monsterToCopy.weapon,
        monsterToCopy.dmgDie,
        monsterToCopy.rarity
    )
}


