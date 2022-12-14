//var seedrandom = require('seedrandom');
import {
	chance1,
	chance2
} from "./random_nums.js";
import {
	ARMOUR,
	ARMOURmap,
	pickArmour,
	pickScroll,
	pickWeapon,
	weapons
} from "./data.js";
import {
	combatMetrics,
	GlobalMetrics
} from "./metrics.js";
//diff object for map generation
chance1.weighted(['a', 'b', 'c', 'd'], [1, 2, 3, 4])
// chance.rpg('#d#')
// chance.rpg('#d#', {sum: true})
//
export const playerState = Object.freeze({
	INIT: "INIT",
	TOWN: "TOWN",
	COMBAT: "COMBAT",
	ALTAR: "ALTAR",
	SHOP: "SHOP",
	INN: "INN",
	DUNGEON_ROOM: "DUNGEON_ROOM",
	TREASURE_ROOM: "TREASURE_ROOM",
});
export class Player {
	constructor(name = 'apples') {
		this.level = 1;
		this.levelPoints = 1;
		this.xp = 0
		this.nextLvlxp = 200
		this.name = name;
		//damage
		this.str = this.rollStat();
		//hp modifier
		//tohit
		this.dex = this.rollStat();
		this.cha = this.rollStat();
		this.int = this.rollStat();
		let initial = chance1.rpg('2d6', {
			sum: true
		}) + this.str + 6 //+ 200
		this.hp = initial
		this.hpMax = initial
		this.slots = {
			weapon: true,
			shield: false,
			head: false,
			armor: true,
			ring: false
		}
		//this.items = Array(5).fill(0)
		this.weapon = /*weapons.newtons_apple*/ pickWeapon()
		this.weaponName = this.weapon.name
		this.weaponCooldown = 0
		this.wBonus = this.weapon.dmgType
		// this.weapon = WEAPONmap[this.weaponName]
		//change weapon later to be similar to monster class
		this.armourName = pickArmour()
		this.armour = ARMOURmap[this.armourName]
		this.armourMagic = 0;
		//redundant
		this.ac = this.armour ? this.armour + this.armourMagic: 10
		//distance travelled
		this.depth = 1;
		//depth used for events
		this.actualDepth = 1;
		this.gold = 9990;
		this.oil = 5;
		// later when oil runs out Disadvantage combat, select specail darkness enemies and make escaping harder
		this.canSee=true
		//later include identify potion mechanic
		this.potions = 20;
		this.scrolls = 300;
		//metrics to keep track of progression and combat stats
		//temp metric will be merged then cleared at end of every event
		//this.globalMetrics = GlobalMetrics()
		//encounterData
		this.state = playerState.INIT
		//add support for nonhostile
		this.encounterData = new combatMetrics()
		//multiple combats dont have seperate holder
		this.currentEvent = null
		//this.multipleEncounters = false
		this.noLoot = false
	}
	makeAttack(){
		//stub
		//later will be used instead of current system to cleanly handle damage types once i redo them
		//return [String, Integer]
	}
	rollStat() {
		return skillBonus(chance1.rpg('3d6', {
			sum: true
		}))
	}
	enchantArmour() {
		this.armourMagic += 1
		this.ac += 1
	}
	curseArmour() {
		this.armourMagic -= 1
		this.ac -= 1
	}
	//Weapon object
	changeWeapon(weapon) {
		this.weapon = weapon
		this.weaponName = weapon.name
		this.wBonus = this.weapon.dmgType
		this.weaponCooldown = 0
	}
	//armour is string key
	changeArmour(armour) {
		this.armourName = armour
		this.armourMagic = 0;
		this.armour = ARMOURmap[armour]
		this.ac = this.armour
	}
	//not max
	increaseHP(amount) {
		if (amount + this.hp > this.hpMax) {
			this.hp = this.hpMax
		} else {
			this.hp += amount
		}
	}
	decreaseHP(amount) {
		this.hp -= amount
	}
	increaseMAXHP(amount) {
		this.hpMax += amount
		this.hp += amount
	}
	rollReaction() {
		return chance2.rpg('2d6', {
			sum: true
		}) + this.cha
	}
	rollDamage() {
		let damage = this.str + chance2.rpg(this.weapon.dmgDie, {
			sum: true
		}) + this.weapon.enchant
		damage = damage < 1 ? 1 : damage
		return damage
	}
	rollToHit() {
		let bonus = this.level > 4 ? 4 : this.level
		bonus += this.dex
		bonus += this.weapon.enchant
		return [chance2.rpg('1d20', {
			sum: true
		}), bonus]
		//return [20,bonus]
	}
	rollInitiative() {
		return this.dex + chance2.rpg('1d20', {
			sum: true
		})
	}
	//`${this.weapon} + ${this.base-damage} :` +
	rollSkillCheck(skill = 0) {
		return chance2.rpg('1d20', {
			sum: true
		}) + skillBonus(skill)
	}
	rollNewPlayer() {
		return new Player(this.name)
	}
	useScroll(params = {}) {
		let scrollPick = pickScroll()
		//console.log(scrollPick)
		return [scrollPick.use(this, params),scrollPick.targetmonster,scrollPick.name]
	}

	levelUp(){
		if (this.level<=21&&this.xp>=this.nextLvlxp){
			this.level += 1
			this.levelPoints += 1
			this.nextLvlxp= XPmap[this.level+1]
		}
	}
}



class inventory {
	constructor(items = []) {
		this.thing = items
	}
}

function skillBonus(skill = 10) {
	return skill % 2 === 0 ? (skill - 10) / 2 : skill > 0 ? (skill - 1 - 10) / 2 : (skill + 1 - 10)
}

function getRandom(max) {
	return Math.floor(Math.random() * max);
}
//dice function d for readability as dice are often short-handed as d6 d4 d8
// function d(n) {
//     return 1 + getRandom(n)
// }
export const XPmap = Object.freeze({
	1: 0,
	2: 200,
	3: 600,
	4: 1200,
	5: 2000,
	6: 3000,
	7: 4000,
	8: 5000,
	9: 6000,
	10: 7000,
	11: 8000,
	12: 9000,
	13: 10000,
	14: 11000,
	15: 12000,
	16: 13000,
	17: 14000,
	18: 15000,
	19: 16000,
	20: 17000,
	21: 69420,
})