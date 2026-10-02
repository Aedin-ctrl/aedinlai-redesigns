// Generates skins/*.css and skins/manifest.json.
//
// Each skin names its surfaces and its two signal colours; this script then walks the three text
// greys until they clear WCAG AA against *every* surface in that skin. Doing it here rather than by
// hand is the point: the same mistake (a grey that passes on the panel and fails on the ground) has
// been made three times by eye today, and it cannot happen if the build enforces it.
//
//   node build-skins.mjs
import Color from 'colorjs.io';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const AA = 4.6;   // 4.5 is the rule; the margin absorbs rounding differences between libraries

const SKINS = [
  { id:'piste', name:'Piste', note:'A fencing strip: cool steel, and the scoring lights',
    ground:'#dfe3e8', bezel:'#eef1f4', panel:'#f7f9fa', ink:'#14181f',
    soft:'#4a535f', quiet:'#6b7480', rule:'#c3cad2', ruleFirm:'#9aa4b0',
    sigA:'#a60c25', sigB:'#00663a', scheme:'light' },

  { id:'cold-aisle', name:'Cold aisle', note:'A data-centre rack at 18°C',
    ground:'#070a0e', bezel:'#11161d', panel:'#141a22', ink:'#e8eef5',
    soft:'#aab6c4', quiet:'#8794a4', rule:'#222b36', ruleFirm:'#36424f',
    sigA:'#4fd1e0', sigB:'#f0b429', scheme:'dark' },

  { id:'cabinet', name:'Cabinet', note:'The arcade machine, built from nothing',
    ground:'#120c0f', bezel:'#1d1317', panel:'#23171c', ink:'#f6ece0',
    soft:'#cdb6a4', quiet:'#a8907f', rule:'#3a262e', ruleFirm:'#54373f',
    sigA:'#ffa52b', sigB:'#ff6b7a', scheme:'dark',
    display:"'BricolageG', sans-serif", displayW:800, track:'-.03em' },

  { id:'blueprint', name:'Blueprint', note:'Cyanotype: white rules on engineering blue',
    ground:'#0d2a52', bezel:'#123466', panel:'#163c74', ink:'#eef4ff',
    soft:'#bcd0ec', quiet:'#9fb8dc', rule:'#245089', ruleFirm:'#3a67a4',
    sigA:'#ffd166', sigB:'#ff8f6b', scheme:'dark', radius:'4px',
    texture:'repeating-linear-gradient(0deg, rgba(255,255,255,.045) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, transparent 1px 28px)' },

  { id:'solder-mask', name:'Solder mask', note:'A board before assembly: mask green, gold pads',
    ground:'#06281d', bezel:'#0a3527', panel:'#0d3f2e', ink:'#e9f6ef',
    soft:'#aed4c2', quiet:'#8fbfa9', rule:'#17543f', ruleFirm:'#1f6b51', scheme:'dark',
    sigA:'#e8b948', sigB:'#7fd4b0', radius:'3px' },

  { id:'oscilloscope', name:'Oscilloscope', note:'Two traces on a graticule',
    ground:'#06100c', bezel:'#0a1813', panel:'#0d1f18', ink:'#e6fbef',
    soft:'#a7d7bd', quiet:'#86bfa2', rule:'#15352a', ruleFirm:'#1d4a3a', scheme:'dark',
    sigA:'#7ef7b0', sigB:'#ffe066', radius:'2px',
    texture:'repeating-linear-gradient(0deg, rgba(126,247,176,.05) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(126,247,176,.05) 0 1px, transparent 1px 32px)' },

  { id:'anodised', name:'Anodised', note:'Machined aluminium, dyed at the edges',
    ground:'#d7d4cf', bezel:'#e8e6e2', panel:'#f2f1ee', ink:'#1b1a18',
    soft:'#4e4b46', quiet:'#6e6a64', rule:'#c0bcb5', ruleFirm:'#9c978f', scheme:'light',
    sigA:'#1f6f8b', sigB:'#c1620f', radius:'6px' },

  { id:'lab-book', name:'Lab book', note:'Graph paper, pencil, and a blue pen',
    ground:'#eee9dd', bezel:'#f6f2e9', panel:'#fbf8f1', ink:'#201d17', scheme:'light',
    soft:'#4d473b', quiet:'#6d6557', rule:'#d6cfbe', ruleFirm:'#b3a992',
    sigA:'#1d4ed8', sigB:'#9a3412', radius:'3px',
    display:"'InstrumentS', Georgia, serif", displayW:400, track:'-.01em',
    texture:'repeating-linear-gradient(0deg, rgba(120,105,70,.07) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(120,105,70,.07) 0 1px, transparent 1px 24px)' },

  { id:'control-room', name:'Control room', note:'Amber, so your eyes stay dark-adapted',
    ground:'#0b0906', bezel:'#15110a', panel:'#1b150c', ink:'#ffdfae', scheme:'dark',
    soft:'#d3ae76', quiet:'#b2905d', rule:'#2e2413', ruleFirm:'#45361d',
    sigA:'#ffb020', sigB:'#9bd1ff', radius:'5px',
    display:"'PlexMono', ui-monospace, monospace", displayW:600, track:'-.02em' },

  { id:'lame', name:'Lamé', note:'The metallic jacket: everything is a conductor',
    ground:'#c9ccd1', bezel:'#dcdfe3', panel:'#e9ebee', ink:'#101317', scheme:'light',
    soft:'#434a53', quiet:'#5f6771', rule:'#b0b5bc', ruleFirm:'#8d939b',
    sigA:'#8c0b22', sigB:'#005c33', radius:'16px', ruleW:'2px',
    display:"'SpaceG', sans-serif", displayW:700, track:'-.04em' },

  { id:'eeg', name:'EEG', note:'Chart paper and electrode leads, from the neurology work',
    ground:'#f1ece4', bezel:'#faf7f1', panel:'#fffdf9', ink:'#1c1a17', scheme:'light',
    soft:'#4b463e', quiet:'#6c6559', rule:'#ded5c6', ruleFirm:'#bdb09b',
    sigA:'#b4232b', sigB:'#1f5fa8', radius:'3px', density:'compact', frame:'etched',
    texture:'repeating-linear-gradient(0deg, rgba(150,120,80,.08) 0 1px, transparent 1px 16px)' },

  { id:'thermal', name:'Thermal', note:'A rack through a thermal camera',
    ground:'#0b0618', bezel:'#140b25', panel:'#1a0f2e', ink:'#ffe9c7', scheme:'dark',
    soft:'#d7b7e0', quiet:'#b292c4', rule:'#2d1b48', ruleFirm:'#43295f',
    sigA:'#ff7847', sigB:'#9b5de5', radius:'10px', frame:'raised' },

  { id:'clean-room', name:'Clean room', note:'Filtered air and a blue cast',
    ground:'#e4ecf2', bezel:'#f1f6fa', panel:'#f9fcfe', ink:'#111a22', scheme:'light',
    soft:'#43505c', quiet:'#64717e', rule:'#ccd9e4', ruleFirm:'#a4b5c4',
    sigA:'#0f6ea8', sigB:'#108a6a', radius:'8px', density:'spacious', frame:'etched' },

  { id:'vacuum-tube', name:'Vacuum tube', note:'Warm glass, and a heater that takes a moment',
    ground:'#120d07', bezel:'#1d150c', panel:'#251b10', ink:'#ffe6bd', scheme:'dark',
    soft:'#d6b183', quiet:'#b08f64', rule:'#36281a', ruleFirm:'#4d3a26',
    sigA:'#ff9d2e', sigB:'#64c8d8', radius:'14px', frame:'raised' },

  { id:'punch-card', name:'Punch card', note:'Card stock, red ink, eighty columns',
    ground:'#e8dfc8', bezel:'#f3ecda', panel:'#faf5e8', ink:'#1a1813', scheme:'light',
    soft:'#4a4535', quiet:'#6b6450', rule:'#d3c7a9', ruleFirm:'#b3a481',
    sigA:'#a81f22', sigB:'#2f5d50', radius:'0px', density:'compact',
    display:"'PlexMono', ui-monospace, monospace", displayW:600, track:'-.02em',
    texture:'repeating-linear-gradient(90deg, rgba(120,100,60,.09) 0 1px, transparent 1px 13px)' },

  { id:'husky', name:'Husky', note:'Northeastern: red, black, and not much else',
    ground:'#f2f2f3', bezel:'#fbfbfc', panel:'#ffffff', ink:'#0d0d0f', scheme:'light',
    soft:'#45464a', quiet:'#65676c', rule:'#dcdde0', ruleFirm:'#b6b8bd',
    sigA:'#c8102e', sigB:'#2b2d31', radius:'6px', density:'spacious',
    display:"'BricolageG', sans-serif", displayW:800, track:'-.035em' },

  { id:'fibre', name:'Fibre', note:'Light down a glass thread',
    ground:'#04080f', bezel:'#081220', panel:'#0b1828', ink:'#dff2ff', scheme:'dark',
    soft:'#9dc2d9', quiet:'#7ba3bd', rule:'#132a40', ruleFirm:'#1d3e5c',
    sigA:'#36e2d0', sigB:'#a87bff', radius:'16px', frame:'raised' },

  { id:'tape', name:'Tape', note:'Oxide and a handwritten label',
    ground:'#241a12', bezel:'#30241a', panel:'#3a2c20', ink:'#f3e7d6', scheme:'dark',
    soft:'#cbb296', quiet:'#a98f74', rule:'#4a3828', ruleFirm:'#644c37',
    sigA:'#e0a458', sigB:'#8fb08c', radius:'4px', density:'compact' },

  { id:'graphite', name:'Graphite', note:'A 2H pencil on technical paper',
    ground:'#dcdcda', bezel:'#eaeae8', panel:'#f4f4f2', ink:'#17181a', scheme:'light',
    soft:'#45474a', quiet:'#64676b', rule:'#c6c6c3', ruleFirm:'#a2a3a0',
    sigA:'#3f4a8a', sigB:'#7a5230', radius:'2px', density:'spacious', frame:'etched',
    display:"'InstrumentS', Georgia, serif", displayW:400, track:'-.012em' },

  { id:'night-match', name:'Night match', note:'A dark hall, one lit strip',
    ground:'#08090c', bezel:'#101319', panel:'#161a22', ink:'#f0f3f8', scheme:'dark',
    soft:'#aeb6c2', quiet:'#8b94a2', rule:'#1f242e', ruleFirm:'#323a47',
    sigA:'#e63946', sigB:'#2a9d8f', radius:'18px', frame:'raised', density:'spacious' },

  { id:'blinkenlights', name:'Blinkenlights', note:'A rack face in the dark, all status LEDs',
    ground:'#050607', bezel:'#0c0e11', panel:'#111418', ink:'#e9eef2', scheme:'dark',
    soft:'#a6b0ba', quiet:'#848f9a', rule:'#1b2027', ruleFirm:'#2b323b',
    sigA:'#38d66b', sigB:'#ffb13d', radius:'3px', density:'compact' },

  { id:'whiteboard', name:'Whiteboard', note:'Marker on a board mid-explanation',
    ground:'#eceff0', bezel:'#f8fafa', panel:'#ffffff', ink:'#15181a', scheme:'light',
    soft:'#464b4f', quiet:'#666d72', rule:'#d9dedf', ruleFirm:'#b2b9bb',
    sigA:'#d1392b', sigB:'#1f6fd0', radius:'10px', density:'spacious' },

  { id:'multimeter', name:'Multimeter', note:'An LCD waiting for a reading',
    ground:'#9aa894', bezel:'#aab7a3', panel:'#b7c3b0', ink:'#10150f', scheme:'light',
    soft:'#2f3a2b', quiet:'#46523f', rule:'#879479', ruleFirm:'#6d7a61',
    sigA:'#8a2416', sigB:'#1c4a6b', radius:'4px', density:'compact',
    display:"'PlexMono', ui-monospace, monospace", displayW:600, track:'-.02em' },

  { id:'chalk', name:'Chalk', note:'A board that has been half rubbed out',
    ground:'#15201b', bezel:'#1c2a23', panel:'#22322a', ink:'#eef3ec', scheme:'dark',
    soft:'#bfccbe', quiet:'#9fb09e', rule:'#2d4036', ruleFirm:'#3e5648',
    sigA:'#ffd9a0', sigB:'#a8d5e2', radius:'7px', density:'spacious' },

  { id:'copper', name:'Copper', note:'A ground pour before the mask goes on',
    ground:'#2a1710', bezel:'#381e15', panel:'#44261a', ink:'#ffe8d5', scheme:'dark',
    soft:'#d8b096', quiet:'#b88d72', rule:'#53311f', ruleFirm:'#6e432c',
    sigA:'#ff9a52', sigB:'#6fc3b5', radius:'5px' },

  { id:'resistor', name:'Resistor', note:'Beige body, and the bands that tell you the value',
    ground:'#ded3bb', bezel:'#eae1cd', panel:'#f3ecdc', ink:'#1b1812', scheme:'light',
    soft:'#4a4334', quiet:'#6a6150', rule:'#c9bda2', ruleFirm:'#a89a7c',
    sigA:'#8a3b14', sigB:'#2b5e8a', radius:'999px', density:'regular' },

  { id:'rubylith', name:'Rubylith', note:'Photomask film, cut by hand',
    ground:'#2b0810', bezel:'#3a0c16', panel:'#47101c', ink:'#ffe7ec', scheme:'dark',
    soft:'#e2a9b6', quiet:'#c78896', rule:'#5a1724', ruleFirm:'#762030',
    sigA:'#ff6b8a', sigB:'#ffd166', radius:'2px', frame:'etched' },

  { id:'sodium', name:'Sodium', note:'A car park at night, one orange lamp',
    ground:'#120d06', bezel:'#1c150b', panel:'#241c0f', ink:'#ffeccd', scheme:'dark',
    soft:'#d9bb8e', quiet:'#b89a6e', rule:'#352814', ruleFirm:'#4d3b1d',
    sigA:'#ffa500', sigB:'#7fb3d5', radius:'12px', frame:'raised' },

  { id:'kapton', name:'Kapton', note:'Polyimide film: amber, and you can see through it',
    ground:'#2a1c05', bezel:'#39270a', panel:'#46310e', ink:'#ffeec9', scheme:'dark',
    soft:'#dcba82', quiet:'#bd9a61', rule:'#523a13', ruleFirm:'#6d4f1c',
    sigA:'#ffc14d', sigB:'#6fb3c9', radius:'9px', frame:'raised' },

  { id:'esd-mat', name:'ESD mat', note:'The blue bench mat, and a wrist strap to ground',
    ground:'#15323f', bezel:'#1c4151', panel:'#214c5e', ink:'#e7f4f9', scheme:'dark',
    soft:'#a8ccd9', quiet:'#89b4c4', rule:'#2c5f73', ruleFirm:'#397a92',
    sigA:'#7fe0b0', sigB:'#ffd166', radius:'6px', density:'compact' },

  { id:'ferrite', name:'Ferrite', note:'A core: matte, grey, and heavier than it looks',
    ground:'#17181a', bezel:'#202224', panel:'#27292c', ink:'#e9eaec', scheme:'dark',
    soft:'#aeb0b4', quiet:'#8d9095', rule:'#303337', ruleFirm:'#434750',
    sigA:'#c9d1d9', sigB:'#7ea8c4', radius:'3px', frame:'etched' },

  { id:'strip-light', name:'Strip light', note:'Fluorescent tubes and a faint green cast',
    ground:'#e8ece6', bezel:'#f3f6f1', panel:'#fbfcf9', ink:'#161815', scheme:'light',
    soft:'#464a43', quiet:'#666b62', rule:'#d8ddd4', ruleFirm:'#b2b8ad',
    sigA:'#2f7d4f', sigB:'#9a4f1a', radius:'2px', density:'compact' },

  { id:'quartz', name:'Quartz', note:'A crystal can: silver, and exactly on frequency',
    ground:'#d9dde2', bezel:'#e8ebee', panel:'#f3f5f7', ink:'#14171b', scheme:'light',
    soft:'#464c53', quiet:'#666d75', rule:'#c4c9cf', ruleFirm:'#a0a7af',
    sigA:'#2a6f97', sigB:'#8a5a2b', radius:'999px', density:'spacious', frame:'etched' },

  { id:'reagent', name:'Reagent', note:'Amber glass, because the contents mind the light',
    ground:'#1d1206', bezel:'#28190a', panel:'#32200d', ink:'#ffeacb', scheme:'dark',
    soft:'#d9b589', quiet:'#b8946a', rule:'#3e2a12', ruleFirm:'#573c1b',
    sigA:'#e8a33d', sigB:'#8fbf9a', radius:'11px' },

  { id:'heat-shrink', name:'Heat shrink', note:'Sleeving in the three colours you actually have',
    ground:'#111113', bezel:'#19191c', panel:'#1f1f23', ink:'#ececed', scheme:'dark',
    soft:'#aeaeb2', quiet:'#8c8c92', rule:'#27272c', ruleFirm:'#393940',
    sigA:'#e5484d', sigB:'#3e8fd9', radius:'999px', density:'compact' },


  { id:'risograph', name:'Risograph', note:'Two inks, slightly out of register',
    ground:'#f2ece1', bezel:'#faf6ee', panel:'#fffdf8', ink:'#1a1718', scheme:'light',
    soft:'#4a4345', quiet:'#6b6366', rule:'#ded5c7', ruleFirm:'#bcb0a0',
    sigA:'#e8336d', sigB:'#1f70c2', radius:'0px', density:'spacious',
    display:"'BricolageG', sans-serif", displayW:800, track:'-.04em' },

  { id:'telemetry', name:'Telemetry', note:'Mission control: dense, green, and all numbers',
    ground:'#02060a', bezel:'#060d13', panel:'#09131b', ink:'#d6ffe6', scheme:'dark',
    soft:'#8fd4a8', quiet:'#71b78b', rule:'#0f2230', ruleFirm:'#17354a',
    sigA:'#43e08a', sigB:'#ffcc4d', radius:'2px', density:'compact',
    display:"'PlexMono', ui-monospace, monospace", displayW:600, track:'-.03em' },

  { id:'enamel', name:'Enamel', note:'A vitreous sign that has outlived the building',
    ground:'#0e3b5c', bezel:'#14496e', panel:'#1a567f', ink:'#f3f9fd', scheme:'dark',
    soft:'#bcd8ea', quiet:'#9cc2db', rule:'#226b96', ruleFirm:'#2d84b4',
    sigA:'#ffd54a', sigB:'#ff8f6b', radius:'999px', density:'spacious', frame:'raised' },

  { id:'solar', name:'Solar', note:'Monocrystalline cells and silver busbars',
    ground:'#0a0d1c', bezel:'#111529', panel:'#161b33', ink:'#e6ebff', scheme:'dark',
    soft:'#a9b3d4', quiet:'#8a95ba', rule:'#1f2647', ruleFirm:'#2e3762',
    sigA:'#cfd6e8', sigB:'#f2a541', radius:'4px',
    texture:'repeating-linear-gradient(90deg, rgba(220,230,255,.05) 0 1px, transparent 1px 36px)' },

  { id:'neon', name:'Neon', note:'The marquee, after dark',
    ground:'#0a0612', bezel:'#120b1e', panel:'#180f28', ink:'#f6ecff', scheme:'dark',
    soft:'#c9b2e0', quiet:'#a98fc6', rule:'#261642', ruleFirm:'#38215e',
    sigA:'#ff4fa3', sigB:'#3ddbd9', radius:'14px', frame:'raised',
    display:"'BricolageG', sans-serif", displayW:800, track:'-.035em' },

  { id:'engineering-pad', name:'Engineering pad', note:'Green tint, printed on the back',
    ground:'#dfe8dc', bezel:'#eaf1e7', panel:'#f4f8f2', ink:'#161a15', scheme:'light',
    soft:'#434a41', quiet:'#636b60', rule:'#cbd8c6', ruleFirm:'#a6b7a0',
    sigA:'#1f6b4f', sigB:'#8a4b1f', radius:'1px', density:'compact', frame:'etched',
    texture:'repeating-linear-gradient(0deg, rgba(60,100,60,.07) 0 1px, transparent 1px 15px), repeating-linear-gradient(90deg, rgba(60,100,60,.07) 0 1px, transparent 1px 15px)' },


  { id:'dot-matrix', name:'Dot matrix', note:'Green-bar paper, still joined at the edges',
    ground:'#dfe7dc', bezel:'#eaf0e7', panel:'#f4f7f2', ink:'#17190f', scheme:'light',
    soft:'#44483a', quiet:'#646956', rule:'#c9d6c4', ruleFirm:'#a4b59d',
    sigA:'#1f5f3f', sigB:'#8a4418', radius:'0px', density:'compact',
    display:"'PlexMono', ui-monospace, monospace", displayW:600, track:'-.02em',
    texture:'repeating-linear-gradient(0deg, rgba(40,90,50,.08) 0 18px, transparent 18px 36px)' },

  { id:'arc-weld', name:'Arc weld', note:'Heat tint on steel, and one bright spark',
    ground:'#1b1e22', bezel:'#24282d', panel:'#2c3138', ink:'#eef1f4', scheme:'dark',
    soft:'#b3bac2', quiet:'#939ba5', rule:'#353b43', ruleFirm:'#49515c',
    sigA:'#ff8c2b', sigB:'#6ba6ff', radius:'3px', frame:'raised' },

  { id:'bus-bar', name:'Bus bar', note:'Distribution gear, and the yellow that means stay back',
    ground:'#232529', bezel:'#2d3035', panel:'#363a40', ink:'#f1f2f4', scheme:'dark',
    soft:'#b8bcc3', quiet:'#989da6', rule:'#3f444b', ruleFirm:'#545b64',
    sigA:'#ffd500', sigB:'#4aa3df', radius:'2px', density:'compact' },

  { id:'breadboard', name:'Breadboard', note:'White plastic and whatever jumper colours you had',
    ground:'#e9e7e1', bezel:'#f4f3ef', panel:'#fbfaf8', ink:'#1a1917', scheme:'light',
    soft:'#48463f', quiet:'#68655c', rule:'#d8d5cc', ruleFirm:'#b4b0a4',
    sigA:'#c62828', sigB:'#1565c0', radius:'5px',
    texture:'repeating-linear-gradient(90deg, rgba(120,115,100,.07) 0 1px, transparent 1px 11px)' },

  { id:'datasheet', name:'Datasheet', note:'Dense, printed, and absolutely not decorative',
    ground:'#f0f0ee', bezel:'#f8f8f7', panel:'#ffffff', ink:'#111111', scheme:'light',
    soft:'#3f3f3f', quiet:'#616161', rule:'#dcdcda', ruleFirm:'#b5b5b2',
    sigA:'#0a4a8f', sigB:'#8c2f0d', radius:'0px', density:'compact',
    display:"'InterLocal', system-ui, sans-serif", displayW:700, track:'-.03em' },

  { id:'token', name:'Token', note:'Brass, worn smooth at the rim',
    ground:'#2b2415', bezel:'#39301d', panel:'#453b25', ink:'#ffefc9', scheme:'dark',
    soft:'#dcc08a', quiet:'#bb9f6c', rule:'#54482c', ruleFirm:'#6e5e3a',
    sigA:'#e7c25d', sigB:'#8fb9a8', radius:'999px', frame:'raised' },

  { id:'target', name:'Target', note:'White jacket, lame over it, and one red light',
    ground:'#e7e8ea', bezel:'#f2f3f4', panel:'#fafafb', ink:'#121316', scheme:'light',
    soft:'#45474b', quiet:'#64676c', rule:'#d6d8db', ruleFirm:'#aeb1b6',
    sigA:'#b00020', sigB:'#4a4e55', radius:'8px', density:'spacious', frame:'etched' },


  { id:'left-rail', name:'Left rail', note:'The record first, the words after',
    ground:'#e6e4e0', bezel:'#f1f0ed', panel:'#f9f8f6', ink:'#16161a', scheme:'light',
    soft:'#45454c', quiet:'#64656d', rule:'#d5d4d0', ruleFirm:'#aeada8',
    sigA:'#9b2226', sigB:'#005f73', radius:'4px', layout:'mirrored', density:'spacious' },

  { id:'broadsheet', name:'Broadsheet', note:'Everything stacked, read top to bottom',
    ground:'#f4f1ea', bezel:'#faf8f3', panel:'#fffefb', ink:'#17150f', scheme:'light',
    soft:'#45413a', quiet:'#66604f', rule:'#ddd6c7', ruleFirm:'#b9b09b',
    sigA:'#8c2f0d', sigB:'#26553f', radius:'0px', layout:'stacked',
    display:"'InstrumentS', Georgia, serif", displayW:400, track:'-.015em' },

  { id:'console', name:'Console', note:'A terminal that has been left on',
    ground:'#0a0c0a', bezel:'#101410', panel:'#141a14', ink:'#d9f0d9', scheme:'dark',
    soft:'#93c193', quiet:'#76a376', rule:'#1b241b', ruleFirm:'#283628',
    sigA:'#5fe85f', sigB:'#ffd34d', radius:'0px', density:'compact', layout:'stacked',
    display:"'PlexMono', ui-monospace, monospace", displayW:600, track:'-.025em' },

  { id:'slate', name:'Slate', note:'Split stone, and a chalk line',
    ground:'#2a2d31', bezel:'#34383d', panel:'#3c4147', ink:'#eef1f4', scheme:'dark',
    soft:'#b7bdc4', quiet:'#99a0a8', rule:'#454b52', ruleFirm:'#5a616a',
    sigA:'#e8eaed', sigB:'#7fb2d9', radius:'3px', layout:'mirrored', frame:'etched' },

  { id:'ledger', name:'Ledger', note:'Ruled columns, and everything accounted for',
    ground:'#eee9dc', bezel:'#f7f3ea', panel:'#fdfbf5', ink:'#1a1813', scheme:'light',
    soft:'#484335', quiet:'#696250', rule:'#d9d1bd', ruleFirm:'#b6ab90',
    sigA:'#1f4f8f', sigB:'#8a1f1f', radius:'0px', density:'compact', layout:'mirrored',
    texture:'repeating-linear-gradient(0deg, rgba(110,95,60,.08) 0 1px, transparent 1px 22px)' },

  { id:'floodlight', name:'Floodlight', note:'A bright strip and everything else in shadow',
    ground:'#0c0d10', bezel:'#15171c', panel:'#1d2027', ink:'#fdfdfe', scheme:'dark',
    soft:'#b9bec7', quiet:'#99a0ab', rule:'#232831', ruleFirm:'#343b47',
    sigA:'#ffe066', sigB:'#4cc9f0', radius:'20px', density:'spacious', frame:'raised',
    layout:'stacked', display:"'BricolageG', sans-serif", displayW:800, track:'-.04em' },

  { id:'drafting', name:'Drafting', note:'Vellum, a straightedge, and a hard pencil',
    ground:'#e9e6dc', bezel:'#f3f1e9', panel:'#faf9f4', ink:'#1b1a16', scheme:'light',
    soft:'#484539', quiet:'#6a6655', rule:'#d7d2c3', ruleFirm:'#b2ab98',
    sigA:'#2f5d8a', sigB:'#8a4a2f', radius:'1px', layout:'mirrored', frame:'etched',
    display:"'InstrumentS', Georgia, serif", displayW:400, track:'-.01em' },

  { id:'signal-box', name:'Signal box', note:'Two lamps, and nothing else to say',
    ground:'#101216', bezel:'#181b21', panel:'#1e222a', ink:'#f2f5f8', scheme:'dark',
    soft:'#b4bbc4', quiet:'#949ca7', rule:'#262c35', ruleFirm:'#373f4b',
    sigA:'#ff3b3b', sigB:'#2ecc71', radius:'8px', layout:'stacked', density:'spacious' },


  { id:'tournament', name:'Tournament', note:'A results board at the end of a long day',
    ground:'#111418', bezel:'#191d23', panel:'#20252c', ink:'#f4f6f9', scheme:'dark',
    soft:'#b6bdc6', quiet:'#969ea9', rule:'#272d36', ruleFirm:'#3a424e',
    sigA:'#ef476f', sigB:'#06d6a0', radius:'6px', layout:'stacked', density:'compact',
    display:"'BricolageG', sans-serif", displayW:800, track:'-.035em' },

  { id:'wind-tunnel', name:'Wind tunnel', note:'Smoke lines over a pale model',
    ground:'#dfe3e6', bezel:'#eceff1', panel:'#f6f8f9', ink:'#131619', scheme:'light',
    soft:'#434950', quiet:'#636a72', rule:'#ccd2d6', ruleFirm:'#a7afb6',
    sigA:'#0b6e99', sigB:'#b5453b', radius:'22px', layout:'mirrored', density:'spacious',
    texture:'repeating-linear-gradient(0deg, rgba(40,70,90,.05) 0 1px, transparent 1px 9px)' },

  { id:'foundry', name:'Foundry', note:'Hot metal and a very old process',
    ground:'#17100c', bezel:'#211712', panel:'#2a1e17', ink:'#ffe8d4', scheme:'dark',
    soft:'#d7b49a', quiet:'#b7937a', rule:'#3a281e', ruleFirm:'#523a2b',
    sigA:'#ff6b35', sigB:'#ffd166', radius:'2px', frame:'raised', layout:'mirrored' },

  { id:'manual', name:'Manual', note:'The page of a service manual, exploded view opposite',
    ground:'#edeae3', bezel:'#f5f3ee', panel:'#fbfaf7', ink:'#191815', scheme:'light',
    soft:'#464338', quiet:'#676354', rule:'#d9d5ca', ruleFirm:'#b4afa1',
    sigA:'#17497a', sigB:'#9a3b12', radius:'0px', density:'compact', layout:'mirrored',
    display:"'InterLocal', system-ui, sans-serif", displayW:700, track:'-.03em' },

  { id:'aurora', name:'Aurora', note:'A cold sky doing something unexpected',
    ground:'#050c14', bezel:'#0a1620', panel:'#0e1d2a', ink:'#e8f6ff', scheme:'dark',
    soft:'#a4c8dd', quiet:'#83aac3', rule:'#143044', ruleFirm:'#1e475f',
    sigA:'#6ef0c0', sigB:'#9a7bff', radius:'18px', frame:'raised', density:'spacious' },

  { id:'index-card', name:'Index card', note:'Ruled, cornered, and one thing per card',
    ground:'#e6e2d6', bezel:'#f2efe6', panel:'#fbf9f3', ink:'#1a1915', scheme:'light',
    soft:'#474436', quiet:'#686352', rule:'#d6d0bf', ruleFirm:'#b3ab95',
    sigA:'#a4303a', sigB:'#2f6d6a', radius:'1px', layout:'stacked',
    texture:'repeating-linear-gradient(0deg, rgba(120,105,70,.09) 0 1px, transparent 1px 20px)' },

  { id:'relay', name:'Relay', note:'Contacts, coils, and a satisfying click',
    ground:'#1a1a1d', bezel:'#232327', panel:'#2b2b30', ink:'#eeeef1', scheme:'dark',
    soft:'#b2b2b9', quiet:'#92929b', rule:'#323238', ruleFirm:'#454550',
    sigA:'#d94f4f', sigB:'#4fa3d9', radius:'4px', density:'compact', frame:'etched' },

  { id:'parchment', name:'Parchment', note:'Something written down to last',
    ground:'#e9e0cd', bezel:'#f3ecdd', panel:'#faf5ea', ink:'#1d1a12', scheme:'light',
    soft:'#4a4433', quiet:'#6b644e', rule:'#d8ceb6', ruleFirm:'#b5a988',
    sigA:'#7a2e1e', sigB:'#2e5a3f', radius:'9px', layout:'stacked', density:'spacious',
    display:"'InstrumentS', Georgia, serif", displayW:400, track:'-.01em' },

];

