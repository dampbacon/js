#!/usr/bin/env node

'use strict';

import blessedpkg from 'blessed';
import chalk from 'chalk';
import gradient from 'gradient-string';
import {
	game_event,
	game_event_gain_item
} from './game-objects/game_events.js';
import {
	Player,
	playerState
} from './game-objects/player.js';
import './blessed/patches.cjs';
import pkg from 'iconv-lite';
import smallGrad from 'tinygradient';
import lodashC from 'lodash.compact';
import {
	copyMonster,
	monster
} from './game-objects/mobs.js';
import {
	chance2,
	chance4,
	resetRandoms
} from './game-objects/random_nums.js';
import {
	buttonsContainer,
	createStatsBox,
	ImageScreenTerm,
	InventoryBox,
	logs,
	program,
	screen,
	stats
} from "./ui.js";
import {
	drawBanner,
	fitLines,
	fitLinesStr,
	gradient_scanlines,
	rollLog,
	slowLineWrite,
	writeArmour,
	writeGold,
	writeOil,
	writePotion,
	writeScroll
} from "./writeMethods.js";
import XTermNew from "./blessed-xterm/blessed-xterm.js";
import {
	ARMOUR,
	ARMOURmap,
	armourPicker,
	ArmourRarityColour,
	DMG_COLOUR,
	DMG_TYPE,
	dynamicBox,
	enemiesArt, escDownByNum, escLeftByNum, escRightByNum, escUpByNum,
	makeRoomText,
	miscColours,
	monsters,
	pickEnemy,
	pickWeapon,
	rarityByWeight,
	weapons,
} from './game-objects/data.js';
import {
	combatMetrics
} from './game-objects/metrics.js';
import wrap from 'word-wrap';
import { weapon } from './game-objects/items.js';
//const cfonts = require('cfonts');

import cfonts from 'cfonts';

