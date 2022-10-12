#!/usr/bin/env node
'use strict';

import XTermNew from './blessed-xterm/blessed-xterm.js';
import blessed from 'blessed';
import chalk from 'chalk';
import BlessedContrib from 'blessed-contrib';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import { game_event, game_event_enemy, game_event_gain_item } from './game-objects/game_events.js';
import { clearInterval } from 'timers';
import { Player } from './game-objects/player.js';
import { hrtime } from 'node:process';
import os from 'os';
import './blessed/patches.cjs';
import * as scroll from './blessed/scroll.cjs';
import fs from 'fs';
import pkg from 'iconv-lite';
import smallGrad from 'tinygradient';
import lodashC from 'lodash.compact';
import { monster, copyMonster } from './game-objects/mobs.js';
import {spawn} from 'child_process';
import { chance2, resetRandoms } from './game-objects/random_nums.js';
const { tinygradient } = smallGrad;
const { iconv } = pkg;
const { compact } = lodashC;
let death = false;
let buttonsArray = [];
let story = {}
let combatButtonsMap = {}
let thePlayer = new Player("name")

// test content
let tempMonster = new monster({
	name: "testCreature",
	hitDie: 1,
	ac: 6,
	morale: 6,
	weapon: "ruler",
	dmgDie: 6,
	aggro: 1,
	rarity: 1
})
let rainbowVoil = ['ee82ee', '4b0082', '0000ff', '008000', 'ffff00', 'ffa500', 'ff0000',]
let rainbowWithBlue = ['93CAED', 'ee82ee', '4b0082', '0000ff', '008000', 'ffff00', 'ffa500', 'ff0000']

//test string
let lorem =
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

var pgrad = ['#3f51b1', '#5a55ae', '#7b5fac', '#8f6aae', '#a86aa4', '#cc6b8e', '#f18271', '#f3a469', '#f7c978'].reverse()


let mountain = `[37m[40m                        [97m[40m░░[37m[40m                            [m
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
let bb = `    ${chalk.bold(`THE VILLAGE`)}
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
			gradientArr: ['#3f51b1', '#5a55ae', '#7b5fac', '#8f6aae', '#a86aa4', '#cc6b8e', '#f18271', '#f3a469', '#f7c978'],
			speed: 1,
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
	]
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
	]
})
let testEventArr = [temp_event1, temp_event2,]

