#!/usr/bin/env node
'use strict';

import XTermNew from './blessed-xterm/blessed-xterm.js'
import blessed from 'blessed';
import chalk from 'chalk';
import BlessedContrib from 'blessed-contrib';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import { game_event, game_event_enemy, game_event_gain_item } from './game-objects/game_events.js'
import { clearInterval } from 'timers';
import { Player } from './game-objects/player.js';
import { hrtime } from 'node:process';
import os from 'os'
import './blessed/patches.cjs';
import * as scroll from './blessed/scroll.cjs';
import fs from 'fs';
import pkg from 'iconv-lite';
import smallGrad from 'tinygradient';
import lodashC from 'lodash.compact';
import { monster, copyMonster } from './game-objects/mobs.js';
import {spawn} from 'child_process';
const { tinygradient } = smallGrad;
const { iconv } = pkg;
const { compact } = lodashC;

// test content
let
	mountain = `[37m[40m                        [97m[40m░░[37m[40m                            [m
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
		toScreen: "~~~AAAA~~~~",
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
let story = {}

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
screen.program.hideCursor(true);
const grid = new BlessedContrib.grid({ rows: 12, cols: 12, screen: screen })

screen.title = 'my window title';

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

screen.render()
let b = XTermTestv2.term.buffer
XTermTestv2.writeSync("")
XTermTestv2.scrollTo(0)

screen.render()

const XTermApp = XTermTestv2.term
//might change to an xterm in the future to make it a rolling log, store whats writen to log in a long string
//then write string on exit to a file so that log can be reloaded if desired
//animimate wrting the log via slowly writing it and try this to animate it:
//https://stackoverflow.com/questions/10264261/move-one-character-to-the-left-in-the-console

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
//in the future will be a table with options to view/manage inventory and attack
const actions = grid.set(0, 10, 6, 2, blessed.list, {
	tags: true,
	scrollable: true,
	mouse: true,
	keys: true,
	label: '{bold}actions{/bold}',
	content: thing,
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

screen.render()

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

// term.write('\x1b')
// // First \n will cancel any existing escape or go to new line
// // Then the \n\r will put the cursor at the start of the next line
// term.write('\n\n\r')
// term.clear()


//Listeners for test buttons
button1.on('press', function () {
	form_thing.setContent('Canceled.');
	XTermApp.clear();
	XTermApp.reset();
	XTermTestv2.writeSync(caleb);
	screen.render();
});
button2.on('press', function () {
	//logs.setContent(chalk.bgMagenta.blueBright("lolololololololollolololololololol"))
	XTermApp.clear()
	XTermApp.reset()
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

//test content key listener
screen.key('y', function () {
	form_thing.resetScroll()
	buttonsArray.forEach((button) => { form_thing.remove(button); button.destroy() })
	buttonsArray = [];
	stats.focus();
	XTermApp.reset()
	createButtons(temp_event1, story);
	form_thing.setContent(` ${chalk.bold.yellow(buttonsArray.length.toString()) + " " + chalk.bold.greenBright("choices")}`)
	resizeButtons();
	stats.focus();
});
let buttonsArray = [button1, button2, button3, button4];
//test content
//logs.setContent(caleb)
screen.render();
//screen.render is essential for the correct screenlines amount to calculate
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
resizeButtons()
// handling creating of buttons from an event. writing body etc
// event reader
// multiple functions, exuction may differ based on event type
// messy, remove redundant code in future
// The problem trying to make this function more pure is that for some reason
// the resize button cannot get a valid height and crashes on screen resize
// if i attempt to remove all mentions of buttonsArray
let combatEvent;
let combatFlag = false;
function clearButtons() {
	buttonsArray.forEach((element) => { form_thing.remove(element); element.destroy() })
	buttonsArray = []
}
async function createButtons(gameEvent, storyObj = {}) {
	eventHandler(gameEvent)
	await waitForClear();
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
createEventsMap(testEventArr, story)
stats.focus()
screen.render()



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
	//
	//
	XTermApp.clear()
	XTermApp.reset()
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
		//combatFlag = true;
		combat(gameEvent)
		//await something
	} else if (gameEvent instanceof (game_event_gain_item)) {

	} else {
		// test code
		combat(gameEvent)
	}


	screen.key('n', function () {
		resolver()
	})
}
// resume execution after combat 
// enounter clear promise
let waitForClearResolve
function waitForClear() {
	return new Promise(resolve => waitForClearResolve = resolve);
}
function resolver() {
	if (waitForClearResolve) waitForClearResolve();
}


//TURNS PROMISES
let waitForCombatResolve
function waitForCombat() {
	return new Promise(resolve => waitForCombatResolve = resolve);
}
function encounterResolver() {
	if (waitForCombatResolve) waitForCombatResolve();
}
//({name = '', hitDie = 1, ac = 8, morale=6, weapon='stick', dmgDie=6, aggro=6, rarity=1}) {

let tempMonster = new monster({
	name: "testCreature",
	hitDie: 3,
	ac: 10,
	morale: 6,
	weapon: "ruler",
	dmgDie: 6,
	aggro: 1,
	rarity: 1
})

async function combat(combatEvent) {
	form_thing.setContent('')
	// const enemy = combatEvent.enemy
	// const enemyHp = enemy.hp
	//not always true but a to simplify for now
	//let enemyHp=10
	logs.writeSync(escUpByNum(1))
	logs.writeSync(`\n${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}`);
	logs.writeSync(`\n${chalk.yellow(`Combat Start!`)}`);
	logs.writeSync(`\n${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}\n`);
	let hostile = true
	if (!hostile) {
		//provoke or somthing
		return 0
	}
	createCombatButtons()
	//combat buttons
	//toggle button box while enemy takes turn
	//turn has a short delay for enemy so it doesnt feel static
	//maybe some effect
	let encounterCleared = false;
	let monster = copyMonster(tempMonster)
	combatLogic(monster, encounterCleared)
	//should be attack buttons
	await (waitForCombat())
	//console.log("encounter cleared")
	resolver()
}
// moster picker in random event later
function combatLogic(monsterCopy /*make into enemy*/, encounterClr, player = thePlayer) {
	let monster = monsterCopy

	// initiative~ ────────────────────────
	//if (inititve<enemy)
	buttonsArray[0].on('press', async () => {
		//attack placeholder
		if((logs.term.rows-2)<=logs.term.buffer.active.cursorY){
			logs.writeSync(escUpByNum(1))
			rollLog(logs)
		}
		clearButtons();
		logs.writeSync(chalk.greenBright(`${escLeftByNum(2)}You attack the enemy with your ${player.weaponName.toLowerCase()}!`));
		let TOHIT = player.rollToHit()
		//logs.writeSync(`\nTOHIT : ${TOHIT}, MONSTERAC : ${monster.ac}`)
		if (TOHIT >= monster.ac) {
			let playerDamage = player.rollDamage()
			//make negative damage subtract from attack damage but not heal
			monster.hp -= playerDamage
			//await new Promise(resolve => setTimeout(resolve, 100))
			logs.writeSync(chalk.greenBright(`\nYou hit for ${playerDamage} damage!     ___DEBUGenemyhp=${monster.hp}`));
			//await new Promise(resolve => setTimeout(resolve, 100))
			//logs.writeSync(`\n${player.weapon} ${player.basedamage> -1 ? '+ ' : ''}${player.basedamage} = ${playerDamage}`)
		} else {
			logs.writeSync(chalk.greenBright(`\nYou miss!    ____DEBUGenemyhp=${monster.hp}`));
		}
		if (monster.hp > 0) {
			logs.writeSync(`\n${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}`);
			await new Promise(resolve => setTimeout(resolve, 300))
			logs.writeSync(chalk.red(`\n${monster.name} attacks you with ${monster.weapon}!`))
			if (monster.rollToHit() >= player.ac) {
				let monsterDamage = monster.rollDamage()
				//await new Promise(resolve => setTimeout(resolve, 100))
				logs.writeSync(chalk.red(`\n${monster.name} hits you for ${monsterDamage} damage!\n`))
				player.hp -= monsterDamage
				refreshStats(player)
				// add call to game over function
			} else {
				//await new Promise(resolve => setTimeout(resolve, 100))
				logs.writeSync(chalk.red(`\n${monster.name} misses you!\n`))
			}

			//await new Promise(resolve => setTimeout(resolve, 1000))
		}// MERGE WITH IF BELLOW LATER
		await new Promise(resolve => setTimeout(resolve, 50))
		if (monster.hp <= 0) {
			await new Promise(resolve => setTimeout(resolve, 100))
			encounterClr = true;
			clearButtons();
			encounterResolver()
			logs.writeSync(`\n${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}`);
			logs.writeSync(`\n${chalk.yellow(`You defeated the enemy!`)}`);
			logs.writeSync(`\n${chalk.bold.magenta(`#`.repeat(logs.term.cols - 1))}`);
			return encounterClr
		} else {
			logs.writeSync(`${chalk.bold.blue(`-`.repeat(logs.term.cols - 1))}\n`);
			createCombatButtons()
			combatLogic(monster, encounterClr)
		}
		//set flag combat done or something
		//if (encounterCleared) createButtons(combatEvent, buttonsArray, story)
	})
	return encounterClr
}




function createCombatButtons() {
	clearButtons()
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
	buttonsArray.push(attack)
	buttonsArray.push(flee)
	buttonsArray.push(chatUp)
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

let scrollPosition = 0;
XTermTestv2.term.onScroll((apple) => { scrollPosition = apple.valueOf() })

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
	// regex screws up approstrophes
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

let rainbowVoil = ['ee82ee', '4b0082', '0000ff', '008000', 'ffff00', 'ffa500', 'ff0000',]
let rainbowWithBlue = ['93CAED', 'ee82ee', '4b0082', '0000ff', '008000', 'ffff00', 'ffa500', 'ff0000']
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
console.log('[?25l')
XTermTestv2.writeSync('[?25l')
logs.writeSync('[?25l')

function toggleUi() {
	form_thing.toggle()
	XTermTestv2.toggle()
	logs.toggle()
	stats.toggle()
	actions.toggle()
}
toggleUi()
function toggleButtons() {
	form_thing.toggle()
}


screen.render()
//toggleUi()
stats.focus()
screen.render()
//stats box
const box = blessed.box({
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

let thePlayer = new Player("name")

screen.append(box);
screen.render()
// maybe make into an inventory screen later~
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

await (fillStatsRollBox())
box.key('enter', function () {
	toggleUi()
	box.hide()
}
)

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

refreshStats()
box.focus()
screen.render()

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

mountain = `[37m[40m                        [97m[40m░░[37m[40m                            [m
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

//reminder how to convert ansi art to utf8
//run script on cmder to convert my ansi art to utf8
//ansiart2utf8 mountain.ans > sometext.txt
//XTermTestv2.write(mountain)

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

var pgrad = ['#3f51b1', '#5a55ae', '#7b5fac', '#8f6aae', '#a86aa4', '#cc6b8e', '#f18271', '#f3a469', '#f7c978']

pgrad.reverse()

//thePlayer.changeWeapon()
refreshStats(thePlayer)
screen.render()


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

//await new Promise(resolve => setTimeout(resolve, 1000));
//toggleButtons()
//await (gradient_scanlines(XTermTestv2, ch.repeat(1), 4, gradient.retro.multiline, pgrad))
//toggleButtons()
//ERROR bugs out at certain screen widths
//make stricter add a buffer to collumn width
//done but keeping comments incase i see another error