chalk.level = 2;
const {
	tinygradient
} = smallGrad;
const {
	iconv
} = pkg;
const {
	compact
} = lodashC;
const {
	blessed
} = blessedpkg
let death = false;
let buttonsArray = [];
let story = {}
let combatButtonsMap = {}
let thePlayer = new Player("name")
let box = createStatsBox()
// test content
let tempMonster = monsters.gobo
const rainbowVoil = ['ee82ee', '4b0082', '0000ff', '008000', 'ffff00', 'ffa500', 'ff0000', ]
const rainbowWithBlue = ['93CAED', 'ee82ee', '4b0082', '0000ff', '008000', 'ffff00', 'ffa500', 'ff0000']
//test string
const lorem =
	`Lorem ipsum dolor sit amet,
consectetur adipiscing elit. 
Morbi varius ut augue ac sagittis. 
Vivamus lectus lacus, commodo eu ligula pulvinar, 
tincidunt congue sapien. 
Morbi fringilla sollicitudin ante eget accumsan. 
Aliquam diam felis, 
posuere sit amet felis id, 
condimentum rutrum dolor. 
Donec semper sagittis condimentum. 
Mauris vitae pellentesque tellus. 
Integer velit neque, 
fermentum vel tempus non, 
pulvinar id tellus.`
const pgrad = ['#3f51b1', '#5a55ae', '#7b5fac', '#8f6aae', '#a86aa4', '#cc6b8e', '#f18271', '#f3a469', '#f7c978'].reverse()
const mountain = `[37m[40m                        [97m[40m░░[37m[40m                            [m
[37m[40m                  [97m[40m▒░[37m[40m   [97m[40m░██▓▓[90m[40m░░[37m[40m                        [m
[37m[40m                 [97m[40m█▓░░[37m[40m [97m[40m░▓█████▓▒░░[37m[40m [90m[40m░[37m[40m                   [m
[37m[40m               [97m[40m▓▓▒░░▓███▒█▒▒███▓▒░[90m[40m░[37m[40m  [90m[40m░[37m[40m                [m
[37m[40m             [97m[40m░▓░░[37m[40m [90m[40m░[97m[40m█▒█[90m[40m░[97m[40m░▒█[90m[40m░░▒░[97m[40m░█▓▒[90m[40m░[37m[40m  [90m[40m░░[37m[40m               [m
[37m[40m           [97m[40m░▒▒░[37m[40m  [90m[40m░[97m[40m██[37m[40m▒░ [97m[40m░[90m[40m░░[37m[40m  [97m[40m▓▓▒[37m[40m [97m[40m░▓▓▒[37m[40m  [90m[40m░[37m[40m  [97m[40m▒▓[37m[40m           [m
[37m[40m         [97m[40m░▒▒[37m[40m   [97m[40m░▓[90m[40m▓[37m[40m▒░░ [90m[40m░[37m[40m▒[90m[40m░[37m[40m   [90m[40m░▒[97m[40m▓▒░[37m[40m  [97m[40m▓[96m[40m▓░[90m[40m▒[97m[40m▒▒▒▒▓▒[37m[40m         [m
[37m[40m   [97m[40m░▒▓▓▓▒▒[37m[40m   [97m[40m░▓█[37m[40m▓░░ ░▒░ [97m[40m█▓[37m[40m   [90m[40m░▒▒[97m[40m▓[90m[40m░[96m[40m▒███[97m[40m▓░[37m[40m    [97m[40m▓▓▒[37m[40m       [m
[37m[40m  [97m[40m▒▓░[37m[40m [97m[40m░█▓▒░[37m[40m [97m[40m░█[90m[40m▒[37m[40m░░ ▒▒[90m[40m░[37m[40m  ▓▓[97m[40m▒▒░[37m[40m  [90m[40m░░[97m[40m▓[96m[40m▓▓██[90m[40m█▓░[37m[40m     [90m[40m░[97m[40m▓▒[37m[40m      [m
[37m[40m [97m[40m▓▓░▒▒[90m[40m░[37m[40m  [97m[40m▒██▓[90m[40m░[37m[40m░░░▒[90m[40m░[37m[40m  [97m[40m░▒[37m[40m█▒░ [97m[40m▒▒[37m[40m  [96m[40m░▓███░[37m[40m [90m[40m▓█[37m[40m      [90m[40m░[97m[40m▓▓[37m[40m     [m
[37m[40m [97m[40m░[37m[40m  [97m[40m░▒▒▒[90m[40m░[37m[40m  [90m[40m░[97m[40m▓▓▓▓[90m[40m░░[37m[40m  [97m[40m▒▒[90m[40m░░░░█[37m[40m [97m[40m▒▒[37m[40m [96m[40m░░█████░[90m[40m██▓░[37m[40m     [97m[40m▓▒[37m[40m    [m
[37m[40m       [97m[40m▓▒▒░[90m[40m░[37m[40m   [97m[40m▓▒[90m[40m░[37m[40m ░[97m[40m▒[90m[40m░░[37m[40m  ▓[90m[40m░░[37m[40m [97m[40m░▒▒[37m[40m [96m[40m▒[37m[40m   [96m[40m▓█▒[37m[40m [90m[40m▒▓▓[37m[40m     [97m[40m▒▒▒[37m[40m  [m
[37m[40m      [90m[40m░░[37m[40m [97m[40m░░[90m[40m░[37m[40m     [90m[40m░[37m[40m █[90m[40m░▓[37m[40m    ░[90m[40m░░[37m[40m  [97m[40m▒░[37m[40m    [96m[40m░██░[37m[40m  [90m[40m▒▓░[37m[40m     [97m[40m▒▒[90m[40m░[m
[37m[40m     [90m[40m░░[37m[40m    [90m[40m░░▒░░░░[37m[40m ▒[90m[40m░[37m[40m       [90m[40m█[37m[40m░        [96m[40m█░[37m[40m    [90m[40m░░[37m[40m       [90m[40m░[m
[37m[40m     [90m[40m░[37m[40m         [90m[40m░[37m[40m [33m[40m░░░░░░[37m[40m▒[33m[40m░░░░[32m[40m░░▒▒▒░[37m[40m [33m[40m░░[94m[40m▓▓▓[33m[40m░▒▒▒▒▒▒▒▒▒▒░░░[m
[37m[40m [33m[40m░░░▒▒▒▒▒▒▒[32m[40m▓▓▓▓▒▒▒▒[33m[40m░░[32m[40m▒▒[37m[40m▓[32m[40m▒▓████▒[33m[40m░▒▒▒[34m[40m▓[94m[40m█▓[33m[40m░░░░[37m[40m            [m
[37m[40m    [32m[40m░░░░░░▒▒░░▒▓▓▓▒▒▒▒[37m[40m▓░[32m[40m▓░[37m[40m  [32m[40m░▒▓▓▒▒▒[34m[40m▒▓[32m[40m▒▒░░░░░░░░░[37m[40m      [m
[37m[40m        [32m[40m░▒▒█▓▒▒░░░▒▒██[37m[40m░[32m[40m▓▒░[37m[40m    [32m[40m░░░[37m[40m   [34m[40m░░▒▒▓▒[37m[40m            [m
[37m[40m   [32m[40m▒▒▒░░▒▒▓█████▓████[37m[40m▓▓[32m[40m▒░[37m[40m [32m[40m░▒▒▒▒░░░░░░░[34m[40m▒░▒[32m[40m▒[37m[40m            [m
[32m[40m▒▒[33m[40m░░░[32m[40m▓█▓▒▒░[37m[40m [33m[40m░░[32m[40m░██░[37m[40m ░▓      [32m[40m░▒░░░░░▒▒[34m[40m▓▓▓[37m[40m  [32m[40m▒▓░[37m[40m          [m
[37m[40m  [37m[43m▄▄▄[37m[40m▄[33m[40m░░░[32m[40m▒▒░[37m[43m▄[33m[40m▀[37m[40m    ░█░    [94m[40m▒▒▒[34m[40m▓[94m[40m███▓▓▒[34m[40m▒▒[32m[40m░▓▓▒░[37m[40m            [m
[37m[40m [33m[40m░░░░[37m[40m▒[33m[40m███[37m[40m   ▒     █▀   [94m[40m░█▓▓████▒███▓▒[37m[40m [32m[40m░░░░▓[37m[40m           [m
[37m[40m [33m[40m████[37m[40m▀▀▒▄▄▄▒▒   ▄▀▀   [94m[40m▒░█▒▒█▒▓███▒░█▒[37m[40m     [32m[40m▓[37m[40m           [m
[37m[40m [33m[40m▀▀[37m[43m▄▄[37m[40m▄▄▒    ▀▀▀▀▀     [94m[40m█▓█▒█▒[37m[40m                          [m
[37m[40m                     [94m[40m░▓▒░░[37m[40m                            [m
[37m[40m                                                      [m
`
const dice = `[37m[40m          [97m[40m▄▄▄[37m[40m          [m
[37m[40m      [97m[40m▄▄▀▀[37m[40m █ [97m[40m▀▀▄▄[37m[40m      [m
[37m[40m  [97m[40m▄▄▀▀[90m[40m▄▄▄▄[90m[47m▀[90m[40m▀[90m[47m▀[90m[40m▄▄[37m[40m  [97m[40m▀▀▄▄[37m[40m  [m
[37m[40m [90m[40m▄[97m[40m█[90m[40m▀▀▀[37m[40m   ▄▀ ▀▄ [90m[40m▀▀▀▄▄[97m[40m█[90m[40m▄[37m[40m [m
[37m[40m [90m[40m█[97m[40m▀▄[37m[40m   ▄[91m[47m▄[91m[40m▄▄[37m[40m [91m[40m▄▄[91m[47m▄[37m[40m▄   [97m[40m▄▀[90m[40m█[37m[40m [m
[37m[40m [90m[40m█[37m[40m [97m[40m█[37m[40m  ▄▀[91m[40m▄▄█[37m[40m [91m[40m█[37m[40m [91m[40m█[37m[40m▀▄  [97m[40m█[37m[40m [90m[40m█[37m[40m [m
[37m[40m [90m[40m█[37m[40m  [97m[40m█[37m[40m█  [91m[40m█▄▄[37m[40m [91m[40m█▄█[37m[40m  █[97m[40m█[37m[40m  [90m[40m█[37m[40m [m
[37m[40m [90m[40m█[37m[40m ▄[97m[40m▀[90m[47m▄[97m[40m▀▀▀▀[91m[47m▄▄▄[97m[40m▀▀▀▀[90m[47m▄[97m[40m▀[37m[40m▄ [90m[40m█[37m[40m [m
[37m[40m [90m[40m▀[90m[47m▄[37m[40m   [90m[40m▀▄[37m[40m  [91m[40m█▄█[37m[40m  [90m[40m▄▀[37m[40m   [90m[47m▄[90m[40m▀[37m[40m [m
[37m[40m   [90m[40m▀▀▄▄[37m[40m [90m[40m█[37m[40m [91m[40m█▄█[37m[40m [90m[40m█[37m[40m [90m[40m▄▄▀▀[37m[40m   [m
[37m[40m       [90m[40m▀▀█▄[37m[40m [90m[40m▄█▀▀[37m[40m       [m
[37m[40m           [90m[40m▀[37m[40m           [m
`
const bb = `    ${chalk.bold(`THE VILLAGE`)}
[37m[40m                                           [m
[37m[40m                   [33m[40m▒▒▒░░[37m[40m                   [m
[37m[40m                 [33m[40m▒▒▒▒░░░░░[37m[40m                 [m
[37m[40m                [33m[40m██▓▓▓▓▓▓▓██[37m[40m                [m
[37m[40m       [33m[40m▒▒▒░░[37m[40m    [33m[40m▐▓▒░█▒  ░▓▌[37m[40m                [m
[37m[40m     [33m[40m▒▒▒▒░░░░░[37m[40m  [33m[40m▐▓▒░█▒[37m[40m  [33m[40m░▓▌[37m[40m    [33m[40m▒▒▒░░[37m[40m       [m
[37m[40m    [33m[40m██▓▓▓▓▓▓▓██[37m[40m         [93m[40m▄[37m[40m     [33m[40m▒▒▒░░░░░[37m[40m     [m
[37m[40m    [33m[40m▐▓▒░█▒  ░▓▌[37m[40m         [91m[40m█[37m[40m   [33m[40m██▓▓▓▓▓▓▓██[37m[40m    [m
[37m[40m    [33m[40m▐▓▒░█▒[37m[40m  [33m[40m░▓▌[37m[40m             [33m[40m▐▓▒░█▒  ░▓▌[37m[40m    [m
[37m[40m        [93m[40m▄[37m[40m     [33m[40m▒▒▒░░[37m[40m        [93m[40m▄[33m[40m▐▓▒░█▒[37m[40m  [33m[40m░▓▌[37m[40m    [m
[37m[40m        [96m[40m█[37m[40m   [33m[40m▒▒▒▒░░░░░[37m[40m   [93m[40m▄[37m[40m  [95m[40m█[37m[40m               [m
[37m[40m     [32m[40m░░[37m[40m    [33m[40m██▓▓▓▓▓▓▓██[37m[40m  [94m[40m█[37m[40m                  [m
[37m[40m       [32m[40m░░[37m[40m  [33m[40m▐▓▒░█▒  ░▓▌[37m[40m    [32m[40m░░░[37m[40m    [33m[40m▒▒▒░░[37m[40m     [m
[37m[40m           [33m[40m▐▓▒░█▒[37m[40m  [33m[40m░▓▌[37m[40m   [32m[40m░[37m[40m     [33m[40m▒▒▒▒░░░░░[37m[40m   [m
[37m[40m                              [33m[40m██▓▓▓▓▓▓▓██[37m[40m  [m
[37m[40m         [32m[40m░[37m[40m [32m[40m░[37m[40m [32m[40m░[37m[40m                [33m[40m▐▓▒░█▒  ░▓▌[37m[40m  [m
[37m[40m                     [32m[40m░░░░░[37m[40m    [33m[40m▐▓▒░█▒[37m[40m  [33m[40m░▓▌[37m[40m  [m
[37m[40m                                           [m
`
let temp_event1 = new game_event({
	id: 1,
	body: {
		body: 'some words for an test event, plz work~~~~~~~~~~`we wq ew qkiuoh hj khgfdf gk hj gf dhjksgfd'.repeat(3),
		format: {
			writeMode: 'gradientScanlines',
			gradientFunction: gradient.retro.multiline,
			gradientArr: ['#3f51b1', '#5a55ae', '#7b5fac', '#8f6aae', '#a86aa4', '#cc6b8e', '#f18271', '#f3a469', '#f7c978'].reverse(),
			speed: 2,
		},
		TextFile: {
			exists: false,
			url: ''
		},
	},
	toScreen: {
		toScreen: mountain,
		AnsiFile: {
			exists: false,
			url: '',
		},
	},
	buttons: [
		[1, "goto 1(recur)", true],
		[2, "goto 2", true],
		//[3,"goto 3 lolololololololollolololololololol",true]
	],
	enemies: [
		pickEnemy(),
	],
})
let temp_event2 = new game_event({
	id: 2,
	body: {
		body: 'GAME EVENT 2, plz work~~~~~~~~~~`wewqewqkiuohhjkhgfdfgkhjgfdhjksgfd',
		format: {
			writeMode: 'gradientScanlines',
			gradientFunction: gradient.retro.multiline,
			gradientArr: ['#3f51b1', '#5a55ae', '#7b5fac', '#8f6aae', '#a86aa4', '#cc6b8e', '#f18271', '#f3a469', '#f7c978'],
		},
		TextFile: {
			exists: false,
			url: ''
		},
	},
	toScreen: {
		toScreen: bb,
		AnsiFile: {
			exists: false,
			url: '',
		},
	},
	buttons: [
		[1, "goto 1", true],
		//[2,"goto 2",true],
		//[3,"goto 3 lolololololololollolololololololol",true]
	],
	enemies: [
		pickEnemy(),
	],
})
let testEventArr = [temp_event1, temp_event2, ]
//test content
let body = `[0m\r
\r
  [1;34m░░░░░░░░░░░░[0m\r
[1;34m░░░░░[0m\r
   [1;5;35;46m░░░░░░░[0m\r
[1;5;35;46m░░░[0;1;34m▄█▀▀▀▀█▄[0m     [1;31m░░░░[0m\r
[1;5;35;46m░░░░[0;1;34m█▀[0m       [1;34m▀█[0m  [1;31m░░[0m\r
[1;34m▄▀[0m           [1;31m░░░[0m\r
[1;34m█▀[0m    [1;31m░░░░░░░░[0m  [1;31m█▀[0m      [1;5;35;46m♦♦[0m\r
             [1;31m▄█[0m  [1;31m♥♥[0m  [1;5;35;46m♦♦[0m\r
[1;31m▄▄▄▄[0m      [1;35m░░░[0m  [1;31m▄█▀[0m [1;31m♥♥♥[0m [1;5;35;46m♦♦♦[0m\r
[1;31m▀▀▀▀▀[35m░░[31m▀▀▀▀▀[0m  [1;31m♥♥[0m  [1;5;35;46m♦♦[0m\r
    [1;35m░░[0m      [1;31m♥♥♥[0m [1;5;35;46m♦♦♦[0m\r
   [1;35m░░[0m    [1;31m♥♥♥♥[5;35;46m♦♦♦[0m\r
[1;35m░░░░░[0m   [1;31m♥♥♥[0m  [1;5;35;46m♦♦[0m\r
    [1;31m♥♥♥♥[0m\r
[1;31m♥♥♥♥♥[0m\r
[1;31m♥♥[0m\r`
let caleb = `[48;5;241m [38;5;241;48;5;241m▄[38;5;242;48;5;241m▄▄[38;5;242;48;5;242m▄[48;5;242m [38;5;241;48;5;241m▄[48;5;241m [38;5;241;48;5;241m▄▄[38;5;59;48;5;59m▄▄[38;5;241;48;5;59m▄[38;5;241;48;5;241m▄▄▄[38;5;241;48;5;59m▄[38;5;241;48;5;241m▄▄[38;5;59;48;5;59m▄[38;5;240;48;5;240m▄▄▄▄[48;5;240m [38;5;240;48;5;240m▄▄▄[48;5;240m [38;5;240;48;5;240m▄[38;5;240;48;5;239m▄▄▄[38;5;239;48;5;239m▄▄▄▄[48;5;239m   [38;5;239;48;5;239m▄▄▄▄▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄▄▄[38;5;239;48;5;239m▄▄▄▄[48;5;239m [38;5;239;48;5;239m▄▄[m
[38;5;241;48;5;241m▄[38;5;242;48;5;242m▄[48;5;242m  [38;5;242;48;5;242m▄▄[38;5;241;48;5;241m▄[48;5;241m  [38;5;59;48;5;241m▄[48;5;59m [38;5;59;48;5;59m▄[38;5;241;48;5;241m▄[48;5;241m [38;5;241;48;5;241m▄[38;5;241;48;5;59m▄[48;5;59m [38;5;240;48;5;241m▄[38;5;59;48;5;241m▄[38;5;59;48;5;59m▄[38;5;240;48;5;240m▄▄[48;5;240m [38;5;240;48;5;240m▄▄▄[38;5;59;48;5;240m▄[38;5;241;48;5;240m▄▄▄[38;5;59;48;5;240m▄[38;5;240;48;5;240m▄▄[38;5;239;48;5;239m▄▄▄▄▄[48;5;239m  [38;5;239;48;5;239m▄▄▄[48;5;239m [38;5;239;48;5;239m▄[38;5;238;48;5;238m▄▄[38;5;237;48;5;237m▄[38;5;238;48;5;238m▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄[48;5;239m [38;5;239;48;5;239m▄▄[48;5;239m [38;5;239;48;5;239m▄[m
[38;5;241;48;5;241m▄▄[38;5;242;48;5;242m▄▄▄▄[38;5;241;48;5;241m▄▄[48;5;241m [38;5;241;48;5;59m▄▄▄[38;5;241;48;5;241m▄▄[38;5;242;48;5;241m▄[38;5;241;48;5;241m▄▄[38;5;241;48;5;59m▄▄[38;5;241;48;5;241m▄[38;5;59;48;5;59m▄[38;5;240;48;5;240m▄▄[38;5;59;48;5;240m▄[38;5;241;48;5;240m▄[38;5;240;48;5;59m▄▄[38;5;95;48;5;95m▄▄[38;5;240;48;5;59m▄[38;5;239;48;5;239m▄[38;5;238;48;5;238m▄[38;5;238;48;5;239m▄▄[38;5;239;48;5;240m▄[38;5;239;48;5;239m▄▄[48;5;239m [38;5;239;48;5;239m▄▄▄▄▄[48;5;239m [38;5;239;48;5;239m▄[38;5;239;48;5;238m▄[38;5;238;48;5;238m▄▄▄[38;5;239;48;5;238m▄[48;5;239m  [38;5;239;48;5;239m▄▄▄▄[m
[38;5;59;48;5;59m▄[38;5;59;48;5;241m▄[38;5;241;48;5;241m▄▄[38;5;242;48;5;242m▄[38;5;241;48;5;242m▄[38;5;241;48;5;241m▄▄▄▄▄[38;5;59;48;5;59m▄[38;5;241;48;5;241m▄▄▄▄▄▄▄▄[38;5;241;48;5;59m▄[38;5;101;48;5;59m▄[38;5;101;48;5;95m▄▄[38;5;240;48;5;101m▄[38;5;239;48;5;95m▄[38;5;241;48;5;241m▄[38;5;95;48;5;95m▄[38;5;240;48;5;59m▄[38;5;238;48;5;239m▄[38;5;237;48;5;238m▄[38;5;236;48;5;237m▄[38;5;235;48;5;238m▄[38;5;235;48;5;237m▄[38;5;236;48;5;237m▄[38;5;236;48;5;238m▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄▄[48;5;239m [38;5;239;48;5;239m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄▄▄▄▄▄▄▄▄▄▄[38;5;238;48;5;238m▄[m
[38;5;59;48;5;59m▄▄[38;5;241;48;5;241m▄[48;5;241m [38;5;241;48;5;241m▄[48;5;241m [38;5;241;48;5;241m▄▄▄▄▄[48;5;241m [38;5;241;48;5;241m▄[38;5;59;48;5;241m▄[38;5;241;48;5;241m▄▄▄▄[38;5;101;48;5;242m▄[38;5;138;48;5;243m▄[38;5;240;48;5;95m▄[38;5;238;48;5;95m▄[38;5;238;48;5;239m▄[38;5;237;48;5;237m▄[38;5;236;48;5;236m▄[38;5;236;48;5;238m▄[38;5;237;48;5;241m▄[38;5;238;48;5;240m▄[38;5;238;48;5;238m▄[38;5;239;48;5;237m▄[38;5;239;48;5;236m▄[38;5;239;48;5;235m▄▄[38;5;238;48;5;234m▄[38;5;237;48;5;234m▄[38;5;236;48;5;235m▄[38;5;236;48;5;236m▄[38;5;237;48;5;238m▄[38;5;239;48;5;239m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄▄▄▄[38;5;239;48;5;239m▄▄▄▄▄▄▄▄▄[48;5;239m [38;5;239;48;5;239m▄▄[m
[38;5;241;48;5;241m▄▄▄▄▄▄▄▄[48;5;241m [38;5;241;48;5;241m▄▄▄[38;5;59;48;5;59m▄[48;5;59m [38;5;241;48;5;241m▄▄[38;5;242;48;5;241m▄[38;5;138;48;5;101m▄[38;5;95;48;5;138m▄[38;5;238;48;5;95m▄[38;5;95;48;5;59m▄[38;5;180;48;5;138m▄[38;5;223;48;5;138m▄[38;5;180;48;5;95m▄[38;5;180;48;5;239m▄▄[38;5;180;48;5;95m▄[38;5;216;48;5;137m▄▄[38;5;216;48;5;174m▄▄▄▄[38;5;216;48;5;173m▄▄[38;5;180;48;5;95m▄[38;5;95;48;5;237m▄[38;5;236;48;5;236m▄[38;5;238;48;5;238m▄▄▄[38;5;239;48;5;238m▄▄[38;5;239;48;5;239m▄[48;5;239m    [38;5;239;48;5;239m▄▄▄[48;5;239m  [38;5;239;48;5;239m▄[48;5;239m  [m
[38;5;241;48;5;241m▄▄▄▄▄[38;5;242;48;5;241m▄[38;5;241;48;5;241m▄[48;5;241m    [38;5;241;48;5;241m▄[38;5;241;48;5;59m▄[38;5;241;48;5;241m▄[38;5;242;48;5;241m▄▄[38;5;138;48;5;101m▄[38;5;239;48;5;101m▄[38;5;236;48;5;237m▄[38;5;237;48;5;237m▄[38;5;95;48;5;95m▄[38;5;180;48;5;180m▄[38;5;223;48;5;223m▄▄▄▄▄▄[38;5;223;48;5;217m▄[38;5;223;48;5;216m▄[38;5;216;48;5;216m▄▄▄▄▄[38;5;216;48;5;180m▄[38;5;180;48;5;173m▄[38;5;95;48;5;239m▄[38;5;239;48;5;238m▄[38;5;239;48;5;239m▄▄▄▄▄▄▄▄▄▄▄▄[48;5;239m [38;5;239;48;5;239m▄▄▄▄[m
[38;5;241;48;5;241m▄▄▄[48;5;241m  [38;5;241;48;5;242m▄[38;5;241;48;5;241m▄▄▄▄▄▄[38;5;8;48;5;241m▄[38;5;181;48;5;8m▄[38;5;223;48;5;144m▄[38;5;224;48;5;187m▄[38;5;223;48;5;181m▄[38;5;181;48;5;95m▄[38;5;144;48;5;237m▄[38;5;240;48;5;238m▄[38;5;137;48;5;95m▄[38;5;216;48;5;216m▄[38;5;223;48;5;217m▄[38;5;180;48;5;223m▄[38;5;138;48;5;223m▄[38;5;137;48;5;223m▄[38;5;95;48;5;180m▄[38;5;95;48;5;216m▄[38;5;137;48;5;216m▄[38;5;180;48;5;216m▄▄▄▄▄▄[38;5;180;48;5;180m▄[38;5;173;48;5;173m▄[38;5;137;48;5;137m▄[38;5;238;48;5;239m▄[38;5;95;48;5;95m▄[38;5;239;48;5;239m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄[m
[38;5;240;48;5;59m▄▄[38;5;240;48;5;240m▄[38;5;59;48;5;59m▄[38;5;59;48;5;241m▄[38;5;241;48;5;241m▄[38;5;241;48;5;242m▄[38;5;241;48;5;241m▄▄▄▄[38;5;138;48;5;242m▄[38;5;223;48;5;180m▄[38;5;223;48;5;223m▄▄▄[38;5;181;48;5;223m▄[38;5;180;48;5;181m▄[38;5;144;48;5;180m▄[38;5;137;48;5;101m▄[38;5;180;48;5;173m▄[38;5;216;48;5;216m▄[38;5;180;48;5;180m▄[38;5;131;48;5;137m▄[38;5;95;48;5;95m▄[38;5;239;48;5;95m▄▄[38;5;239;48;5;238m▄[38;5;238;48;5;239m▄[38;5;131;48;5;137m▄[38;5;180;48;5;180m▄[38;5;174;48;5;180m▄[38;5;239;48;5;137m▄[38;5;237;48;5;95m▄▄[38;5;238;48;5;137m▄[38;5;95;48;5;173m▄[38;5;95;48;5;131m▄[38;5;237;48;5;237m▄[38;5;95;48;5;239m▄▄[38;5;59;48;5;239m▄[38;5;240;48;5;239m▄[38;5;239;48;5;239m▄▄▄▄▄▄▄▄▄▄▄▄▄[m
[38;5;239;48;5;239m▄[38;5;239;48;5;240m▄[38;5;240;48;5;240m▄▄[38;5;59;48;5;59m▄▄[38;5;240;48;5;59m▄[38;5;239;48;5;240m▄▄[38;5;240;48;5;59m▄[38;5;242;48;5;242m▄[38;5;180;48;5;144m▄[38;5;180;48;5;223m▄[38;5;138;48;5;180m▄▄[38;5;137;48;5;180m▄▄▄[38;5;138;48;5;138m▄[38;5;174;48;5;138m▄[38;5;180;48;5;180m▄[38;5;217;48;5;223m▄[38;5;223;48;5;223m▄[38;5;223;48;5;180m▄[38;5;180;48;5;137m▄[38;5;137;48;5;95m▄[38;5;137;48;5;239m▄[38;5;137;48;5;95m▄[38;5;174;48;5;131m▄[38;5;181;48;5;137m▄[38;5;224;48;5;223m▄[38;5;180;48;5;174m▄[38;5;239;48;5;236m▄[38;5;238;48;5;236m▄[38;5;237;48;5;237m▄[38;5;238;48;5;238m▄[38;5;95;48;5;239m▄[38;5;238;48;5;239m▄[38;5;95;48;5;238m▄[38;5;144;48;5;137m▄[38;5;144;48;5;144m▄[38;5;144;48;5;138m▄[38;5;137;48;5;241m▄[38;5;240;48;5;240m▄[38;5;240;48;5;239m▄[38;5;239;48;5;239m▄▄▄[48;5;239m [38;5;239;48;5;239m▄▄▄▄▄▄▄[m
[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄[38;5;239;48;5;240m▄▄▄▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄[38;5;240;48;5;240m▄[38;5;242;48;5;243m▄[38;5;144;48;5;180m▄[38;5;180;48;5;180m▄[38;5;137;48;5;138m▄[38;5;101;48;5;137m▄▄[38;5;137;48;5;137m▄[38;5;101;48;5;137m▄[38;5;137;48;5;137m▄▄[38;5;174;48;5;180m▄[38;5;216;48;5;216m▄[38;5;216;48;5;217m▄[38;5;217;48;5;223m▄[38;5;223;48;5;223m▄▄[38;5;217;48;5;216m▄[38;5;216;48;5;180m▄[38;5;223;48;5;180m▄[38;5;223;48;5;223m▄[38;5;223;48;5;224m▄[38;5;216;48;5;217m▄[38;5;174;48;5;137m▄[38;5;174;48;5;131m▄[38;5;174;48;5;95m▄▄[38;5;174;48;5;137m▄[38;5;95;48;5;239m▄[38;5;95;48;5;101m▄[38;5;137;48;5;138m▄[38;5;137;48;5;137m▄[38;5;137;48;5;138m▄[38;5;137;48;5;137m▄[38;5;95;48;5;59m▄[38;5;240;48;5;240m▄▄[38;5;239;48;5;240m▄[38;5;239;48;5;239m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄▄▄▄[38;5;238;48;5;239m▄▄▄[m
[38;5;238;48;5;238m▄▄▄▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄▄[38;5;239;48;5;239m▄[38;5;59;48;5;242m▄[38;5;101;48;5;138m▄▄[38;5;101;48;5;101m▄[38;5;95;48;5;95m▄[38;5;240;48;5;95m▄[38;5;239;48;5;95m▄[38;5;95;48;5;95m▄▄▄[38;5;137;48;5;173m▄[38;5;180;48;5;180m▄[38;5;174;48;5;216m▄[38;5;180;48;5;216m▄▄▄[38;5;216;48;5;216m▄[38;5;216;48;5;180m▄[38;5;137;48;5;174m▄[38;5;95;48;5;174m▄▄▄[38;5;137;48;5;174m▄[38;5;174;48;5;180m▄[38;5;180;48;5;216m▄[38;5;174;48;5;216m▄[38;5;173;48;5;174m▄[38;5;239;48;5;95m▄[38;5;95;48;5;95m▄▄[38;5;95;48;5;101m▄[38;5;95;48;5;137m▄[38;5;137;48;5;137m▄[38;5;101;48;5;101m▄[38;5;239;48;5;240m▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄[38;5;237;48;5;238m▄▄▄[38;5;237;48;5;237m▄▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄[38;5;239;48;5;238m▄[m
[38;5;238;48;5;238m▄▄▄▄▄▄▄▄▄▄[38;5;239;48;5;240m▄[38;5;242;48;5;95m▄[38;5;95;48;5;101m▄[38;5;239;48;5;95m▄▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;236;48;5;238m▄[38;5;237;48;5;238m▄[38;5;137;48;5;137m▄[38;5;174;48;5;180m▄[38;5;174;48;5;173m▄[38;5;180;48;5;180m▄▄[38;5;174;48;5;216m▄[38;5;174;48;5;217m▄[38;5;174;48;5;223m▄[38;5;174;48;5;180m▄[38;5;174;48;5;137m▄[38;5;95;48;5;95m▄[38;5;131;48;5;95m▄[38;5;137;48;5;137m▄[38;5;173;48;5;174m▄▄[38;5;137;48;5;173m▄[38;5;95;48;5;131m▄[38;5;237;48;5;238m▄[38;5;240;48;5;95m▄[38;5;95;48;5;95m▄▄▄[38;5;101;48;5;101m▄[38;5;95;48;5;95m▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄▄▄▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[48;5;239m [m
[38;5;238;48;5;238m▄▄[38;5;237;48;5;238m▄[48;5;238m [38;5;238;48;5;238m▄[38;5;239;48;5;238m▄▄▄▄▄[38;5;240;48;5;240m▄[38;5;240;48;5;59m▄[38;5;239;48;5;239m▄[38;5;238;48;5;238m▄▄[38;5;237;48;5;238m▄▄[38;5;236;48;5;237m▄[38;5;235;48;5;236m▄▄[38;5;95;48;5;95m▄[38;5;137;48;5;173m▄[38;5;173;48;5;173m▄[38;5;180;48;5;180m▄▄[38;5;180;48;5;137m▄[38;5;180;48;5;131m▄[38;5;174;48;5;131m▄[38;5;137;48;5;131m▄[38;5;131;48;5;131m▄▄[38;5;95;48;5;95m▄[38;5;95;48;5;131m▄[38;5;137;48;5;137m▄▄[38;5;131;48;5;131m▄[38;5;238;48;5;238m▄[38;5;236;48;5;237m▄[38;5;239;48;5;95m▄[38;5;95;48;5;95m▄▄▄▄[38;5;239;48;5;59m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄▄▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[38;5;239;48;5;238m▄[38;5;239;48;5;239m▄[m
[38;5;238;48;5;238m▄▄▄▄[38;5;239;48;5;239m▄[38;5;240;48;5;239m▄[38;5;240;48;5;240m▄[38;5;240;48;5;239m▄▄▄[38;5;239;48;5;239m▄[38;5;239;48;5;240m▄[38;5;240;48;5;240m▄[38;5;240;48;5;239m▄[38;5;240;48;5;238m▄[38;5;239;48;5;236m▄[38;5;238;48;5;236m▄[38;5;239;48;5;236m▄▄[38;5;238;48;5;236m▄[38;5;237;48;5;237m▄[38;5;239;48;5;95m▄[38;5;137;48;5;173m▄[38;5;180;48;5;180m▄[38;5;216;48;5;180m▄[38;5;223;48;5;216m▄▄[38;5;216;48;5;180m▄[38;5;216;48;5;173m▄[38;5;180;48;5;137m▄▄[38;5;173;48;5;137m▄▄[38;5;137;48;5;137m▄[38;5;131;48;5;131m▄[38;5;238;48;5;95m▄[38;5;235;48;5;236m▄[38;5;236;48;5;236m▄[38;5;236;48;5;237m▄[38;5;237;48;5;238m▄[38;5;238;48;5;239m▄[38;5;239;48;5;240m▄▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄▄▄▄▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[38;5;239;48;5;238m▄[38;5;239;48;5;239m▄▄▄[m
[38;5;238;48;5;238m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[38;5;239;48;5;238m▄[38;5;240;48;5;239m▄[38;5;240;48;5;240m▄[38;5;240;48;5;59m▄▄[38;5;239;48;5;240m▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄[38;5;239;48;5;240m▄[38;5;240;48;5;240m▄▄▄[38;5;238;48;5;59m▄[38;5;236;48;5;59m▄[38;5;239;48;5;239m▄[38;5;95;48;5;238m▄[38;5;238;48;5;238m▄[38;5;237;48;5;239m▄[38;5;238;48;5;137m▄[38;5;239;48;5;180m▄[38;5;137;48;5;180m▄[38;5;137;48;5;216m▄[38;5;137;48;5;180m▄▄[38;5;173;48;5;180m▄▄▄[38;5;137;48;5;173m▄[38;5;95;48;5;137m▄[38;5;240;48;5;95m▄[38;5;239;48;5;237m▄[38;5;237;48;5;235m▄[38;5;236;48;5;236m▄[38;5;237;48;5;236m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄▄▄▄[38;5;238;48;5;237m▄▄▄▄[38;5;237;48;5;237m▄[38;5;238;48;5;237m▄[38;5;239;48;5;238m▄▄▄▄▄[38;5;239;48;5;239m▄[m
[38;5;237;48;5;237m▄▄[38;5;238;48;5;238m▄▄[38;5;238;48;5;239m▄▄▄[38;5;239;48;5;239m▄[38;5;238;48;5;239m▄[38;5;237;48;5;238m▄▄[38;5;238;48;5;238m▄▄[38;5;238;48;5;239m▄[38;5;237;48;5;239m▄▄[38;5;235;48;5;237m▄[38;5;234;48;5;234m▄[38;5;234;48;5;235m▄[38;5;95;48;5;239m▄[38;5;137;48;5;137m▄[38;5;95;48;5;95m▄[38;5;238;48;5;238m▄[38;5;238;48;5;237m▄▄[38;5;238;48;5;238m▄[38;5;238;48;5;239m▄[38;5;238;48;5;95m▄▄▄▄[38;5;239;48;5;95m▄[38;5;237;48;5;95m▄[38;5;234;48;5;239m▄[38;5;237;48;5;240m▄[38;5;239;48;5;239m▄[48;5;239m [38;5;239;48;5;239m▄▄[38;5;239;48;5;238m▄[38;5;238;48;5;238m▄▄▄▄▄▄▄▄[38;5;238;48;5;239m▄▄[38;5;238;48;5;240m▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄[38;5;238;48;5;239m▄[m
[38;5;237;48;5;237m▄▄▄[38;5;238;48;5;238m▄[38;5;237;48;5;237m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄▄[38;5;237;48;5;237m▄▄[38;5;236;48;5;236m▄▄[38;5;234;48;5;234m▄[38;5;233;48;5;233m▄[38;5;236;48;5;235m▄[38;5;137;48;5;95m▄[38;5;137;48;5;137m▄▄[38;5;95;48;5;239m▄[38;5;238;48;5;238m▄▄▄[38;5;239;48;5;238m▄▄[38;5;95;48;5;239m▄▄[38;5;95;48;5;95m▄▄[38;5;236;48;5;237m▄[38;5;232;48;5;233m▄[38;5;232;48;5;234m▄[38;5;234;48;5;237m▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄▄▄[38;5;238;48;5;238m▄▄▄▄[38;5;238;48;5;237m▄[38;5;237;48;5;237m▄▄▄[38;5;237;48;5;238m▄▄[38;5;238;48;5;238m▄▄▄[48;5;238m [m
[38;5;238;48;5;237m▄▄▄[38;5;238;48;5;238m▄▄▄▄▄▄▄[38;5;237;48;5;237m▄▄▄▄[38;5;237;48;5;236m▄[38;5;236;48;5;236m▄[38;5;235;48;5;234m▄▄[38;5;95;48;5;239m▄[38;5;137;48;5;137m▄▄▄▄[38;5;95;48;5;95m▄[38;5;238;48;5;238m▄▄[38;5;239;48;5;239m▄[38;5;95;48;5;95m▄▄▄▄[38;5;239;48;5;95m▄[38;5;234;48;5;235m▄[38;5;232;48;5;232m▄▄[38;5;232;48;5;233m▄[38;5;234;48;5;236m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄[48;5;238m [38;5;238;48;5;238m▄▄[38;5;237;48;5;238m▄▄▄▄[38;5;237;48;5;237m▄▄▄▄▄▄▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄[48;5;238m [m
[38;5;238;48;5;238m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[38;5;239;48;5;238m▄▄▄▄▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;236;48;5;237m▄[38;5;236;48;5;236m▄▄[38;5;236;48;5;237m▄[38;5;236;48;5;236m▄▄[38;5;235;48;5;235m▄▄[38;5;95;48;5;95m▄[38;5;137;48;5;137m▄▄▄▄▄[38;5;95;48;5;95m▄[38;5;239;48;5;238m▄[38;5;239;48;5;239m▄[38;5;239;48;5;95m▄[38;5;95;48;5;95m▄▄[38;5;239;48;5;95m▄[38;5;238;48;5;238m▄[38;5;233;48;5;233m▄[38;5;232;48;5;232m▄▄[38;5;233;48;5;232m▄[38;5;233;48;5;233m▄[38;5;233;48;5;234m▄[38;5;233;48;5;235m▄[38;5;235;48;5;238m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄▄[48;5;237m [38;5;237;48;5;237m▄▄▄▄▄▄▄▄▄▄[38;5;238;48;5;238m▄▄[m
[38;5;137;48;5;239m▄[38;5;101;48;5;240m▄[38;5;137;48;5;239m▄[38;5;101;48;5;239m▄[38;5;95;48;5;239m▄[38;5;59;48;5;239m▄[38;5;238;48;5;239m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄[38;5;236;48;5;237m▄[38;5;235;48;5;236m▄[38;5;234;48;5;235m▄[38;5;235;48;5;236m▄▄▄[38;5;235;48;5;235m▄▄▄[38;5;239;48;5;95m▄[38;5;95;48;5;137m▄▄▄▄▄[38;5;95;48;5;95m▄▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄▄[38;5;238;48;5;238m▄[38;5;236;48;5;237m▄[38;5;233;48;5;233m▄[38;5;232;48;5;232m▄▄[48;5;233m [38;5;232;48;5;233m▄[38;5;233;48;5;233m▄▄[38;5;233;48;5;234m▄[38;5;234;48;5;234m▄[38;5;234;48;5;236m▄[38;5;235;48;5;238m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄▄[38;5;238;48;5;237m▄[38;5;237;48;5;237m▄▄▄▄▄▄[38;5;238;48;5;238m▄▄▄[m
[38;5;137;48;5;137m▄[38;5;101;48;5;137m▄[38;5;95;48;5;137m▄[38;5;239;48;5;137m▄[38;5;238;48;5;95m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄▄▄[38;5;236;48;5;236m▄▄[38;5;235;48;5;234m▄[38;5;233;48;5;234m▄▄[38;5;234;48;5;234m▄▄▄▄[38;5;235;48;5;236m▄[38;5;238;48;5;95m▄[38;5;95;48;5;95m▄▄▄▄[38;5;239;48;5;95m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄▄▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄[38;5;236;48;5;236m▄[38;5;233;48;5;233m▄[38;5;232;48;5;232m▄▄[38;5;233;48;5;233m▄[38;5;233;48;5;232m▄[38;5;233;48;5;233m▄▄[38;5;234;48;5;233m▄[38;5;234;48;5;234m▄▄▄[38;5;234;48;5;235m▄[38;5;234;48;5;236m▄[38;5;235;48;5;237m▄[38;5;236;48;5;237m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄▄[38;5;238;48;5;237m▄[38;5;237;48;5;237m▄[38;5;238;48;5;238m▄▄▄[48;5;238m [m
[38;5;239;48;5;95m▄[38;5;238;48;5;240m▄[38;5;238;48;5;238m▄▄[38;5;237;48;5;238m▄[48;5;237m [38;5;237;48;5;237m▄▄▄[38;5;236;48;5;236m▄[38;5;235;48;5;236m▄[38;5;234;48;5;234m▄[38;5;234;48;5;233m▄[38;5;233;48;5;233m▄▄[38;5;233;48;5;234m▄[38;5;233;48;5;233m▄[38;5;233;48;5;234m▄[38;5;234;48;5;234m▄[38;5;234;48;5;235m▄[38;5;237;48;5;95m▄[38;5;95;48;5;95m▄▄▄[38;5;95;48;5;239m▄[38;5;239;48;5;238m▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄▄[38;5;238;48;5;237m▄[38;5;236;48;5;237m▄[38;5;232;48;5;232m▄[38;5;0;48;5;232m▄[38;5;232;48;5;232m▄[38;5;233;48;5;233m▄[38;5;234;48;5;233m▄[38;5;234;48;5;234m▄[38;5;233;48;5;233m▄[38;5;233;48;5;234m▄[38;5;234;48;5;234m▄[38;5;234;48;5;235m▄▄[38;5;234;48;5;234m▄[48;5;234m [38;5;234;48;5;234m▄▄[38;5;234;48;5;235m▄[38;5;235;48;5;236m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄▄▄▄▄▄[m
[38;5;236;48;5;238m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄[38;5;238;48;5;237m▄[38;5;237;48;5;237m▄▄▄[38;5;234;48;5;237m▄[38;5;235;48;5;235m▄[38;5;236;48;5;235m▄[38;5;236;48;5;236m▄[38;5;235;48;5;235m▄[38;5;234;48;5;234m▄[38;5;235;48;5;235m▄[38;5;233;48;5;232m▄[38;5;232;48;5;233m▄[38;5;233;48;5;233m▄▄[38;5;233;48;5;234m▄[38;5;233;48;5;233m▄[38;5;233;48;5;234m▄[38;5;234;48;5;239m▄[38;5;237;48;5;95m▄[38;5;95;48;5;95m▄▄▄[38;5;95;48;5;239m▄[38;5;95;48;5;238m▄[38;5;239;48;5;237m▄[38;5;95;48;5;238m▄[38;5;237;48;5;238m▄[38;5;234;48;5;235m▄[38;5;232;48;5;232m▄[38;5;232;48;5;0m▄[38;5;232;48;5;232m▄[38;5;233;48;5;233m▄[38;5;234;48;5;234m▄▄▄[38;5;232;48;5;233m▄[38;5;234;48;5;234m▄▄[38;5;233;48;5;234m▄[38;5;234;48;5;234m▄▄▄[38;5;235;48;5;235m▄[38;5;234;48;5;235m▄[38;5;234;48;5;234m▄[38;5;235;48;5;236m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄▄▄▄▄[m
`
let thing = chalk.blue('Hello') + ' World' + chalk.red('!')
let ch = `The Yuan Family.

“Father, today, Brother Huang will leave to join the army. I\’m going to go see him off,” said Yuan Luoyu respectfully. 

Yuan Wutong immediately made his decision. “Take some presents with you. 
Stop by the treasury and pick out something good. 
Our gift might be intended for Huang Qianjun, 
but what matters is that Master Su will see it; 
we absolutely cannot be half-hearted about this. 
Let’s take this chance to display our Yuan Family\’s sincerity.” 

“Alright!” Yuan Luoyu straightforwardly agreed. 

Yuan Wutong snorted coldly. “Last night, your expenditures at the Sand-Scouring Waves weren’t the least bit small. 
Out of respect for Master Su, 
I’ll let you off just this once, 
but you’d best hurry back to the Redscale Army, you brat!” `
//test button declarations
let button1 = blessedpkg.button({
	parent: buttonsContainer,
	mouse: true,
	keys: true,
	shrink: true,
	padding: {
		left: 1,
		right: 1
	},
	left: 1,
	top: 1,
	name: 'submit',
	content: 'decide to be silly and eat a spud',
	style: {
		bg: '#0066CC',
		focus: {
			bg: '#cc0066'
		},
		hover: {
			bg: '#cc0066'
		}
	}
});
let button2 = blessedpkg.button({
	parent: buttonsContainer,
	mouse: true,
	keys: true,
	shrink: true,
	padding: {
		left: 1,
		right: 1
	},
	left: 1,
	top: 4,
	name: 'cancel',
	content: 'mmfmmmmmsdsfd uifdsjskad nfsjand kfknjsdhbhjgjvfcdyfvtgbhnjmybguhnjuhynijmk',
	style: {
		bg: '#0066CC',
		focus: {
			bg: '#cc0066'
		},
		hover: {
			bg: '#cc0066'
		}
	}
});
let button3 = blessedpkg.button({
	parent: buttonsContainer,
	mouse: true,
	keys: true,
	shrink: true,
	padding: {
		left: 1,
		right: 1
	},
	left: 1,
	top: 7,
	name: 'cancel',
	content: 'button',
	style: {
		bg: '#0066CC',
		focus: {
			bg: '#cc0066'
		},
		hover: {
			bg: '#cc0066'
		}
	}
});
let button4 = blessedpkg.button({
	parent: buttonsContainer,
	mouse: true,
	keys: true,
	shrink: true,
	padding: {
		left: 1,
		right: 1
	},
	left: 1,
	top: 10,
	name: 'cancel',
	content: 'button 444444444~~~',
	style: {
		bg: '#0066CC',
		focus: {
			bg: '#cc0066'
		},
		hover: {
			bg: '#cc0066'
		}
	}
});
//screen.render is essential for the correct screenlines amount to calculate inorder to resize buttons
function resizeButtons() {
	buttonsArray.forEach((element) => {
		element.width = buttonsContainer.width - 5
	})
	screen.render()
	buttonsArray.forEach((element, index, array) => {
		if (!(index === 0)) {
			let previous = array[index - 1]
			element.top = previous.top + previous.getScreenLines().length
		} else {
			element.top = 1
		}
		screen.render()
	})
}
// handling creating of buttons from an event. writing body etc.
// event reader
// multiple functions, exuction may differ based on event type
// messy, remove redundant code in future
// the resize button cannot get a valid height and crashes on screen resize
// if I attempt to remove all mentions of buttonsArray
function clearButtons() {
	buttonsArray.forEach((element) => {
		buttonsContainer.remove(element);
		element.destroy()
	})
	buttonsArray = []
}
async function createButtons(gameEvent, storyObj = {}) {
	eventHandler(gameEvent)
	await waitForClear();
	if (death) {
		await reset()
		return 0
	}
	gameEvent['buttons'].forEach(item => {
		let temp = new blessedpkg.button({
			parent: buttonsContainer,
			mouse: true,
			keys: true,
			shrink: true,
			padding: {
				left: 1,
				right: 1
			},
			left: 1,
			top: 1,
			name: item[1],
			content: item[1],
			//shadow: true,
			style: {
				bg: '#0066CC',
				focus: {
					bg: '#cc0066',
				},
				hover: {
					bg: '#cc0066',
				},
			},
		})
		buttonsArray.push(temp)
		temp.on('press', function() {
			clearButtons()
			buttonsContainer.setContent('')
			screen.render();
			createButtons(storyObj[item[0]], storyObj);
			resizeButtons();
			stats.focus();
			screen.render();
		})
	})
	buttonsContainer.setContent(` ${chalk.bold.yellow(buttonsArray.length) + " " + chalk.bold.greenBright("choices")}`)
	resizeButtons()
}
// basically to map event to an object using the event id as a key,
// this is so that events can be looked up by button param then loaded
// idea is for events eventually to be read from a json file
function createEventsMap(eventsArrary = [], storyArr = {}) {
	eventsArrary.forEach((element) => {
		storyArr[element.id] = element
	})
}
//sloppy but easy way to make it work
async function eventHandler(gameEvent = temp_event1, ) {
	ImageScreenTerm.term.clear()
	ImageScreenTerm.term.reset()
	rollLog(logs)
	let gb = gameEvent.body
	let gbf = gb.format
	//change to for loop eventually
	for (let i of gameEvent.enemies) {
		if (!death) {
			combat(gameEvent, i)
			await (waitForCombat())
		}
	}


    //later if in cave?? or toggleable
	// later make like total moves and like another depth var for current depth
	thePlayer.multipleEncounters=false
	if(!death){
		
		thePlayer.depth++
		thePlayer.actualDepth++

		//depth is distance travelled, ACTUAL DEPTH IS CURRENT LOCATION
		//They look the same for now but eventually youll be able to skip floors due to events and oil consumption
		//or other things (Like loot rarity) will need to track actuall distance travelled
		//plan is for both to be reset once you leave the dungeon. with the data stored somewhere for stats for a gameover screen.
		if ((thePlayer.depth % 4 === 0)&&(thePlayer.oil>0)) {
			thePlayer.oil--
		}
		refreshInventory()
		screen.render()
		// await slowLineWrite(gameEvent.toScreen.toScreen.cleanANSI())
		// ImageScreenTerm.writeSync('[H')
		// await slowLineWrite(gameEvent.toScreen.toScreen)
		writeImage(gameEvent)
		await (gradient_scanlines(logs, gb.body, gbf.speed, gbf.gradientFunction, gbf.gradientArr))
		logs.writeSync(`${escLeftByNum(20)}${chalk.yellow(`-`.repeat(logs.term.cols - 1))}`);


	//
	// for testing
	//
	}
	temp_event1.enemies=[pickEnemy()]
	temp_event2.enemies=[pickEnemy()]

	
	resolver()
}