//test content
let body =
	`[0m\r
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
let caleb =
	`[48;5;241m [38;5;241;48;5;241m▄[38;5;242;48;5;241m▄▄[38;5;242;48;5;242m▄[48;5;242m [38;5;241;48;5;241m▄[48;5;241m [38;5;241;48;5;241m▄▄[38;5;59;48;5;59m▄▄[38;5;241;48;5;59m▄[38;5;241;48;5;241m▄▄▄[38;5;241;48;5;59m▄[38;5;241;48;5;241m▄▄[38;5;59;48;5;59m▄[38;5;240;48;5;240m▄▄▄▄[48;5;240m [38;5;240;48;5;240m▄▄▄[48;5;240m [38;5;240;48;5;240m▄[38;5;240;48;5;239m▄▄▄[38;5;239;48;5;239m▄▄▄▄[48;5;239m   [38;5;239;48;5;239m▄▄▄▄▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄▄▄[38;5;239;48;5;239m▄▄▄▄[48;5;239m [38;5;239;48;5;239m▄▄[m\r
[38;5;241;48;5;241m▄[38;5;242;48;5;242m▄[48;5;242m  [38;5;242;48;5;242m▄▄[38;5;241;48;5;241m▄[48;5;241m  [38;5;59;48;5;241m▄[48;5;59m [38;5;59;48;5;59m▄[38;5;241;48;5;241m▄[48;5;241m [38;5;241;48;5;241m▄[38;5;241;48;5;59m▄[48;5;59m [38;5;240;48;5;241m▄[38;5;59;48;5;241m▄[38;5;59;48;5;59m▄[38;5;240;48;5;240m▄▄[48;5;240m [38;5;240;48;5;240m▄▄▄[38;5;59;48;5;240m▄[38;5;241;48;5;240m▄▄▄[38;5;59;48;5;240m▄[38;5;240;48;5;240m▄▄[38;5;239;48;5;239m▄▄▄▄▄[48;5;239m  [38;5;239;48;5;239m▄▄▄[48;5;239m [38;5;239;48;5;239m▄[38;5;238;48;5;238m▄▄[38;5;237;48;5;237m▄[38;5;238;48;5;238m▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄[48;5;239m [38;5;239;48;5;239m▄▄[48;5;239m [38;5;239;48;5;239m▄[m\r
[38;5;241;48;5;241m▄▄[38;5;242;48;5;242m▄▄▄▄[38;5;241;48;5;241m▄▄[48;5;241m [38;5;241;48;5;59m▄▄▄[38;5;241;48;5;241m▄▄[38;5;242;48;5;241m▄[38;5;241;48;5;241m▄▄[38;5;241;48;5;59m▄▄[38;5;241;48;5;241m▄[38;5;59;48;5;59m▄[38;5;240;48;5;240m▄▄[38;5;59;48;5;240m▄[38;5;241;48;5;240m▄[38;5;240;48;5;59m▄▄[38;5;95;48;5;95m▄▄[38;5;240;48;5;59m▄[38;5;239;48;5;239m▄[38;5;238;48;5;238m▄[38;5;238;48;5;239m▄▄[38;5;239;48;5;240m▄[38;5;239;48;5;239m▄▄[48;5;239m [38;5;239;48;5;239m▄▄▄▄▄[48;5;239m [38;5;239;48;5;239m▄[38;5;239;48;5;238m▄[38;5;238;48;5;238m▄▄▄[38;5;239;48;5;238m▄[48;5;239m  [38;5;239;48;5;239m▄▄▄▄[m\r
[38;5;59;48;5;59m▄[38;5;59;48;5;241m▄[38;5;241;48;5;241m▄▄[38;5;242;48;5;242m▄[38;5;241;48;5;242m▄[38;5;241;48;5;241m▄▄▄▄▄[38;5;59;48;5;59m▄[38;5;241;48;5;241m▄▄▄▄▄▄▄▄[38;5;241;48;5;59m▄[38;5;101;48;5;59m▄[38;5;101;48;5;95m▄▄[38;5;240;48;5;101m▄[38;5;239;48;5;95m▄[38;5;241;48;5;241m▄[38;5;95;48;5;95m▄[38;5;240;48;5;59m▄[38;5;238;48;5;239m▄[38;5;237;48;5;238m▄[38;5;236;48;5;237m▄[38;5;235;48;5;238m▄[38;5;235;48;5;237m▄[38;5;236;48;5;237m▄[38;5;236;48;5;238m▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄▄[48;5;239m [38;5;239;48;5;239m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄▄▄▄▄▄▄▄▄▄▄[38;5;238;48;5;238m▄[m\r
[38;5;59;48;5;59m▄▄[38;5;241;48;5;241m▄[48;5;241m [38;5;241;48;5;241m▄[48;5;241m [38;5;241;48;5;241m▄▄▄▄▄[48;5;241m [38;5;241;48;5;241m▄[38;5;59;48;5;241m▄[38;5;241;48;5;241m▄▄▄▄[38;5;101;48;5;242m▄[38;5;138;48;5;243m▄[38;5;240;48;5;95m▄[38;5;238;48;5;95m▄[38;5;238;48;5;239m▄[38;5;237;48;5;237m▄[38;5;236;48;5;236m▄[38;5;236;48;5;238m▄[38;5;237;48;5;241m▄[38;5;238;48;5;240m▄[38;5;238;48;5;238m▄[38;5;239;48;5;237m▄[38;5;239;48;5;236m▄[38;5;239;48;5;235m▄▄[38;5;238;48;5;234m▄[38;5;237;48;5;234m▄[38;5;236;48;5;235m▄[38;5;236;48;5;236m▄[38;5;237;48;5;238m▄[38;5;239;48;5;239m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄▄▄▄[38;5;239;48;5;239m▄▄▄▄▄▄▄▄▄[48;5;239m [38;5;239;48;5;239m▄▄[m\r
[38;5;241;48;5;241m▄▄▄▄▄▄▄▄[48;5;241m [38;5;241;48;5;241m▄▄▄[38;5;59;48;5;59m▄[48;5;59m [38;5;241;48;5;241m▄▄[38;5;242;48;5;241m▄[38;5;138;48;5;101m▄[38;5;95;48;5;138m▄[38;5;238;48;5;95m▄[38;5;95;48;5;59m▄[38;5;180;48;5;138m▄[38;5;223;48;5;138m▄[38;5;180;48;5;95m▄[38;5;180;48;5;239m▄▄[38;5;180;48;5;95m▄[38;5;216;48;5;137m▄▄[38;5;216;48;5;174m▄▄▄▄[38;5;216;48;5;173m▄▄[38;5;180;48;5;95m▄[38;5;95;48;5;237m▄[38;5;236;48;5;236m▄[38;5;238;48;5;238m▄▄▄[38;5;239;48;5;238m▄▄[38;5;239;48;5;239m▄[48;5;239m    [38;5;239;48;5;239m▄▄▄[48;5;239m  [38;5;239;48;5;239m▄[48;5;239m  [m\r
[38;5;241;48;5;241m▄▄▄▄▄[38;5;242;48;5;241m▄[38;5;241;48;5;241m▄[48;5;241m    [38;5;241;48;5;241m▄[38;5;241;48;5;59m▄[38;5;241;48;5;241m▄[38;5;242;48;5;241m▄▄[38;5;138;48;5;101m▄[38;5;239;48;5;101m▄[38;5;236;48;5;237m▄[38;5;237;48;5;237m▄[38;5;95;48;5;95m▄[38;5;180;48;5;180m▄[38;5;223;48;5;223m▄▄▄▄▄▄[38;5;223;48;5;217m▄[38;5;223;48;5;216m▄[38;5;216;48;5;216m▄▄▄▄▄[38;5;216;48;5;180m▄[38;5;180;48;5;173m▄[38;5;95;48;5;239m▄[38;5;239;48;5;238m▄[38;5;239;48;5;239m▄▄▄▄▄▄▄▄▄▄▄▄[48;5;239m [38;5;239;48;5;239m▄▄▄▄[m\r
[38;5;241;48;5;241m▄▄▄[48;5;241m  [38;5;241;48;5;242m▄[38;5;241;48;5;241m▄▄▄▄▄▄[38;5;8;48;5;241m▄[38;5;181;48;5;8m▄[38;5;223;48;5;144m▄[38;5;224;48;5;187m▄[38;5;223;48;5;181m▄[38;5;181;48;5;95m▄[38;5;144;48;5;237m▄[38;5;240;48;5;238m▄[38;5;137;48;5;95m▄[38;5;216;48;5;216m▄[38;5;223;48;5;217m▄[38;5;180;48;5;223m▄[38;5;138;48;5;223m▄[38;5;137;48;5;223m▄[38;5;95;48;5;180m▄[38;5;95;48;5;216m▄[38;5;137;48;5;216m▄[38;5;180;48;5;216m▄▄▄▄▄▄[38;5;180;48;5;180m▄[38;5;173;48;5;173m▄[38;5;137;48;5;137m▄[38;5;238;48;5;239m▄[38;5;95;48;5;95m▄[38;5;239;48;5;239m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄[m\r
[38;5;240;48;5;59m▄▄[38;5;240;48;5;240m▄[38;5;59;48;5;59m▄[38;5;59;48;5;241m▄[38;5;241;48;5;241m▄[38;5;241;48;5;242m▄[38;5;241;48;5;241m▄▄▄▄[38;5;138;48;5;242m▄[38;5;223;48;5;180m▄[38;5;223;48;5;223m▄▄▄[38;5;181;48;5;223m▄[38;5;180;48;5;181m▄[38;5;144;48;5;180m▄[38;5;137;48;5;101m▄[38;5;180;48;5;173m▄[38;5;216;48;5;216m▄[38;5;180;48;5;180m▄[38;5;131;48;5;137m▄[38;5;95;48;5;95m▄[38;5;239;48;5;95m▄▄[38;5;239;48;5;238m▄[38;5;238;48;5;239m▄[38;5;131;48;5;137m▄[38;5;180;48;5;180m▄[38;5;174;48;5;180m▄[38;5;239;48;5;137m▄[38;5;237;48;5;95m▄▄[38;5;238;48;5;137m▄[38;5;95;48;5;173m▄[38;5;95;48;5;131m▄[38;5;237;48;5;237m▄[38;5;95;48;5;239m▄▄[38;5;59;48;5;239m▄[38;5;240;48;5;239m▄[38;5;239;48;5;239m▄▄▄▄▄▄▄▄▄▄▄▄▄[m\r
[38;5;239;48;5;239m▄[38;5;239;48;5;240m▄[38;5;240;48;5;240m▄▄[38;5;59;48;5;59m▄▄[38;5;240;48;5;59m▄[38;5;239;48;5;240m▄▄[38;5;240;48;5;59m▄[38;5;242;48;5;242m▄[38;5;180;48;5;144m▄[38;5;180;48;5;223m▄[38;5;138;48;5;180m▄▄[38;5;137;48;5;180m▄▄▄[38;5;138;48;5;138m▄[38;5;174;48;5;138m▄[38;5;180;48;5;180m▄[38;5;217;48;5;223m▄[38;5;223;48;5;223m▄[38;5;223;48;5;180m▄[38;5;180;48;5;137m▄[38;5;137;48;5;95m▄[38;5;137;48;5;239m▄[38;5;137;48;5;95m▄[38;5;174;48;5;131m▄[38;5;181;48;5;137m▄[38;5;224;48;5;223m▄[38;5;180;48;5;174m▄[38;5;239;48;5;236m▄[38;5;238;48;5;236m▄[38;5;237;48;5;237m▄[38;5;238;48;5;238m▄[38;5;95;48;5;239m▄[38;5;238;48;5;239m▄[38;5;95;48;5;238m▄[38;5;144;48;5;137m▄[38;5;144;48;5;144m▄[38;5;144;48;5;138m▄[38;5;137;48;5;241m▄[38;5;240;48;5;240m▄[38;5;240;48;5;239m▄[38;5;239;48;5;239m▄▄▄[48;5;239m [38;5;239;48;5;239m▄▄▄▄▄▄▄[m\r
[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄[38;5;239;48;5;240m▄▄▄▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄[38;5;240;48;5;240m▄[38;5;242;48;5;243m▄[38;5;144;48;5;180m▄[38;5;180;48;5;180m▄[38;5;137;48;5;138m▄[38;5;101;48;5;137m▄▄[38;5;137;48;5;137m▄[38;5;101;48;5;137m▄[38;5;137;48;5;137m▄▄[38;5;174;48;5;180m▄[38;5;216;48;5;216m▄[38;5;216;48;5;217m▄[38;5;217;48;5;223m▄[38;5;223;48;5;223m▄▄[38;5;217;48;5;216m▄[38;5;216;48;5;180m▄[38;5;223;48;5;180m▄[38;5;223;48;5;223m▄[38;5;223;48;5;224m▄[38;5;216;48;5;217m▄[38;5;174;48;5;137m▄[38;5;174;48;5;131m▄[38;5;174;48;5;95m▄▄[38;5;174;48;5;137m▄[38;5;95;48;5;239m▄[38;5;95;48;5;101m▄[38;5;137;48;5;138m▄[38;5;137;48;5;137m▄[38;5;137;48;5;138m▄[38;5;137;48;5;137m▄[38;5;95;48;5;59m▄[38;5;240;48;5;240m▄▄[38;5;239;48;5;240m▄[38;5;239;48;5;239m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄▄▄▄[38;5;238;48;5;239m▄▄▄[m\r
[38;5;238;48;5;238m▄▄▄▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄▄[38;5;239;48;5;239m▄[38;5;59;48;5;242m▄[38;5;101;48;5;138m▄▄[38;5;101;48;5;101m▄[38;5;95;48;5;95m▄[38;5;240;48;5;95m▄[38;5;239;48;5;95m▄[38;5;95;48;5;95m▄▄▄[38;5;137;48;5;173m▄[38;5;180;48;5;180m▄[38;5;174;48;5;216m▄[38;5;180;48;5;216m▄▄▄[38;5;216;48;5;216m▄[38;5;216;48;5;180m▄[38;5;137;48;5;174m▄[38;5;95;48;5;174m▄▄▄[38;5;137;48;5;174m▄[38;5;174;48;5;180m▄[38;5;180;48;5;216m▄[38;5;174;48;5;216m▄[38;5;173;48;5;174m▄[38;5;239;48;5;95m▄[38;5;95;48;5;95m▄▄[38;5;95;48;5;101m▄[38;5;95;48;5;137m▄[38;5;137;48;5;137m▄[38;5;101;48;5;101m▄[38;5;239;48;5;240m▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄[38;5;237;48;5;238m▄▄▄[38;5;237;48;5;237m▄▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄[38;5;239;48;5;238m▄[m\r
[38;5;238;48;5;238m▄▄▄▄▄▄▄▄▄▄[38;5;239;48;5;240m▄[38;5;242;48;5;95m▄[38;5;95;48;5;101m▄[38;5;239;48;5;95m▄▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;236;48;5;238m▄[38;5;237;48;5;238m▄[38;5;137;48;5;137m▄[38;5;174;48;5;180m▄[38;5;174;48;5;173m▄[38;5;180;48;5;180m▄▄[38;5;174;48;5;216m▄[38;5;174;48;5;217m▄[38;5;174;48;5;223m▄[38;5;174;48;5;180m▄[38;5;174;48;5;137m▄[38;5;95;48;5;95m▄[38;5;131;48;5;95m▄[38;5;137;48;5;137m▄[38;5;173;48;5;174m▄▄[38;5;137;48;5;173m▄[38;5;95;48;5;131m▄[38;5;237;48;5;238m▄[38;5;240;48;5;95m▄[38;5;95;48;5;95m▄▄▄[38;5;101;48;5;101m▄[38;5;95;48;5;95m▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄▄▄▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[48;5;239m [m\r
[38;5;238;48;5;238m▄▄[38;5;237;48;5;238m▄[48;5;238m [38;5;238;48;5;238m▄[38;5;239;48;5;238m▄▄▄▄▄[38;5;240;48;5;240m▄[38;5;240;48;5;59m▄[38;5;239;48;5;239m▄[38;5;238;48;5;238m▄▄[38;5;237;48;5;238m▄▄[38;5;236;48;5;237m▄[38;5;235;48;5;236m▄▄[38;5;95;48;5;95m▄[38;5;137;48;5;173m▄[38;5;173;48;5;173m▄[38;5;180;48;5;180m▄▄[38;5;180;48;5;137m▄[38;5;180;48;5;131m▄[38;5;174;48;5;131m▄[38;5;137;48;5;131m▄[38;5;131;48;5;131m▄▄[38;5;95;48;5;95m▄[38;5;95;48;5;131m▄[38;5;137;48;5;137m▄▄[38;5;131;48;5;131m▄[38;5;238;48;5;238m▄[38;5;236;48;5;237m▄[38;5;239;48;5;95m▄[38;5;95;48;5;95m▄▄▄▄[38;5;239;48;5;59m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄▄▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[38;5;239;48;5;238m▄[38;5;239;48;5;239m▄[m\r
[38;5;238;48;5;238m▄▄▄▄[38;5;239;48;5;239m▄[38;5;240;48;5;239m▄[38;5;240;48;5;240m▄[38;5;240;48;5;239m▄▄▄[38;5;239;48;5;239m▄[38;5;239;48;5;240m▄[38;5;240;48;5;240m▄[38;5;240;48;5;239m▄[38;5;240;48;5;238m▄[38;5;239;48;5;236m▄[38;5;238;48;5;236m▄[38;5;239;48;5;236m▄▄[38;5;238;48;5;236m▄[38;5;237;48;5;237m▄[38;5;239;48;5;95m▄[38;5;137;48;5;173m▄[38;5;180;48;5;180m▄[38;5;216;48;5;180m▄[38;5;223;48;5;216m▄▄[38;5;216;48;5;180m▄[38;5;216;48;5;173m▄[38;5;180;48;5;137m▄▄[38;5;173;48;5;137m▄▄[38;5;137;48;5;137m▄[38;5;131;48;5;131m▄[38;5;238;48;5;95m▄[38;5;235;48;5;236m▄[38;5;236;48;5;236m▄[38;5;236;48;5;237m▄[38;5;237;48;5;238m▄[38;5;238;48;5;239m▄[38;5;239;48;5;240m▄▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄▄▄▄▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[38;5;239;48;5;238m▄[38;5;239;48;5;239m▄▄▄[m\r
[38;5;238;48;5;238m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[38;5;239;48;5;238m▄[38;5;240;48;5;239m▄[38;5;240;48;5;240m▄[38;5;240;48;5;59m▄▄[38;5;239;48;5;240m▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄[38;5;239;48;5;240m▄[38;5;240;48;5;240m▄▄▄[38;5;238;48;5;59m▄[38;5;236;48;5;59m▄[38;5;239;48;5;239m▄[38;5;95;48;5;238m▄[38;5;238;48;5;238m▄[38;5;237;48;5;239m▄[38;5;238;48;5;137m▄[38;5;239;48;5;180m▄[38;5;137;48;5;180m▄[38;5;137;48;5;216m▄[38;5;137;48;5;180m▄▄[38;5;173;48;5;180m▄▄▄[38;5;137;48;5;173m▄[38;5;95;48;5;137m▄[38;5;240;48;5;95m▄[38;5;239;48;5;237m▄[38;5;237;48;5;235m▄[38;5;236;48;5;236m▄[38;5;237;48;5;236m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄▄▄▄[38;5;238;48;5;237m▄▄▄▄[38;5;237;48;5;237m▄[38;5;238;48;5;237m▄[38;5;239;48;5;238m▄▄▄▄▄[38;5;239;48;5;239m▄[m\r
[38;5;237;48;5;237m▄▄[38;5;238;48;5;238m▄▄[38;5;238;48;5;239m▄▄▄[38;5;239;48;5;239m▄[38;5;238;48;5;239m▄[38;5;237;48;5;238m▄▄[38;5;238;48;5;238m▄▄[38;5;238;48;5;239m▄[38;5;237;48;5;239m▄▄[38;5;235;48;5;237m▄[38;5;234;48;5;234m▄[38;5;234;48;5;235m▄[38;5;95;48;5;239m▄[38;5;137;48;5;137m▄[38;5;95;48;5;95m▄[38;5;238;48;5;238m▄[38;5;238;48;5;237m▄▄[38;5;238;48;5;238m▄[38;5;238;48;5;239m▄[38;5;238;48;5;95m▄▄▄▄[38;5;239;48;5;95m▄[38;5;237;48;5;95m▄[38;5;234;48;5;239m▄[38;5;237;48;5;240m▄[38;5;239;48;5;239m▄[48;5;239m [38;5;239;48;5;239m▄▄[38;5;239;48;5;238m▄[38;5;238;48;5;238m▄▄▄▄▄▄▄▄[38;5;238;48;5;239m▄▄[38;5;238;48;5;240m▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄[38;5;238;48;5;239m▄[m\r
[38;5;237;48;5;237m▄▄▄[38;5;238;48;5;238m▄[38;5;237;48;5;237m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄▄[38;5;237;48;5;237m▄▄[38;5;236;48;5;236m▄▄[38;5;234;48;5;234m▄[38;5;233;48;5;233m▄[38;5;236;48;5;235m▄[38;5;137;48;5;95m▄[38;5;137;48;5;137m▄▄[38;5;95;48;5;239m▄[38;5;238;48;5;238m▄▄▄[38;5;239;48;5;238m▄▄[38;5;95;48;5;239m▄▄[38;5;95;48;5;95m▄▄[38;5;236;48;5;237m▄[38;5;232;48;5;233m▄[38;5;232;48;5;234m▄[38;5;234;48;5;237m▄[38;5;238;48;5;239m▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄▄▄[38;5;238;48;5;238m▄▄▄▄[38;5;238;48;5;237m▄[38;5;237;48;5;237m▄▄▄[38;5;237;48;5;238m▄▄[38;5;238;48;5;238m▄▄▄[48;5;238m [m\r
[38;5;238;48;5;237m▄▄▄[38;5;238;48;5;238m▄▄▄▄▄▄▄[38;5;237;48;5;237m▄▄▄▄[38;5;237;48;5;236m▄[38;5;236;48;5;236m▄[38;5;235;48;5;234m▄▄[38;5;95;48;5;239m▄[38;5;137;48;5;137m▄▄▄▄[38;5;95;48;5;95m▄[38;5;238;48;5;238m▄▄[38;5;239;48;5;239m▄[38;5;95;48;5;95m▄▄▄▄[38;5;239;48;5;95m▄[38;5;234;48;5;235m▄[38;5;232;48;5;232m▄▄[38;5;232;48;5;233m▄[38;5;234;48;5;236m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄[48;5;238m [38;5;238;48;5;238m▄▄[38;5;237;48;5;238m▄▄▄▄[38;5;237;48;5;237m▄▄▄▄▄▄▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄[48;5;238m [m\r
[38;5;238;48;5;238m▄[38;5;238;48;5;237m▄[38;5;238;48;5;238m▄[38;5;239;48;5;238m▄▄▄▄▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;236;48;5;237m▄[38;5;236;48;5;236m▄▄[38;5;236;48;5;237m▄[38;5;236;48;5;236m▄▄[38;5;235;48;5;235m▄▄[38;5;95;48;5;95m▄[38;5;137;48;5;137m▄▄▄▄▄[38;5;95;48;5;95m▄[38;5;239;48;5;238m▄[38;5;239;48;5;239m▄[38;5;239;48;5;95m▄[38;5;95;48;5;95m▄▄[38;5;239;48;5;95m▄[38;5;238;48;5;238m▄[38;5;233;48;5;233m▄[38;5;232;48;5;232m▄▄[38;5;233;48;5;232m▄[38;5;233;48;5;233m▄[38;5;233;48;5;234m▄[38;5;233;48;5;235m▄[38;5;235;48;5;238m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄▄[48;5;237m [38;5;237;48;5;237m▄▄▄▄▄▄▄▄▄▄[38;5;238;48;5;238m▄▄[m\r
[38;5;137;48;5;239m▄[38;5;101;48;5;240m▄[38;5;137;48;5;239m▄[38;5;101;48;5;239m▄[38;5;95;48;5;239m▄[38;5;59;48;5;239m▄[38;5;238;48;5;239m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄[38;5;236;48;5;237m▄[38;5;235;48;5;236m▄[38;5;234;48;5;235m▄[38;5;235;48;5;236m▄▄▄[38;5;235;48;5;235m▄▄▄[38;5;239;48;5;95m▄[38;5;95;48;5;137m▄▄▄▄▄[38;5;95;48;5;95m▄▄[38;5;239;48;5;239m▄▄[38;5;238;48;5;239m▄▄[38;5;238;48;5;238m▄[38;5;236;48;5;237m▄[38;5;233;48;5;233m▄[38;5;232;48;5;232m▄▄[48;5;233m [38;5;232;48;5;233m▄[38;5;233;48;5;233m▄▄[38;5;233;48;5;234m▄[38;5;234;48;5;234m▄[38;5;234;48;5;236m▄[38;5;235;48;5;238m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄▄[38;5;238;48;5;237m▄[38;5;237;48;5;237m▄▄▄▄▄▄[38;5;238;48;5;238m▄▄▄[m\r
[38;5;137;48;5;137m▄[38;5;101;48;5;137m▄[38;5;95;48;5;137m▄[38;5;239;48;5;137m▄[38;5;238;48;5;95m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄▄▄[38;5;236;48;5;236m▄▄[38;5;235;48;5;234m▄[38;5;233;48;5;234m▄▄[38;5;234;48;5;234m▄▄▄▄[38;5;235;48;5;236m▄[38;5;238;48;5;95m▄[38;5;95;48;5;95m▄▄▄▄[38;5;239;48;5;95m▄[38;5;238;48;5;239m▄[38;5;238;48;5;238m▄▄▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄[38;5;236;48;5;236m▄[38;5;233;48;5;233m▄[38;5;232;48;5;232m▄▄[38;5;233;48;5;233m▄[38;5;233;48;5;232m▄[38;5;233;48;5;233m▄▄[38;5;234;48;5;233m▄[38;5;234;48;5;234m▄▄▄[38;5;234;48;5;235m▄[38;5;234;48;5;236m▄[38;5;235;48;5;237m▄[38;5;236;48;5;237m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄▄[38;5;238;48;5;237m▄[38;5;237;48;5;237m▄[38;5;238;48;5;238m▄▄▄[48;5;238m [m\r
[38;5;239;48;5;95m▄[38;5;238;48;5;240m▄[38;5;238;48;5;238m▄▄[38;5;237;48;5;238m▄[48;5;237m [38;5;237;48;5;237m▄▄▄[38;5;236;48;5;236m▄[38;5;235;48;5;236m▄[38;5;234;48;5;234m▄[38;5;234;48;5;233m▄[38;5;233;48;5;233m▄▄[38;5;233;48;5;234m▄[38;5;233;48;5;233m▄[38;5;233;48;5;234m▄[38;5;234;48;5;234m▄[38;5;234;48;5;235m▄[38;5;237;48;5;95m▄[38;5;95;48;5;95m▄▄▄[38;5;95;48;5;239m▄[38;5;239;48;5;238m▄[38;5;238;48;5;238m▄[38;5;237;48;5;238m▄[38;5;237;48;5;237m▄▄[38;5;238;48;5;237m▄[38;5;236;48;5;237m▄[38;5;232;48;5;232m▄[38;5;0;48;5;232m▄[38;5;232;48;5;232m▄[38;5;233;48;5;233m▄[38;5;234;48;5;233m▄[38;5;234;48;5;234m▄[38;5;233;48;5;233m▄[38;5;233;48;5;234m▄[38;5;234;48;5;234m▄[38;5;234;48;5;235m▄▄[38;5;234;48;5;234m▄[48;5;234m [38;5;234;48;5;234m▄▄[38;5;234;48;5;235m▄[38;5;235;48;5;236m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄▄▄▄▄▄[m\r
[38;5;236;48;5;238m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄[38;5;238;48;5;237m▄[38;5;237;48;5;237m▄▄▄[38;5;234;48;5;237m▄[38;5;235;48;5;235m▄[38;5;236;48;5;235m▄[38;5;236;48;5;236m▄[38;5;235;48;5;235m▄[38;5;234;48;5;234m▄[38;5;235;48;5;235m▄[38;5;233;48;5;232m▄[38;5;232;48;5;233m▄[38;5;233;48;5;233m▄▄[38;5;233;48;5;234m▄[38;5;233;48;5;233m▄[38;5;233;48;5;234m▄[38;5;234;48;5;239m▄[38;5;237;48;5;95m▄[38;5;95;48;5;95m▄▄▄[38;5;95;48;5;239m▄[38;5;95;48;5;238m▄[38;5;239;48;5;237m▄[38;5;95;48;5;238m▄[38;5;237;48;5;238m▄[38;5;234;48;5;235m▄[38;5;232;48;5;232m▄[38;5;232;48;5;0m▄[38;5;232;48;5;232m▄[38;5;233;48;5;233m▄[38;5;234;48;5;234m▄▄▄[38;5;232;48;5;233m▄[38;5;234;48;5;234m▄▄[38;5;233;48;5;234m▄[38;5;234;48;5;234m▄▄▄[38;5;235;48;5;235m▄[38;5;234;48;5;235m▄[38;5;234;48;5;234m▄[38;5;235;48;5;236m▄[38;5;237;48;5;238m▄[38;5;238;48;5;238m▄▄▄▄▄[m\r`
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



const program = blessed.program()
program.cursorColor('000000')
const screen = blessed.screen({
	program: program,
	fastCSR: true,
	dockBorders: true,
	fullUnicode: true,
	cursor: {
		shape: {
			bg: 'red',
			fg: 'white',
		},
		blink: false
	}
});
screen.title = '~game~';
screen.program.hideCursor(true);
const grid = new BlessedContrib.grid({ rows: 12, cols: 12, screen: screen })
const XTermTestv2 = new XTermNew({
	top: 0,
	bottom: 0,
	width: '50%',
	align: 'left',
	tags: true,
	keys: true,
	mouse: true,
	border: 'line',
	style: {
		label: { bold: true },
		focus: { border: { fg: "green" } }
	},
	scrollbar: {
		ch: ' ',
		style: { bg: 'white' },
		track: {
			style: { bg: 'grey' },
		},
	},
}).with(scroll.scroll, scroll.throttle)
screen.append(XTermTestv2)
const logs = new XTermNew({
	top: '50%',
	bottom: 0,
	left: '50%',
	width: '50%',
	align: 'left',
	tags: true,
	keys: true,
	mouse: true,
	border: 'line',
	style: {
		label: { bold: true },
		focus: { border: { fg: "green" } }
	},
	scrollbar: {
		ch: ' ',
		style: { bg: 'white' },
		track: {
			style: { bg: 'grey' },
		},
	},
}).with(scroll.scroll, scroll.throttle)
screen.append(logs)
const stats = grid.set(0, 9, 6, 1, blessed.box, {
	tags: true,
	padding: {
		left: 1,
	},
	label: '{bold}stats{/bold}',
	alwaysScroll: 'true',
	scrollable: 'true',
	scrollbars: 'true',
	scrollbar: {
		ch: ' ',
		track: {
			bg: 'blue'
		},
		style: {
			inverse: true
		}
	},
	keys: true,
	border: {
		type: 'line'
	},
	style: {
		border: {
			fg: '#f0f0f0'
		},
		hover: {
			//bg: 'green'
		},
		focus: { border: { fg: "green" } }
	}

}
).with(scroll.scroll, scroll.throttle)
//in the future will list inventory items
const actions = grid.set(0, 10, 6, 2, blessed.list, {
	tags: true,
	scrollable: true,
	mouse: true,
	keys: true,
	label: '{bold}actions{/bold}',
	content: 'thing',
	border: {
		type: 'line'
	},
	style: {
		border: {
			fg: 'magenta'
		},
		hover: {
			//bg: 'green'
		},
		focus: { border: { fg: "green" } }
	}
})
//button container
const form_thing = grid.set(0, 6, 6, 3, blessed.form, ({
	parent: screen,
	keys: true,
	label: `choose ~ ${chalk.green('w s')} to scroll`,
	//content: 'test?',
	padding: {
		right: 0,
	},
	style: {
		//bg: '#515151',
		//border: {
		//bg: '#000033'},
		focus: { border: { fg: "green" } }
	},
	alwaysScroll: 'true',
	scrollable: 'true',
	scrollbars: 'true',
	scrollbar: {
		ch: chalk.green.bgBlueBright('\u2592'),
		track: {
			bg: '#630330',
			fg: 'red'
		},
		style: {
			inverse: true
		}
	}
})).with(scroll.scroll, scroll.throttle)
let box = createStatsBox()
//stats box
function createStatsBox() {
	return blessed.box({
		parent: screen,
		top: 'center',
		left: 'center',
		width: '40%',
		height: 10,
		tags: true,
		keys: true,
		content: '{bold}hmm{/bold}!',
		border: {
			type: 'line'
		},
		style: {
			fg: 'white',
			//bg: 'magenta',
			border: {
				//fg: '#4b0082',
				//bg: '#4b0082',
			},
			hover: {
				bg: 'green'
			}
		}
	});
}


//test button declarations
let button1 = blessed.button({
	parent: form_thing,
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

let button2 = blessed.button({
	parent: form_thing,
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

let button3 = blessed.button({
	parent: form_thing,
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

let button4 = blessed.button({
	parent: form_thing,
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
	buttonsArray.forEach((element) => { element.width = form_thing.width - 5 })
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
// handling creating of buttons from an event. writing body etc
// event reader
// multiple functions, exuction may differ based on event type
// messy, remove redundant code in future
// the resize button cannot get a valid height and crashes on screen resize
// if i attempt to remove all mentions of buttonsArray
function clearButtons() {
	buttonsArray.forEach((element) => { form_thing.remove(element); element.destroy() })
	buttonsArray = []
}
async function createButtons(gameEvent, storyObj = {}) {
	eventHandler(gameEvent)
	await waitForClear();
	if (death){
		reset()
		return 0
	}
	gameEvent['buttons'].forEach(item => {
		let temp = new blessed.button({
			parent: form_thing,
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
		temp.on('press', function () {
			clearButtons()
			form_thing.setContent('')
			screen.render();
			createButtons(storyObj[item[0]], storyObj);
			resizeButtons();
			stats.focus();
			screen.render();

		})
	})
	resizeButtons()
}
// basically to map event to a object using the event id as a key, 
// this is so that events can be looked up by button param then loaded
// idea is for events eventually to be read from a json file
function createEventsMap(eventsArrary = [], storyArr = {}) {
	eventsArrary.forEach((element) => {
		storyArr[element.id] = element
	})
}
//return maybe idek
// reads event package and sees which buttons to create only called after a combat
function EPcontiansCombat(eventPackage) {
	let events = eventPackage.eventsMap()
	for (const [key, value] of Object.entries(events)) {
		console.log(key, value);
	}
}
function eventPackageButtons(eventPackage){

}

//sloppy but easy way to make it work
async function eventHandler(gameEvent = temp_event1,) {
	//
	// WRITE EVENT PACKAGE HANDLING CODE
	// probably easier to do recursively?
	//
	XTermTestv2.term.clear()
	XTermTestv2.term.reset()
	rollLog(logs)
	let gb = gameEvent.body
	let gbf = gb.format
	//make enum thing later
	XTermTestv2.writeSync(gameEvent.toScreen.toScreen)
	if (gbf.writeMode === 'gradientScanlines') {
		await (gradient_scanlines(logs, gb.body, gbf.speed, gbf.gradientFunction, gbf.gradientArr))
	}
	form_thing.setContent(` ${chalk.bold.yellow(gameEvent['buttons'].length.toString()) + " " + chalk.bold.greenBright("choices")}`)


	if (gameEvent instanceof (game_event_enemy)) {
		combat(gameEvent)
		//await something
	} else if (gameEvent instanceof (game_event_gain_item)) {

	} else {
		// test code
		combat(gameEvent)
	}

	await (waitForCombat())
	//rollLog(XTermTestv2)
	//XTermTestv2.writeSync("DEATH"+ death)
	// extend somehow to rest later
	if(death===false){
		await new Promise(r => setTimeout(r, 500));
		await (gradient_scanlines(logs, gb.body, gbf.speed, gbf.gradientFunction, gbf.gradientArr))
		logs.writeSync(`${escLeftByNum(20)}${chalk.yellow(`-`.repeat(logs.term.cols - 1))}\n`);
	}
	resolver()
}


function kill(){
	clearButtons()
	death = true;
	encounterResolver()
}

// resume execution after combat 
// enounter clear promise/event package clear promise
let waitForClearResolve
function waitForClear() {return new Promise((resolve) => {waitForClearResolve = resolve})}
function resolver() {if (waitForClearResolve) {waitForClearResolve()}}
//combat promise
let waitForCombatResolve
function waitForCombat() {return new Promise((resolve) => {waitForCombatResolve = resolve});}
function encounterResolver() {if (waitForCombatResolve) waitForCombatResolve()}


async function combat(combatEvent) {
	form_thing.setContent('')
	logs.writeSync(escUpByNum(1))
	logs.writeSync(`\n${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}`);
	logs.writeSync(`\n${chalk.yellow(`Combat Start!`)}`);
	logs.writeSync(`\n${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}\n`);
	let hostile = true
	if (!hostile) {
		//provoke or somthing
		return 0
	}
	let monster = copyMonster(tempMonster)
	combatLogic(monster,thePlayer,true)

}
// moster picker in random event later
async function enemyAtack(monster,player,first=false) {
	if(!first){
		logs.writeSync(`\n${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}`);
	}
	await new Promise(resolve => setTimeout(resolve, 300))
	logs.writeSync(chalk.red(`${!first?`\n`:``}${monster.name} attacks you with ${monster.weapon}!`))
	if (monster.rollToHit() >= player.ac) {
		let monsterDamage = monster.rollDamage()
		//await new Promise(resolve => setTimeout(resolve, 100))
		logs.writeSync(chalk.red(`\n${monster.name} hits you for ${monsterDamage} damage!\n`))
		player.hp -= monsterDamage
		refreshStats(player)
		if(player.hp<=0){
			logs.writeSync(chalk.red(`${escLeftByNum(3)}${monster.name} kills you!\n`))
			await new Promise(resolve => setTimeout(resolve, 2000))
			kill()
		}
		// add call to game over function
	} else {
		//await new Promise(resolve => setTimeout(resolve, 100))
		logs.writeSync(chalk.red(`\n${monster.name} misses you!${'\n'}`))
	}
	if(first){
		logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`);
	}
}

function clearCombat(logs){
	clearButtons();
	encounterResolver()
	logs.writeSync(`\n${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}`);
	logs.writeSync(`\n${chalk.yellow(`You defeated the enemy!`)}`);
	logs.writeSync(`\n${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}\n`);
}



async function combatLogic(monsterCopy /*make into enemy*/, player = thePlayer, firstLoop=true) {
	let monster = monsterCopy
	let playerWonInitiative = false
	if (firstLoop){
		let player_initiative = player.rollInitiative()
		let monster_initiative = monster.rollInitiative()
		logs.writeSync(`Monster init${chalk.red(monster_initiative)} Player init${chalk.blue(player_initiative)}\n`)
		if (monster_initiative > player_initiative) {
			await enemyAtack(monster,player,true)
		}else{
			playerWonInitiative = true
		}
	}
	createCombatButtons()
	combatButtonsMap['attack'].on('press', async () => {
		if((logs.term.rows-2)<=logs.term.buffer.active.cursorY){
			logs.writeSync(escUpByNum(1))
			rollLog(logs)
		}
		clearButtons();
		logs.writeSync(chalk.greenBright(`${escLeftByNum(2)}You attack the enemy with your ${player.weaponName.toLowerCase()}!`));
		let TOHIT = player.rollToHit()
		if (TOHIT >= monster.ac) {
			let playerDamage = player.rollDamage()
			monster.hp -= playerDamage
			logs.writeSync(chalk.greenBright(`\nYou hit for ${playerDamage} damage!     ___DEBUGenemyhp=${monster.hp}`));
		} else {
			logs.writeSync(chalk.greenBright(`\nYou miss!    ____DEBUGenemyhp=${monster.hp}`));
		}
		if (monster.hp <= 0) {
			await new Promise(resolve => setTimeout(resolve, 100))
			clearCombat(logs)
		} else {
			await new Promise(resolve => setTimeout(resolve, 50))
			await enemyAtack(monster,player)
			logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`);
			combatLogic(monster, player, false)
		}
	})
	combatButtonsMap['flee'].on('press', async () => {
		let dexSave=player.rollSkillCheck(player.dex)
		if(dexSave>=10 + monster.hitDie){
			logs.writeSync(`${!playerWonInitiative&&firstLoop?escUpByNum(1)+'\r':''}${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}\n`);
			logs.writeSync(`${chalk.yellow(`You escaped through a random tunnel`)}\n`);
			logs.writeSync(`${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}\n`);
			// random deeper or surface
			clearButtons();
			encounterResolver()
		}
		else{
			clearButtons();
			if(playerWonInitiative&&firstLoop){
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			}else if(!firstLoop){
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			}

			logs.writeSync(`${chalk.yellow(`${monster.name} prevented your escape!`)}`);
			await enemyAtack(monster,player)
			combatLogic(monster, player, false)
		}
	})
	// combatButtonsMap['chatUp'].on('press', async () => {
	// 	clearButtons();
	// 	if(playerWonInitiative&&firstLoop){
	// 		logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
	// 	}else if(!firstLoop){
	// 		logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
	// 	}
	// })

	if('potion' in combatButtonsMap){
		combatButtonsMap['potion'].on('press', async () => {
			let heal=chance2.rpg('2d4', {sum: true})+4
			clearButtons();
			if(playerWonInitiative&&firstLoop){
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			}else if(!firstLoop){
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			}
			logs.writeSync(thePlayer.hp+" "+thePlayer.hpMax)
			if((thePlayer.hp+heal)>thePlayer.hpMax){
				logs.writeSync(`${chalk.yellow(`AAAAAAA You drink a potion! you heal for ${thePlayer.hpMax-thePlayer.hp} hp!`)}`);
			}else{
				logs.writeSync(`${chalk.yellow(`BBBBBBB You drink a potion! you heal for ${heal} hp!`)}`);
			}
			thePlayer.increaseHP(heal)
			thePlayer.potions--
			refreshStats()
			await enemyAtack(monster,player)
			if(player.potions<1){combatButtonsMap['potion'].destroy()}
			screen.render()
			combatLogic(monster, player, false)
		})
	}
	if('oil' in combatButtonsMap){
		combatButtonsMap['oil'].on('press', async () => {
			let damage = chance2.rpg('4d6', {sum: true})+4
			clearButtons();
			if(playerWonInitiative&&firstLoop){
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			}else if(!firstLoop){
				logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`)
			}
			logs.writeSync(`${chalk.yellow(`You throw oil on the enemy! dealing 4d6+4:${damage} fire damage!`)}`);
			monster.hp-=damage
			thePlayer.oil--
			await new Promise(resolve => setTimeout(resolve, 100))
			if (monster.hp <= 0) {
				await new Promise(resolve => setTimeout(resolve, 100))
				clearCombat(logs)
			} else {
				await enemyAtack(monster,player)
				await new Promise(resolve => setTimeout(resolve, 50))
				combatLogic(monster, player, false)
			}
		})
	}



	//generate listener for potion button if potions button exists
}


function createCombatButtons() {
	clearButtons()
	combatButtonsMap = {}
	let cbt=combatButtonsMap
	let attack = new blessed.button({
		parent: form_thing,
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
		content: `${chalk.bold.white('attack ')}${chalk.bold.green(thePlayer.weapon)}${thePlayer.basedamage<0?chalk.bold.white(' - '):chalk.bold.white(' + ')}${chalk.bold.white(Math.abs(thePlayer.basedamage))}`, //maybe add damage die
		//shadow: true,
		style: {
			bg: 'red',
			focus: {
				bg: '#ECE81A',
			},
			hover: {
				bg: '#ECE81A',
			},
		},
	})
	cbt[attack.name] = attack
	let flee = new blessed.button({
		parent: form_thing,
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
		content: `flee ${thePlayer.dex > -1 ? chalk.bold.greenBright('dex check') : chalk.bold.redBright('dex check')}`,
		//shadow: true,
		style: {
			bg: '#880808',
			focus: {
				bg: '#ECE81A',
			},
			hover: {
				bg: '#ECE81A',
			},
		},
	})
	cbt[flee.name] = flee
	let chatUp = new blessed.button({
		parent: form_thing,
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
			bg: '#880808',
			focus: {
				bg: '#ECE81A',
			},
			hover: {
				bg: '#ECE81A',
			},
		},
	})
	cbt[chatUp.name] = chatUp
	let potion
	if(thePlayer.potions>0){
		potion = new blessed.button({
			parent: form_thing,
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
				bg: thePlayer.potions>0?'#880808':'#5A5A5A',
				focus: {
					bg: '#ECE81A',
				},
				hover: {
					bg: '#ECE81A',
				},
			},
		})
		cbt[potion.name] = potion
	}
	let oil
	if(thePlayer.oil>0){
		oil = new blessed.button({
			parent: form_thing,
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
				bg: thePlayer.oil>0?'#880808':'#5A5A5A',
				focus: {
					bg: '#ECE81A',
				},
				hover: {
					bg: '#ECE81A',
				},
			},
		})
		cbt[oil.name] = oil
	}
	for (const key in cbt) {
		buttonsArray.push(cbt[key])
	}
	resizeButtons()
	stats.focus()
	screen.render()
}
//CSI (Control Sequence Introducer) sequences TEST ~ will be used to animate in the future
//test async
//test code escape sequences \033[D\033[D\033[D. maybe use  char
// "\033[F" – move cursor to the beginning of the previous line
//
//
//DONT USE M TO SCROLL UP
//up - "\033[A"
//down - "\033[B"
//left - "\033[D"
//right - "\033[C"
// let scrollPosition = 0;
// XTermTestv2.term.onScroll((apple) => { scrollPosition = apple.valueOf() })
//
//  TERMINAL WRITE FUNCTIONS
//  MOVE TO SEPERATE FILE LATER
//
function escLeftByNum(num) { return `[${num}D` }
function escRightByNum(num) { return `[${num}C` }
function escUpByNum(num) { return `[${num}A` }
function escDownByNum(num) { return `[${num}B` }
function findCursor(terminal = XTermTestv2) { return [terminal.term.buffer.active.cursorX, terminal.term.buffer.active.cursorY] }
function goToTermPosStr(arr1, terminal = XTermTestv2) {
	let arr2 = findCursor(terminal)
	let Xpos = arr1[0] - arr2[0]
	let Ypos = arr1[1] - arr2[1]
	let escHorizontalChars = Xpos >= 0 ? escRightByNum(Xpos) : escLeftByNum(Math.abs(Xpos))
	let escVerticalChars = (Ypos >= 0) ? escDownByNum(Ypos) : escUpByNum(Math.abs(Ypos))
	return `${escHorizontalChars}${escVerticalChars}`
}
async function slowWrite(str = '', terminal, speed) {
	str.replace(/\n+/g, ' ')
	str.replace(/\r+/g, ' ')
	let strArr = str.split(' ')
	for (let [index, tempStr] of strArr.entries()) {
		tempStr += ' '
		let cursorX = terminal.term.buffer.active.cursorX;
		let tempStrLength = tempStr.length
		let numCols = terminal.term.cols
		if (index === 0) {1
		}
		else if (index === strArr.length - 1) {1
		}
		if (cursorX === (numCols - 1)) {1
		}
		if (1 + cursorX + tempStrLength <= numCols) {
			terminal.writeSync(chalk.hex('909090')(tempStr))
			await new Promise(resolve => setTimeout(resolve, speed));
			terminal.writeSync(`${escLeftByNum(tempStrLength)}${chalk.hex('FFFFFF')(tempStr)}`)
			await new Promise(resolve => setTimeout(resolve, speed));
			//unwrite then rewrite diff color
		} else {
			// check how scrolling affects logged cursor positions and if it should decrement Y position
			terminal.writeSync(`\n${chalk.hex('909090')(tempStr)}`)
			await new Promise(resolve => setTimeout(resolve, speed));
			terminal.writeSync(`${escLeftByNum(tempStrLength)}${chalk.hex('FFFFFF')(tempStr)}`)
			await new Promise(resolve => setTimeout(resolve, speed));
		}
	}
}

function fitLines(str = '', cols = 0) {
	//various checks for characters that screw up the line wrapping
	// regex screws up apostrophes
	let strArr = str.split('\n')
	strArr = strArr.filter(n => n)
	strArr = strArr.join(' ')
	strArr = strArr.replace(/ +(?= )/g, '');
	strArr = strArr.split(' ');
	strArr = strArr.filter(n => n)
	let R = lodashC(strArr)
	let K = []
	for (let i = 0; i < R.length; i++) {
		if (typeof R[i] === 'string' || R[i] instanceof String) {
			K.push(R[i].concat(' '))
		}
	}
	let lines = []
	let rollingCount = 0
	let line = []
	for (let item of K) {
		rollingCount += item.length
		if (rollingCount > cols) {
			if (rollingCount - 1 === cols) {
				line[line.length - 1] = line[line.length - 1].slice(0, -1)
			}
			lines.push(line)
			rollingCount = item.length
			line = []
			if (item) {
				line.push(item)
			}
		} else {
			if (item) {
				line.push(item)
			}// later move to top to be more efficient
		}
	}
	lines.push(line)
	return lines
}
//doesn't change array length unlike normal shift method
function shiftArray(arr = [1, 2, 3, 4, 5], end = '', populate = true, populateArray = ['h', 'i', 'j', 'k', 'l',]) {
	let retVal = arr[0]
	for (let i = 0; i < arr.length - 1; i++) {
		arr[i] = arr[i + 1]
	}
	arr[arr.length - 1] = populate ? shiftArray(populateArray, end, false) : end
	return retVal
}

function mapTextPosition(textArr) {
	let lines = textArr;
	for (let y = 0; y < lines.length; y++) {
		for (let x = 0; x < lines[y].length; x++) {
			lines[y][x] = [lines[y][x], x, y]
		}
	}
}

function rollLog(terminal = XTermTestv2) {
	//set scroll to bottom
	terminal.term.scrollToBottom()
	let scrollAmount = terminal.term.buffer.active.cursorY + 1
	// \ after \r to escape the hidden newline character
	terminal.writeSync(`${escDownByNum((terminal.term.rows - 1) - terminal.term.buffer.active.cursorY)}\r\
  ${`\n`.repeat(scrollAmount)}${escUpByNum(terminal.term.rows - 1)}`)
}

async function scanlines(terminal = XTermTestv2, text = '', speed = 5, colorArr = []) {
	colorArr = colorArr ? colorArr : ['93CAED', 'ee82ee', '4b0082', '0000ff', '008000', 'ffff00', 'ffa500', 'ff0000']
	let lines = fitLines(text, terminal.term.cols)
	let arr2 = Array(colorArr.length).fill('')
	let cursorPos = 1
	let arr = arr2.map((content, index, arr) => { arr[index] = [cursorPos, content] })
	for (let line of lines) {
		for (let i = 0; i < line.length + arr.length - 1; i++) {
			shiftArray(arr, '', true, line)
			shiftArray(arr2, ['', '',], false)
			arr2[arr2.length - 1] = [cursorPos, arr[arr.length - 1]]
			for (let i = arr.length - 1; i > - 1; i--) {
				if (arr2[i][0]) {
					terminal.writeSync(`[${arr2[i][0]}G${chalk.hex(colorArr[i])(arr2[i][1])}`)
					await new Promise(resolve => setTimeout(resolve, speed))
				}
			}
			cursorPos = cursorPos += arr[arr.length - 1].length
		}
		terminal.writeSync('\n')
		cursorPos = 1
	}
}

async function gradient_scanlines(terminal = XTermTestv2, text = "", speed = 5, gradientFunction, colorArr = []) {
	let multiline = ``
	let lorem_lines = fitLines(text, terminal.term.cols - 1)
	for (let line of lorem_lines) {
		let line_str = line.join('')
		if (line_str) {
			line_str = line_str.concat('\n')
		}
		multiline = multiline.concat(line_str)
	}
	multiline = gradientFunction(multiline)
	let cleaned = ''
	let cleanUp = fitLines(text, terminal.term.cols - 1)
	for (let line of cleanUp) {
		let line_str = line.join('')
		if (line_str) {
			line_str = line_str.concat('\n')
		}
		cleaned = cleaned.concat(line_str)
	}
	let strArr = multiline.split("\n");
	let strArr2 = cleaned.split("\n");
	for (let i = 0; i < strArr.length; i++) {
		strArr[i] = strArr[i].split(" ")
		strArr2[i] = strArr2[i].split(" ")
	}
	let temp_arr = JSON.parse(JSON.stringify(strArr2))
	mapTextPosition(temp_arr)
	//effectivelly ignores first element of array so must compensate for that
	colorArr = colorArr ? [colorArr[0], ...colorArr] : ['ffffff', 'ffffff', 'ee82ee', '4b0082', '0000ff', '008000', 'ffff00', 'ffa500', 'ff0000']
	let gradient_text = strArr;
	let lines = temp_arr;
	let arr2 = Array(colorArr.length).fill('')
	let cursorPos = 1
	//add 2d array word position
	let arr = arr2.map((content, index, arr) => { arr[index] = [cursorPos, content, 0/*XposArr*/, 0/*YposArr*/] })
	for (let line of lines) {
		for (let [index, word] of line.entries()) {
			if (line[index] !== line[-1]) {
				line[index][0] = word[0].concat(' ')
			}
		}
	}
	for (let line of gradient_text) {
		for (let [index, word] of line.entries()) {
			if (line[index] !== line[-1]) {
				line[index] = word.concat(' ')
			}
		}
	}
	for (let x = 0; x < lines.length; x++) {
		let line = lines[x]
		for (let i = 0; i < line.length + arr.length - 1; i++) {
			shiftArray(arr, '', true, line)
			shiftArray(arr2, ['', '', 0, 0,], false)
			arr2[arr2.length - 1] = [cursorPos, arr[arr.length - 1]]
			for (let i = arr.length - 1; i > - 1; i--) {
				if (!(i === 0)) {
					if (arr2[i][0]) {
						if (arr2[i][1][0]) terminal.writeSync(`[${arr2[i][0]}G${chalk.hex(colorArr[i])(arr2[i][1][0])}`);
						await new Promise(resolve => setTimeout(resolve, speed))
					}
				} else if (i === 0) {
					if (arr2[i][0]) {
						if (arr2[i][1][0]) terminal.writeSync(`[${arr2[i][0]}G${gradient_text[arr2[i][1][2]][arr2[i][1][1]]}`);
						await new Promise(resolve => setTimeout(resolve, speed))
					}
				}
			}
			try {
				cursorPos = cursorPos += arr[arr.length - 1][0].length
			} catch (error) {
				cursorPos = cursorPos += 0
			}
		}
		if (!(x === lines.length - 1)) terminal.writeSync('\n');
		cursorPos = 1

	}
}
//
//  TERMINAL WRITE FUNCTIONS
//  END OF SECTION
//
//ESC[?25l	make cursor invisible
//ESC[?25h	make cursor visible
//
//double check cursor is disabled on all subterminals and main one

function toggleUi() {
	form_thing.toggle()
	XTermTestv2.toggle()
	logs.toggle()
	stats.toggle()
	actions.toggle()
}
function toggleButtons() {
	form_thing.toggle()
}

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
		`{bold}${chalk.red("HP ")}{/bold} = ${thePlayer.hp}
{bold}${chalk.green("AC ")}{/bold} = ${thePlayer.ac}
${chalk.yellowBright('str')} = ${thePlayer.str}
${chalk.grey('int')} = ${thePlayer.int}
${chalk.hex('000080')('dex')} = ${thePlayer.dex}
${chalk.hex('630330')('cha')} = ${thePlayer.cha} 
${chalk.magenta("dmg")} = ${thePlayer.basedamage}
${chalk.magenta("mag")} =`)
	screen.render()
}
function creatething(){
	box.key('enter', function () {
		toggleUi()
		box.hide()
		box.destroy()
		box=null
		screen.render()
		resolver()
	})
	box.on('click', function () {
		toggleUi()
		box.hide()
		box.destroy()
		box=null
		screen.render()
		resolver()
	})
}
async function reset(){
	resetRandoms()
	death = false
	thePlayer = thePlayer.rollNewPlayer()
	refreshStats(thePlayer)
	clearButtons()
	logs.reset()
	XTermTestv2.reset()
	toggleUi()
	screen.render()
	box = createStatsBox()
	screen.append(box)
	screen.render()
	box.setContent('')
	await(fillStatsRollBox(40,thePlayer,box))
	creatething()
	await waitForClear();
	//sample start code
	// buttonsArray.forEach((button) => { form_thing.remove(button); button.destroy() })
	// buttonsArray = [];
	stats.focus();
	XTermTestv2.term.reset()
	createButtons(temp_event1, story);
	form_thing.setContent(` ${chalk.bold.yellow(buttonsArray.length.toString()) + " " + chalk.bold.greenBright("choices")}`)
	resizeButtons();
	stats.focus();
	
}
//reminder how to convert ansi art to utf8
//run script on cmder to convert my ansi art to utf8
//ansiart2utf8 mountain.ans > sometext.txt
//XTermTestv2.write(mountain)
//Listeners for test buttons
button1.on('press', function () {
	form_thing.setContent('Canceled.');
	XTermTestv2.term.clear();
	XTermTestv2.term.reset();
	XTermTestv2.writeSync(caleb);
	screen.render();
});
button2.on('press', function () {
	//logs.setContent(chalk.bgMagenta.blueBright("lolololololololollolololololololol"))
	XTermTestv2.term.clear()
	XTermTestv2.term.reset()
	XTermTestv2.writeSync(body)
	screen.render();
});

//Listeners
screen.on('resize', function () {
	XTermTestv2.height = screen.height;
	XTermTestv2.width = Math.floor(screen.width / 2);
	//logs.setContent("x:"+form_thing.width.toString()+", y:"+form_thing.height.toString()+", submit length:"+button1.width.toString());
	resizeButtons()
});
// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function (ch, key) {
	return process.exit(0);
});
screen.key('e', function () {
	XTermTestv2.focus();
	screen.render();
});
screen.key('p', function () {
	screen.focusNext();
});
screen.key('r', function () {
	reset()
});
//test content key listener
screen.key('y', function () {
	form_thing.resetScroll()
	buttonsArray.forEach((button) => { form_thing.remove(button); button.destroy() })
	buttonsArray = [];
	stats.focus();
	XTermTestv2.term.reset()
	createButtons(temp_event1, story);
	form_thing.setContent(` ${chalk.bold.yellow(buttonsArray.length.toString()) + " " + chalk.bold.greenBright("choices")}`)
	resizeButtons();
	stats.focus();
});

screen.key('n', async function () {
	clearButtons()
	death = true;
	encounterResolver()
})

createEventsMap(testEventArr, story)
buttonsArray = [button1, button2, button3, button4];
screen.render()
resizeButtons()
toggleUi()
screen.render()
stats.focus()
//check cursor hidden
console.log('[?25l')
XTermTestv2.writeSync('[?25l')
logs.writeSync('[?25l')

await (fillStatsRollBox(40, thePlayer, box))
refreshStats(thePlayer)
box.focus()
box.key('enter', function () {
	toggleUi()
	box.hide()
	box.destroy()
	box=null
	screen.render()
})
box.on('click', function () {
	toggleUi()
	box.hide()
	box.destroy()
	box=null
	screen.render()
})