const hex = (c) => c.to('srgb').toString({ format: 'hex' });

// Walk a text colour away from the surfaces until it clears AA against the worst of them.
function fix(start, surfaces, dark) {
  let c = new Color(start);
  const worst = () => Math.min(...surfaces.map((s) => c.contrast(s, 'WCAG21')));
  let guard = 0;
  while (worst() < AA && guard++ < 200) {
    c = c.set('hsl.l', (l) => Math.max(0, Math.min(100, l + (dark ? 0.6 : -0.6))));
  }
  return { hex: hex(c), ratio: worst(), moved: hex(c).toLowerCase() !== String(start).toLowerCase() };
}

// Catch a malformed palette here rather than three frames deep inside the colour library. A
// stray non-ASCII character in a hex value cost more time than this check will ever take.
const HEX = /^#[0-9a-fA-F]{6}$/;
for (const s of SKINS) {
  for (const key of ['ground','bezel','panel','ink','soft','quiet','rule','ruleFirm','sigA','sigB']) {
    const v = s[key];
    if (!HEX.test(v || '')) {
      console.error(`skin "${s.id}": ${key} is ${JSON.stringify(v)} — expected a 6-digit hex like #aabbcc`);
      process.exit(1);
    }
  }
}

const manifest = [];
for (const s of SKINS) {
  const surfaces = [s.ground, s.bezel, s.panel];
  const dark = s.scheme === 'dark';
  const ink = fix(s.ink, surfaces, dark);
  const soft = fix(s.soft, surfaces, dark);
  const quiet = fix(s.quiet, surfaces, dark);

  const note = [ink, soft, quiet].some((x) => x.moved)
    ? `/* adjusted for contrast: ${[['ink',ink],['soft',soft],['quiet',quiet]]
        .filter(([,x]) => x.moved).map(([n,x]) => `${n}->${x.hex}`).join(', ')} */\n`
    : '';

  const css = `/* ${s.name} — ${s.note}
   Worst-case contrast against this skin's three surfaces:
   ink ${ink.ratio.toFixed(2)}:1, soft ${soft.ratio.toFixed(2)}:1, quiet ${quiet.ratio.toFixed(2)}:1 (AA needs 4.5)
   Generated by build-skins.mjs — edit the palette there, not here. */
${note}:root{
  --ground:${s.ground}; --bezel:${s.bezel}; --panel:${s.panel};
  --ink:${ink.hex}; --soft:${soft.hex}; --quiet:${quiet.hex};
  --rule:${s.rule}; --rule-firm:${s.ruleFirm};
  --sigA:${s.sigA}; --sigB:${s.sigB};
  --scheme:${s.scheme};
  --radius:${s.radius || '12px'};
  --rule-w:${s.ruleW || '1px'};
  --display:${s.display || "'Archivo', sans-serif"};
  --display-w:${s.displayW || 700};
  --display-track:${s.track || '-.045em'};
  --texture:${s.texture ? s.texture : 'none'};
  --density:${s.density || 'regular'};
  --frame:${s.frame || 'flat'};
  --layout:${s.layout || 'standard'};
}
`;
  writeFileSync(join(HERE, 'skins', `${s.id}.css`), css);
  manifest.push({ id: s.id, name: s.name, note: s.note, tone: s.scheme });
  const flag = [ink, soft, quiet].some((x) => x.moved) ? ' (corrected)' : '';
  console.log(`  ${s.name.padEnd(14)} ink ${ink.ratio.toFixed(2)}  soft ${soft.ratio.toFixed(2)}  quiet ${quiet.ratio.toFixed(2)}${flag}`);
}

writeFileSync(join(HERE, 'skins', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${manifest.length} skins written.`);