async function writeImage(gameEvent){
	ImageScreenTerm.term.reset()
	await slowLineWrite(chalk.hex('323232')(gameEvent.toScreen.toScreen.cleanANSI()),ImageScreenTerm,24)
	ImageScreenTerm.writeSync('[H')
	await slowLineWrite(gameEvent.toScreen.toScreen,ImageScreenTerm,24)
}

function kill() {
	clearButtons()
	death = true;
	encounterResolver()
}
// resume execution after combat 
// enounter clear promise/event package clear promise
let waitForClearResolve

function waitForClear() {
	return new Promise((resolve) => {
		waitForClearResolve = resolve
	})
}

function resolver() {
	if (waitForClearResolve) {
		waitForClearResolve()
	}
}
//combat promise
let waitForCombatResolve

function waitForCombat() {
	return new Promise((resolve) => {
		waitForCombatResolve = resolve
	});
}

function encounterResolver() {
	if (waitForCombatResolve) waitForCombatResolve()
}
async function combat(event, enemy) {
	thePlayer.encDat = new combatMetrics()
	if(event.enemies.length>1){
		thePlayer.multipleEncounters=true
	}
	let monster = enemy //copyMonster(tempMonster)
	logs.writeSync('\n' + escUpByNum(1))
	await (gradient_scanlines(logs, makeRoomText(monster), 3, gradient.pastel.multiline, rainbowVoil))
	thePlayer.state = playerState.COMBAT
	buttonsContainer.setContent('')

	const foundFont = cfonts.render(`combat begin!`, 
	{gradient: `#${miscColours.legendary},#4B4B4B`, 
	font: 'chrome', 
	colors: ['system'], 
	background: 'transparent', 
	letterSpacing: 0, 
	lineHeight: 1, 
	space: false, 
	maxLength: '50'});
	
	let foundBLKTXT = foundFont.string 





	logs.writeSync(escUpByNum(1))
	logs.writeSync(`\n${chalk.hex('1B1B1B')(`#`.repeat(logs.term.cols - 1))}`);
	//logs.writeSync(`\n${chalk.hex('ECE236')(`Combat Start!`)}`);
	logs.writeSync('\n'+foundBLKTXT)

	logs.writeSync(`\n${chalk.hex(miscColours.darkWood)(`@`.repeat(logs.term.cols - 1))}\n`);
	thePlayer.encDat.enmyName = monster.name
	thePlayer.encDat.enemy = monster
	ImageScreenTerm.reset()
	ImageScreenTerm.writeSync(monster.art)
	combatLogic(thePlayer, true)
}
// moster picker in random event later
async function enemyAtack(monster, player = thePlayer, first = false) {
	if (!first) {
		logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`);
	}
	await new Promise(resolve => setTimeout(resolve, 300))
	logs.writeSync((`${chalk.blueBright(monster.name)} ${chalk.hex('ea0000')(`attacks you with`)} \
${chalk.blueBright(monster.weapon+'!')}\n`))
	if (monster.rollToHit() >= player.ac) {
		let monsterDamage = monster.rollDamage()
		player.encDat.AdmgTkn(monsterDamage)
		//await new Promise(resolve => setTimeout(resolve, 100))
		logs.writeSync(`${chalk.blueBright(monster.name)} \
${chalk.hex('ea0000')(`hits you for`)} ${chalk.hex('fe2c54')(monsterDamage)} \
${chalk.hex('ea0000')(`damage!`)}\n`)
		player.hp -= monsterDamage
		refreshStats(player)
		if (player.hp <= 0) {
			logs.writeSync((`${escLeftByNum(3)}${chalk.blueBright(monster.name)} ${chalk.hex('ea0000')(`kills you!`)}\n`))
			await new Promise(resolve => setTimeout(resolve, 2000))
			kill()
		}
		// add call to game over function
	} else {
		//await new Promise(resolve => setTimeout(resolve, 100))
		logs.writeSync((`${chalk.blueBright(monster.name)} ${chalk.hex('ea0000')(`misses you!`)}\n`))
	}
	if (first) {
		logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`);
	}
}




//
//
// Treasure event
//
// types
// items: oil, scroll, potion
// equipment weapons, armour
// gold
//
// alter of curse or bless
// alter of healing
// alter of change damage type
let waitForTreasureResolve

function waitForTreasure() {
	return new Promise((resolve) => {
		waitForTreasureResolve = resolve
	})
}

function tresureResolver() {
	if (waitForTreasureResolve) {
		waitForTreasureResolve()
	}
}



async function clearCombat() {
	thePlayer.weaponCooldown = 0
	ImageScreenTerm.removeLabel()
	clearButtons();

	//`red,#4B4B4B`
	const foundFont = cfonts.render(`You ${thePlayer.encDat.peacefullClr?'cleared':'defeated'}|the enemy!`, 
	{gradient: `#${miscColours.legendary},#4B4B4B`, 
	font: 'chrome', 
	colors: ['system'], 
	background: 'transparent', 
	letterSpacing: 0, 
	lineHeight: 1, 
	space: false, 
	maxLength: '50'});

	let foundBLKTXT = foundFont.string 

	



	logs.writeSync(`${chalk.hex(miscColours.darkWood)(`@`.repeat(logs.term.cols - 1))}\n`);
	logs.writeSync(foundBLKTXT+'\n')
	logs.writeSync(`${chalk.hex('1B1B1B')(`#`.repeat(logs.term.cols - 1))}\n`);

	if (!death) {
		thePlayer.state = playerState.TREASURE_ROOM
		let length = '╰╾────────────────────────────────────────────╼╯'.length
		let combatBanner = `\
╭${gradient.pastel('╾────────────────────────────────────────────╼')}╮ 
│   ${gradient.instagram(thePlayer.encDat.enmyName)} ${chalk.blue(thePlayer.encDat.peacefullClr?`cleared in`:`deafeated in`)} ${chalk.greenBright(`${thePlayer.encDat.turn} turns`)}
│   <${'-'.repeat(38)}>
│   XP earned:  ${thePlayer.encDat.peacefullClr?chalk.redBright(`0`):chalk.greenBright(`545`)}
│
│   average hit rate: ${(thePlayer.encDat.calculateHitMissAVG()*100).toFixed(2)} % hit chance
│   average damage dealt per turn: ${chalk.redBright(thePlayer.encDat.calculateTurnDmgAVG())} dmg
│
│   Total dmg dealt; ${chalk.redBright(`${thePlayer.encDat.returnDamageDealt()} dmg`)}
│   Total dmg taken: ${chalk.greenBright(`${thePlayer.encDat.returnDamageTaken()}`)} dmg
│
│   ${chalk.cyan('potions used')} ${chalk.green('   |')} ${thePlayer.encDat.pUse}
│   ${chalk.yellow('scrolls used')} ${chalk.green('   |')} ${thePlayer.encDat.sUse}
│   ${chalk.redBright('oil flasks used')} ${chalk.green('|')} ${thePlayer.encDat.fUse}
╰${gradient.pastel('╾────────────────────────────────────────────╼')}╯\
`
		//new combatMetrics()
		ImageScreenTerm.writeSync('\n' + combatBanner)
		//draw line to close box
		for (let i = 0; i <= 12; i++) {
			ImageScreenTerm.writeSync(escUpByNum(1) + escLeftByNum(1) + '│')
		}
	}

	//temp
	//await new Promise(r => setTimeout(r, 2000));



// multiple combats delay treasure till later
// make it flash
	if(!death && (!thePlayer.encDat.peacefullClr && !thePlayer.multipleEncounters)) {
		treasure()
		await waitForTreasure();
	}else if(!death && thePlayer.encDat.peacefullClr){
		MakeContinueButton()
		await waitForTreasure();
	}
	thePlayer.encDat = null
	encounterResolver()
}
//keep or change weapon or armour


async function treasure() {
	let gotoTreasure = new blessedpkg.button({
		parent: buttonsContainer,
		mouse: true,
		keys: true,
		shrink: true,
		padding: {
			left: 1,
			right: 1
		},
		left: 1,
		top: 1,
		name: 'gotoTreasure',
		content: chalk.hex('ffffff')(`search for loot`), //make it flash
		//shadow: true,
		style: {
			bg: `#${miscColours.epic}`,
			focus: {
				bg: `#${miscColours.legendary}`,
			},
			hover: {
				bg: `#${miscColours.legendary}`,
			},
		},
	})
	buttonsArray.push(gotoTreasure)
	screen.render()
	resizeButtons()
	screen.render()
	buttonsContainer.scrollTo(0)
	screen.render()


	gotoTreasure.on('press', async function () {
		clearButtons()
		ImageScreenTerm.term.reset()
		screen.render()
		logs.writeSync(`${chalk.hex(miscColours.legendary)(`.`.repeat(logs.term.cols - 1))}\n`);
		logs.writeSync('searching for loot...\n')
		logs.writeSync(`${chalk.hex('1B1B1B')(`.`.repeat(logs.term.cols - 1))}\n`);
		//move somewhere else
		let treasure = pickTreasure()
		switch (treasure){
			case 'gold':{
				let goldDice = 4 + (Math.ceil(thePlayer.actualDepth / 2.5));
				goldDice += ((thePlayer.dex>0)?thePlayer.dex:0);
				let gold =chance4.rpg(`${goldDice}d6`, {sum: true})
				const foundFont = cfonts.render('gold', {gradient: `#${miscColours.legendary},red`, font: 'block', colors: ['system'], background: 'transparent', letterSpacing: 0, lineHeight: 1, space: false, maxLength: '50'});
				let foundBLKTXT = foundFont.string 
				await slowLineWrite(foundBLKTXT, ImageScreenTerm,20)
				let spacer = gradient([`#${miscColours.legendary}`, `#${miscColours.epic}`]);
				ImageScreenTerm.writeSync(spacer('▄'.repeat(ImageScreenTerm.term.cols))+'\n')

				await writeGold(gold)
				logs.writeSync(`found ${gold}gp\n`)
				thePlayer.gold += gold
				refreshInventory()
				//ImageScreenTerm.writeSync("TESTgold\n")
				logs.writeSync(`${chalk.hex(miscColours.legendary)(`.`.repeat(logs.term.cols - 1))}\n`);
				MakeContinueButton()
				break
			}
			case 'items':{
				//ImageScreenTerm.writeSync("TESTitems\n")
				let amountOfDifferentItems = chance4.integer({min: 1, max: 3})
				let items = ["potion", "scroll", "oil"]
				let weights = [1, .8, 2]
				let itemsWon=[]
				const foundFont = cfonts.render('loot...', {gradient: 'red,blue', font: 'block', colors: ['system'], background: 'transparent', letterSpacing: 0, lineHeight: 1, space: false, maxLength: '50'});
				let foundBLKTXT = foundFont.string 

				await slowLineWrite(foundBLKTXT, ImageScreenTerm,20)
				let spacer = gradient([`#${miscColours.legendary}`, `#${miscColours.epic}`]);
				ImageScreenTerm.writeSync(spacer('▄'.repeat(ImageScreenTerm.term.cols))+'\n')

				for(let i = 0; i < amountOfDifferentItems; i++){
					let selected = chance4.weighted(items, weights)
					itemsWon.push(selected)
					let index = items.findIndex((item)=>item===selected)
					items.splice(index, 1)
					weights.splice(index, 1)
				}
				for (let i = 0; i < itemsWon.length; i++) {
					let item = itemsWon[i]
					switch (item) {
						case 'potion':{
							let amount = chance4.d4()
							thePlayer.potions += amount
							refreshInventory()
							logs.writeSync(`found ${amount} potions\n`)
							await writePotion(amount)
							break
						}
						case 'scroll':{
							//later make weighted random
							let amount = chance4.d4()
							thePlayer.scrolls += amount
							refreshInventory()
							logs.writeSync(`found ${amount} scrolls\n`)
							await writeScroll(amount)
							break
						}
						case 'oil':{
							let amount = chance4.d6()
							thePlayer.oil += amount
							refreshInventory()
							logs.writeSync(`found ${amount} oil flasks\n`)
							await writeOil(amount)
							break
						}	
					}
				}
				ImageScreenTerm.writeSync(spacer('▀'.repeat(ImageScreenTerm.term.cols))+'\n')

				logs.writeSync(`${chalk.hex(miscColours.legendary)(`.`.repeat(logs.term.cols - 1))}\n`);
				MakeContinueButton()
				break
			}// "weapon", "armour", "altar"]
			// make these call a function, its more complex than above functions
			case 'weapon':{
				ComplexTreasure(pickWeapon(),true)
				break
			}
			case 'armour':
				ComplexTreasure(armourPicker(),false)
				break
			// case 'altar':
			// 	break
		}
	});
}



async function ComplexTreasure(strOrObject=weapons.flamberge,weapon=true){
	let itemStr = weapon?"weapon":"armour"
	
	let itemName = weapon?strOrObject.name:strOrObject

	let oldItem = weapon?thePlayer.weapon.name:thePlayer.armourName

	let keep = new blessedpkg.button({
		parent: buttonsContainer,
		mouse: true,
		keys: true,
		shrink: true,
		padding: {
			left: 1,
			right: 1
		},
		left: 1,
		top: 1,
		name: 'gotoTreasure',
		content: chalk.hex('ffffff')(`keep current ${itemStr}`), //make it flash
		//shadow: true,
		style: {
			bg: `#${miscColours.epic}`,
			focus: {
				bg: `#${miscColours.legendary}`,
			},
			hover: {
				bg: `#${miscColours.legendary}`,
			},
		},
	})



	let take = new blessedpkg.button({
		parent: buttonsContainer,
		mouse: true,
		keys: true,
		shrink: true,
		padding: {
			left: 1,
			right: 1
		},
		left: 1,
		top: 1,
		name: 'gotoTreasure',
		content: chalk.hex('ffffff')(`take new ${itemStr}`), //make it flash
		//shadow: true,
		style: {
			bg: `#${miscColours.epic}`,
			focus: {
				bg: `#${miscColours.legendary}`,
			},
			hover: {
				bg: `#${miscColours.legendary}`,
			},
		},
	})

	
	buttonsArray.push(keep)
	buttonsArray.push(take)
	screen.render()
	resizeButtons()

	logs.writeSync(`${chalk.hex(weapon?rarityByWeight(strOrObject.rarity):ArmourRarityColour(ARMOURmap[strOrObject]))(itemName)} found\n`)
	
	const equipFont = cfonts.render('equiped:', {gradient: 'red,blue', font: 'block', colors: ['system'], background: 'transparent', letterSpacing: 0, lineHeight: 1, space: false, maxLength: '50'});
	let equipBLKTXT = equipFont.string  // the ansi string for sexy console font

	// write to terminal
	const foundFont = cfonts.render('Found...', {gradient: 'red,blue', font: 'block', colors: ['system'], background: 'transparent', letterSpacing: 0, lineHeight: 1, space: false, maxLength: '50'});
	let foundBLKTXT = foundFont.string 

	ImageScreenTerm.writeSync('[H')
	//ImageScreenTerm.writeSync(equipBLKTXT+'\n')
	await slowLineWrite(equipBLKTXT,ImageScreenTerm,20)
	weapon?await drawBanner(thePlayer.weapon):await writeArmour(thePlayer.armourName,thePlayer.armourMagic)

	let spacer = gradient([`#${miscColours.legendary}`, `#${miscColours.epic}`]);
	ImageScreenTerm.writeSync(spacer('▄'.repeat(ImageScreenTerm.term.cols)))

	ImageScreenTerm.writeSync('\n\n')
	//ImageScreenTerm.writeSync(foundBLKTXT+'\n') 
	await slowLineWrite(foundBLKTXT,ImageScreenTerm,20)
	weapon?await drawBanner(strOrObject,ImageScreenTerm,true): await writeArmour(strOrObject,0,ImageScreenTerm,true)


	keep.on('press', async function() {
		clearButtons()
		logs.writeSync(`${chalk.hex(weapon?rarityByWeight(strOrObject.rarity):ArmourRarityColour(ARMOURmap[strOrObject]))(itemName)} not taken\n`)
		logs.writeSync(`${chalk.hex(miscColours.legendary)(`.`.repeat(logs.term.cols - 1))}\n`);
		tresureResolver()
	})

	take.on('press', async function() {
		clearButtons()
		logs.writeSync(`${chalk.hex(weapon?rarityByWeight(strOrObject.rarity):ArmourRarityColour(ARMOURmap[strOrObject]))(itemName)} \
taken, ${chalk.hex(weapon?rarityByWeight(thePlayer.weapon.rarity):ArmourRarityColour(ARMOURmap[thePlayer.armourName]))(oldItem)} discarded\n`)

		logs.writeSync(`${chalk.hex(miscColours.legendary)(`.`.repeat(logs.term.cols - 1))}\n`);
		if(weapon){
			thePlayer.changeWeapon(strOrObject)
		}else{
			thePlayer.changeArmour(strOrObject)
		}
		refreshInventory()
		refreshStats()
		tresureResolver()
	})

	

}


function pickTreasure(){
	let options = ["gold", "items", "weapon", "armour"]//, "altar"]
	let weights_array =[5,1,1,1]//,1]
	return chance4.weighted(options, weights_array)
}


function MakeContinueButton(text){
	let continueButton = new blessedpkg.button({
		parent: buttonsContainer,
		mouse: true,
		keys: true,
		shrink: true,
		padding: {
			left: 1,
			right: 1
		},
		left: 1,
		top: 1,
		name: 'continue',
		content: text?text:chalk.hex('ffffff')(`continue`),
		//shadow: true,
		style: {
			bg: `#${miscColours.epic}`,
			focus: {
				bg: `#${miscColours.legendary}`,
			},
			hover: {
				bg: `#${miscColours.legendary}`,
			},
		},
	});
	buttonsArray.push(continueButton)
	screen.render()
	resizeButtons()
	screen.render()
	buttonsContainer.scrollTo(0)
	screen.render()
	continueButton.on('press', async function () {
		clearButtons()
		screen.render()
		tresureResolver()
	});
}











async function combatLogic( /*make into enemy*/ player = thePlayer, firstLoop = true, hostile = false, counter = 1) {
	ImageScreenTerm.setLabel(`${gradient.summer(`Turn counter: ${counter}`)}`)
	let monster = thePlayer.encDat.enemy
	//logs.writeSync('hp '+monster.hp+'\n')
	let playerWonInitiative = false
	let monsterHostile = hostile
	let turn = counter
	thePlayer.encDat.turn = turn
	//logs.writeSync(`${chalk.bold.green(turn)}\n`);
	if (firstLoop) {
		if ( /*room.forceHostile == -1 &&*/ monster.aggro < 12) {
			// friendly
			monsterHostile = false;
		} else if (player.rollReaction <= monster.aggro || monster.aggro >= 12 /* || room.forceHostile == 1*/ ) {
			// hostile
			monsterHostile = true;
		} else {
			// neutral, which is functionally the same as friendly
			monsterHostile = false;
		}
	}
	if (firstLoop && monsterHostile) {
		let player_initiative = player.rollInitiative()
		let monster_initiative = monster.rollInitiative()
		logs.writeSync(`Monster init${chalk.red(monster_initiative)} Player init${chalk.blue(player_initiative)}\n`)
		if (monster_initiative > player_initiative) {
			await enemyAtack(monster, player, true)
		} else {
			playerWonInitiative = true
		}
	} else if (firstLoop && !monsterHostile) {
		//change to random strings later
		logs.writeSync(chalk.blueBright(monster.name) + gradient.pastel(" is not hostile") + '\n')
		logs.writeSync(`${chalk.hex('1B1B1B')(`.`.repeat(logs.term.cols - 1))}\n`);
	}
	if (!death)createCombatButtons(monsterHostile)
	combatButtonsMap['attack'].on('press', async () => {
		if ((logs.term.rows - 2) <= logs.term.buffer.active.cursorY) {
			logs.writeSync(escUpByNum(1))
			rollLog(logs)
		}
		clearButtons();
		logs.writeSync(
			`${chalk.hex('00ea00')(`${escLeftByNum(2)}You attack the enemy with your`)} ${chalk.hex(player.weapon.dmgType.color)(player.weaponName.replace(/_/g, ' ')+'!')}\n`
			);
		let TOHIT = player.rollToHit()
		if (TOHIT[0] === 20) {
			logs.writeSync(dice + escUpByNum(3) + gradient.rainbow(`\nCrit!\n\n`))
			await new Promise(resolve => setTimeout(resolve, 1000))
		}
		if ((TOHIT[0] + TOHIT[1]) >= monster.ac) {
			player.encDat.AHM(true)
			let playerDamage = player.rollDamage()
			let crit = false
			if (TOHIT[0] === 20) {
				crit = true
				playerDamage += player.rollDamage()
			}
			monster.hp -= playerDamage
			player.encDat.ATdmg(playerDamage)
			logs.writeSync(
			`${chalk.hex('00ea00')(`You hit for`)} ${chalk.hex('fe2c54')(playerDamage)} ${chalk.hex('00ea00')('damage!')}\n`); // ___DEBUGenemyhp=${monster.hp}\n`);
			logs.writeSync(player.wBonus.applyEffectWF(monster, crit, player));
			//logs.writeSync(chalk.hex('00ea00')(`___DEBUGenemyhp=${monster.hp}\n`));
		} else {
			player.encDat.AHM(false)
			logs.writeSync(chalk.hex('00ea00')(`You miss!\n`)) //    ____DEBUGenemyhp=${monster.hp}\n`));
		}
		if (monster.hp <= 0) {
			await new Promise(resolve => setTimeout(resolve, 100))
			clearCombat()
		} else {
			await new Promise(resolve => setTimeout(resolve, 50))
			await enemyAtack(monster, player)
			logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`);
			combatLogic(player, false, true, ++turn)
		}
	})
	combatButtonsMap['flee'].on('press', async () => {
		//bad name
		let dexSave = player.rollSkillCheck(player.dex)
		if ((dexSave >= (10 + monster.hitDie)) || !monsterHostile) {
			player.encDat.peacefullClr = true
			logs.writeSync(`${!playerWonInitiative&&firstLoop?escUpByNum(1)+'\r':''}${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}\n`);
			monsterHostile ? logs.writeSync(`${chalk.hex('00ea00')(`You escaped through a random tunnel`)}\n`) :
				logs.writeSync(`${chalk.hex('00ea00')(`You walk past the ${monster.name} \nfollowing the path till you reach the room`)}\n`);
			logs.writeSync(`${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}\n`);
			// random deeper or surface
			clearButtons();
			clearCombat()
		} else {
			clearButtons();
			if (playerWonInitiative && firstLoop) {
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			} else if (!firstLoop) {
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			}
			logs.writeSync(`${chalk.hex('ea0000')(`${monster.name} prevented your escape!`)}\n`);
			await enemyAtack(monster, player)
			combatLogic(player, false, monsterHostile, ++turn)
		}
	})
	// something something morale
	// combatButtonsMap['chatUp'].on('press', async () => {
	// 	clearButtons();
	// 	if(playerWonInitiative&&firstLoop){
	// 		logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
	// 	}else if(!firstLoop){
	// 		logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
	// 	}
	// })
	if ('potion' in combatButtonsMap) {
		combatButtonsMap['potion'].on('press', async () => {
			let heal = chance2.rpg('2d4', {
				sum: true
			}) + 4
			clearButtons();
			if (playerWonInitiative && firstLoop) {
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			} else if (!firstLoop) {
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			}
			logs.writeSync(thePlayer.hp + " " + thePlayer.hpMax)
			if ((thePlayer.hp + heal) > thePlayer.hpMax) {
				logs.writeSync(`${chalk.yellow(`AAAAAAA You drink a potion! you heal for ${thePlayer.hpMax-thePlayer.hp} hp!`)}\n`);
			} else {
				logs.writeSync(`${chalk.yellow(`BBBBBBB You drink a potion! you heal for ${heal} hp!`)}\n`);
			}
			thePlayer.increaseHP(heal)
			thePlayer.potions--
			thePlayer.encDat.APuse()
			refreshStats()
			refreshInventory()
			let testHostileDebug = monsterHostile
			if (monsterHostile) {
				await enemyAtack(monster, player)
			} else {
				testHostileDebug = false
			}
			if (player.potions < 1) {
				combatButtonsMap['potion'].destroy()
			}
			screen.render()
			combatLogic(player, false, testHostileDebug, ++turn)
		})
	}
	if ('oil' in combatButtonsMap) {
		combatButtonsMap['oil'].on('press', async () => {
			player.encDat.AHM(true)
			let damage = chance2.rpg('2d6', {
				sum: true
			}) + 4
			player.encDat.ATdmg(damage)
			clearButtons();
			if (playerWonInitiative && firstLoop) {
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			} else if (!firstLoop) {
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			}
			logs.writeSync(
				`${chalk.hex('00ea00')(`You light a flask of oil and throw it to the enemy!\n`)+chalk.hex(DMG_COLOUR[DMG_TYPE.FIRE])(`dealing 2d6+4=${damage} fire damage!`)}\n`
				);
			monster.hp -= damage
			thePlayer.oil--
			thePlayer.encDat.AfUse()
			refreshInventory()
			await new Promise(resolve => setTimeout(resolve, 100))
			if (monster.hp <= 0) {
				await new Promise(resolve => setTimeout(resolve, 100))
				clearCombat()
			} else {
				await enemyAtack(monster, player)
				await new Promise(resolve => setTimeout(resolve, 50))
				combatLogic(player, false, true, ++turn)
			}
		})
	}
	if ('scrolls' in combatButtonsMap) {
		combatButtonsMap['scrolls'].on('press', async () => {
			clearButtons();
			if (playerWonInitiative && firstLoop) {
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			} else if (!firstLoop) {
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			}
			thePlayer.encDat.AsUse()
			logs.writeSync(player.useScroll({
				monster: monster,
				term: ImageScreenTerm
			}) + '\n')
			if (monster !== player.encDat.enemy) {
				monster = player.encDat.enemy
			}
			//console.log(monster)
			refreshStats()
			refreshInventory()
			await new Promise(resolve => setTimeout(resolve, 100))
			if (monster.hp <= 0) {
				await new Promise(resolve => setTimeout(resolve, 100))
				clearCombat()
			} else {
				if (monster.polymorph) {
					if (monster.aggro < 12) {
						// friendly
						monster.polymorph = false;
						monsterHostile = false;
					} else if (player.rollReaction <= monster.aggro || monster.aggro >= 12) {
						// hostile
						monster.polymorph = false;
						monsterHostile = true;
						await enemyAtack(monster, player)
					} else {
						// neutral
						monster.polymorph = false;
						monsterHostile = false;
					}
				}else{
					monsterHostile = true;
					await enemyAtack(monster, player)
				}
				await new Promise(resolve => setTimeout(resolve, 50))
				combatLogic(player, false, monsterHostile, ++turn)
			}
		})
	}
	//generate listener for potion button if potions button exists
}

function createCombatButtons(hostile) {
	let monsterHostile = hostile
	clearButtons()
	combatButtonsMap = {}
	let attack = new blessedpkg.button({
		parent: buttonsContainer,
		mouse: true,
		keys: true,
		shrink: true,
		padding: {
			left: 1,
			right: 1
		},
		left: 1,
		top: 1,
		name: `attack`,
		content: `${chalk.bold.white('attack ')}${chalk.bold.green(thePlayer.weapon.dmgDie)}\
${thePlayer.basedamage<0?chalk.bold.white(' - '):chalk.bold.white(' + ')}\
${chalk.bold.white(Math.abs(thePlayer.basedamage))}\
${monsterHostile?'':gradient.retro.multiline('\nTrigger hostilities')}`, //maybe add damage die
		//shadow: true,
		style: {
			bg: '#000072',
			focus: {
				bg: '#880808',
			},
			hover: {
				bg: '#880808',
			},
		},
	})
	combatButtonsMap[attack.name] = attack
	let flee = new blessedpkg.button({
		parent: buttonsContainer,
		mouse: true,
		keys: true,
		shrink: true,
		padding: {
			left: 1,
			right: 1
		},
		left: 1,
		top: 1,
		name: 'flee',
		content: monsterHostile ? `flee ${thePlayer.dex > -1 ? chalk.bold.greenBright('dex check') : chalk.bold.redBright('dex check')}` :
			`${chalk.bold.greenBright(`walk past ${thePlayer.encDat.enmyName}\nand continue onwards`)}`,
		//shadow: true,
		style: {
			bg: '#000072',
			focus: {
				bg: '#880808',
			},
			hover: {
				bg: '#880808',
			},
		},
	})
	combatButtonsMap[flee.name] = flee
	let chatUp = new blessedpkg.button({
		parent: buttonsContainer,
		mouse: true,
		keys: true,
		shrink: true,
		padding: {
			left: 1,
			right: 1
		},
		left: 1,
		top: 1,
		name: 'chatUp',
		content: `chat up ${thePlayer.dex > -1 ? chalk.bold.greenBright('cha check') : chalk.bold.redBright('cha check')}`,
		//shadow: true,
		style: {
			bg: '#000072',
			focus: {
				bg: '#880808',
			},
			hover: {
				bg: '#880808',
			},
		},
	})
	combatButtonsMap[chatUp.name] = chatUp
	let potion
	if (thePlayer.potions > 0) {
		potion = new blessedpkg.button({
			parent: buttonsContainer,
			mouse: true,
			keys: true,
			shrink: true,
			padding: {
				left: 1,
				right: 1
			},
			left: 1,
			top: 1,
			name: 'potion',
			content: `use potion, ${thePlayer.potions} left`,
			//shadow: true,
			style: {
				bg: '#000072',
				focus: {
					bg: '#880808',
				},
				hover: {
					bg: '#880808',
				},
			},
		})
		combatButtonsMap[potion.name] = potion
	}
	let oil
	if (thePlayer.oil > 0) {
		oil = new blessedpkg.button({
			parent: buttonsContainer,
			mouse: true,
			keys: true,
			shrink: true,
			padding: {
				left: 1,
				right: 1
			},
			left: 1,
			top: 1,
			name: 'oil',
			content: `throw oil, ${thePlayer.oil} left`,
			//shadow: true,
			style: {
				bg: '#000072',
				focus: {
					bg: '#880808',
				},
				hover: {
					bg: '#880808',
				},
			},
		})
		combatButtonsMap[oil.name] = oil
	}
	let scrolls
	if (thePlayer.scrolls > 0) {
		scrolls = new blessedpkg.button({
			parent: buttonsContainer,
			mouse: true,
			keys: true,
			shrink: true,
			padding: {
				left: 1,
				right: 1
			},
			left: 1,
			top: 1,
			name: 'scrolls',
			content: `use scroll, ${thePlayer.scrolls} left`,
			//shadow: true,
			style: {
				bg: '#000072',
				focus: {
					bg: '#880808',
				},
				hover: {
					bg: '#880808',
				},
			},
		})
		combatButtonsMap[scrolls.name] = scrolls
	}
	let names = ['attack', 'flee', 'chatUp', 'potion', 'oil', 'scrolls']
	for (const name of names) {
		if (name in combatButtonsMap) {
			buttonsArray.push(combatButtonsMap[name])
		}
	}
	buttonsContainer.setContent(` ${chalk.bold.yellow(buttonsArray.length) + " " + chalk.bold.greenBright("choices")}`)
	screen.render()
	resizeButtons()
	stats.focus()
	screen.render()
}

//ESC[?25l	make cursor invisible
//ESC[?25h	make cursor visible
//
//double check cursor is disabled on all subterminals and main one
function toggleUi() {
	buttonsContainer.toggle()
	ImageScreenTerm.toggle()
	logs.toggle()
	stats.toggle()
	InventoryBox.toggle()
}
// function toggleButtons() {
// 	buttonsContainer.toggle()
// }
async function fillStatsRollBox(speed = 2, player = thePlayer, startBox = box) {
	await new Promise(resolve => setTimeout(resolve, speed))
	startBox.pushLine(`${' '.repeat(Math.floor(startBox.width / 2) - ' HP: '.length - 2)} hp: ${player.hp}`)
	screen.render()
	await new Promise(resolve => setTimeout(resolve, speed))
	startBox.pushLine(`${' '.repeat(Math.floor(startBox.width / 2) - 'str: '.length - 2)}str: ${player.str}`)
	screen.render()
	await new Promise(resolve => setTimeout(resolve, speed))
	startBox.pushLine(`${' '.repeat(Math.floor(startBox.width / 2) - 'dex: '.length - 2)}dex: ${player.dex}`)
	screen.render()
	await new Promise(resolve => setTimeout(resolve, speed))
	startBox.pushLine(`${' '.repeat(Math.floor(startBox.width / 2) - 'int: '.length - 2)}int: ${player.int}`)
	screen.render()
	await new Promise(resolve => setTimeout(resolve, speed))
	startBox.pushLine(`${' '.repeat(Math.floor(startBox.width / 2) - 'cha: '.length - 2)}cha: ${player.cha}`)
	screen.render()
	await new Promise(resolve => setTimeout(resolve, speed))
	startBox.pushLine(`\n${' '.repeat(Math.floor(startBox.width / 2) - Math.floor('[ ENTER to continue ]'.length / 2) - 3)}[ ENTER to continue ]`)
	screen.render()
	startBox.focus()
}

function refreshStats(player = thePlayer) {
	stats.setContent(
		`{bold}${chalk.red("HP:")}{/bold}
${thePlayer.hp}/${thePlayer.hpMax}
{bold}${chalk.green("AC:")}{/bold}
${thePlayer.ac}
${chalk.yellowBright('str:')}
${thePlayer.str}
${chalk.grey('int:')}
${thePlayer.int}
${chalk.hex('000080')('dex:')}
${thePlayer.dex}
${chalk.hex('630330')('cha:')}
${thePlayer.cha}\
`)
	screen.render()
}

function refreshInventory(player = thePlayer) {
	InventoryBox.setContent(
		`{bold}${chalk.blue("Weapon :")}{/bold}
${chalk.hex(thePlayer.wBonus.color)(thePlayer.weaponName.replace(/_/g, ' '))}\
 ${thePlayer.weapon.enchant!==0?`{bold}${chalk.yellow (`+${thePlayer.weapon.enchant}`)}{/bold}`:''}
{bold}${chalk.red("Armour :")}{/bold}
${chalk.hex(ArmourRarityColour(ARMOURmap[thePlayer.armourName]))(thePlayer.armourName.replace(/_/g, ' '))}\
 ${thePlayer.armourMagic!==0?`{bold}${chalk.yellow (`+${thePlayer.armourMagic}`)}{/bold}`:''}
debug depth: ${player.depth};${player.actualDepth}
${chalk.magenta("XP : ")}${"200/400"}
${chalk.magenta("Lvl: ")}${thePlayer.level}

${chalk.hex('3B3131')('oil')} = ${thePlayer.oil}
${chalk.red('potions')} = ${thePlayer.potions}
${chalk.hex(DMG_COLOUR[DMG_TYPE.MAGIC])('scrolls')} = ${thePlayer.scrolls}
${chalk.yellow('gp')} = ${thePlayer.gold}`)
	screen.render()
}

function creatething() {
	box.key('enter', function() {
		death = false
		toggleUi()
		box.hide()
		box.destroy()
		box = null
		screen.render()
		resolver()
	})
	box.on('click', function() {
		death = false
		toggleUi()
		box.hide()
		box.destroy()
		box = null
		screen.render()
		resolver()
	})
}
async function reset() {
	resetRandoms()
	thePlayer = thePlayer.rollNewPlayer()
	refreshStats(thePlayer)
	refreshInventory()
	clearButtons()
	logs.reset()
	ImageScreenTerm.reset()
	toggleUi()
	screen.render()
	box = createStatsBox()
	screen.append(box)
	screen.render()
	box.setContent('')
	await (fillStatsRollBox(40, thePlayer, box))
	creatething()
	await waitForClear();
	//sample start code
	// buttonsArray.forEach((button) => { form_thing.remove(button); button.destroy() })
	// buttonsArray = [];
	stats.focus();
	ImageScreenTerm.term.reset()
	await createButtons(temp_event1, story);
	//buttonsContainer.setContent(` ${chalk.bold.yellow(buttonsArray.length.toString()) + " " + chalk.bold.greenBright("choices")}`)
	//resizeButtons();
	//stats.focus();
}
//reminder how to convert ansi art to utf8
//run script on cmder to convert my ansi art to utf8
//ansiart2utf8 mountain.ans > sometext.txt
//XTermTestv2.write(mountain)
//Listeners for test buttons
button1.on('press', function() {
	buttonsContainer.setContent('Canceled.');
	ImageScreenTerm.term.clear();
	ImageScreenTerm.term.reset();
	ImageScreenTerm.writeSync(caleb);
	screen.render();
});
button2.on('press', function() {
	//logs.setContent(chalk.bgMagenta.blueBright("lolololololololollolololololololol"))
	ImageScreenTerm.term.clear()
	ImageScreenTerm.term.reset()
	ImageScreenTerm.writeSync(body)
	screen.render();
});
//Listeners
screen.on('resize', function() {
	ImageScreenTerm.height = screen.height;
	ImageScreenTerm.width = Math.floor(screen.width / 2);
	//logs.setContent("x:"+form_thing.width.toString()+", y:"+form_thing.height.toString()+", submit length:"+button1.width.toString());
	resizeButtons()
});
// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function() {
	return process.exit(0);
});
screen.key('e', function() {
	ImageScreenTerm.focus();
	screen.render();
});
screen.key('p', function() {
	screen.focusNext();
});
screen.key('r', function() {
	reset()
});
//test content key listener
screen.key('y', function() {
	ImageScreenTerm.term.clear()
	ImageScreenTerm.term.reset()
	buttonsContainer.resetScroll()
	buttonsArray.forEach((button) => {
		buttonsContainer.remove(button);
		button.destroy()
	})
	buttonsArray = [];
	stats.focus();
	refreshInventory()
	//ImageScreenTerm.term.reset()
	createButtons(temp_event1, story);
	buttonsContainer.setContent(` ${chalk.bold.yellow(buttonsArray.length.toString()) + " " + chalk.bold.greenBright("choices")}`)
	resizeButtons();
	stats.focus();
});
screen.key('z', function() {
	logs.writeSync(escUpByNum(2))
	//logs.writeSync('a')
});
screen.key('n', async function() {
	clearButtons()
	death = true;
	encounterResolver()
})
let bInd = 0
let scrollUpPrev = false
//buuuuuuuuuuuuuuuuuugged when removing button
// screen.key('k', () => {
// 	if (buttonsArray.length>0){
// 		try {
// 			if(scrollUpPrev){
// 				bInd++
// 				scrollUpPrev=false
// 			}
// 			buttonsContainer.scrollTo(buttonsArray[bInd].top - 2)
// 			buttonsArray[bInd].focus()
// 			++bInd
// 			if (bInd > (buttonsArray.length - 1)) {
// 				bInd = 0
// 			}
// 		}catch (e) {
// 			bInd = 0
// 		}
// 	}
// })
// screen.key('l', () => {
// 	if (buttonsArray.length>0){
// 		try {
// 			if(!scrollUpPrev){
// 				bInd--
// 				scrollUpPrev=true
// 			}
// 			buttonsContainer.scrollTo(buttonsArray[bInd].top - 2)
// 			buttonsArray[bInd].focus()
// 			--bInd
// 			if (bInd < 0) {
// 				bInd =  (buttonsArray.length - 1)
// 			}
// 		}catch (e) {
// 			bInd = 0
// 		}
// 	}
// })
program.cursorColor('000000')
screen.title = '~game~';
screen.program.hideCursor(true);
screen.append(ImageScreenTerm)
screen.append(logs)
screen.render()
createEventsMap(testEventArr, story)
buttonsArray = [button1, button2, button3, button4];
screen.render()
resizeButtons()
toggleUi()
screen.render()
stats.focus()
//check cursor hidden
console.log('[?25l')
ImageScreenTerm.writeSync('[?25l')
logs.writeSync('[?25l')
await (fillStatsRollBox(40, thePlayer, box))
refreshStats(thePlayer)
box.focus()
box.key('enter', function() {
	toggleUi()
	box.hide()
	box.destroy()
	box = null
	screen.render()
})
box.on('click', function() {
	toggleUi()
	box.hide()
	box.destroy()
	box = null
	screen.render()
})
logs.writeSync("TESTING SANDBOX, PRESS Y AFTER ITEMS WRITTEN \nTO GO TO COMBAT TEST\n")
//draw test
await new Promise((r) => setTimeout(r, 1000));



const prettyFont = cfonts.render('equiped:', {gradient: 'red,blue', font: 'block', colors: ['system'], background: 'transparent', letterSpacing: 0, lineHeight: 1, space: false, maxLength: '50'});
let a = prettyFont.string  // the ansi string for sexy console font

 // write to terminal
const font2 = cfonts.render('Found...', {gradient: 'red,blue', font: 'block', colors: ['system'], background: 'transparent', letterSpacing: 0, lineHeight: 1, space: false, maxLength: '50'});
let v = font2.string 

ImageScreenTerm.writeSync('[H')
ImageScreenTerm.writeSync(a+'\n')
await drawBanner(weapons.flamberge)

let rar = gradient([`#${miscColours.legendary}`, `#${miscColours.epic}`]);
ImageScreenTerm.writeSync(rar('▄'.repeat(ImageScreenTerm.term.cols)))

ImageScreenTerm.writeSync('\n\n')
ImageScreenTerm.writeSync(v+'\n') 
await drawBanner()


