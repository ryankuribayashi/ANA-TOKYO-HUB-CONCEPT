// ── Aircraft ────────────────────────────────────────────────────────────────
const ACFT = {
  1: { name: 'Boeing 777-9',      hasFc: true,  hasPe: false }, // B777-9 Premium Trunk: FC 8 / BC 48 / EC 300
  2: { name: 'Airbus A350-1000',  hasFc: true,  hasPe: true  }, // A350-1000 Premium: FC 6 / BC 40 / PE 32 / EC 207
  3: { name: 'Boeing 787-9',      hasFc: false, hasPe: true  },
  4: { name: 'Airbus A350-900',   hasFc: true,  hasPe: true  }, // A350-900 Premium: FC 3 / BC 48 / PE 40 / EC 180
  5: { name: 'Boeing 787-8',      hasFc: false, hasPe: true  },
  6: { name: 'Airbus A350-900',   hasFc: true,  hasPe: false }, // A350-900 Domestic: FC 6 / Premium Class 40 / EC 270
  7: { name: 'Boeing 787-8',      hasFc: false, hasPe: false }, // B787-8 Domestic: Premium Class 35 / EC 243
  8: { name: 'Boeing 777-9',      hasFc: true,  hasPe: false }, // B777-9 Main Trunk: FC 4 / BC 54 / EC 320
  9: { name: 'Airbus A350-1000',  hasFc: true,  hasPe: true  }, // A350-1000 Main Trunk: FC 3 / BC 44 / PE 32 / EC 225
  10: { name: 'Airbus A350-900',  hasFc: true,  hasPe: true  }, // A350-900 Main Trunk: FC 3 / BC 42 / PE 32 / EC 198
};

function cabinStr(ac) {
  if (ac === 1) return 'First Class · Business · Economy';
  if (ac === 2) return 'First Class · Business · Premium Economy · Economy';
  if (ac === 4) return 'First Class · Business · Premium Economy · Economy';
  if (ac === 6) return 'First Class · ANA Premium Class · Economy';
  if (ac === 7) return 'ANA Premium Class · Economy';
  return 'Business · Premium Economy · Economy';
}

// ── UTC offsets (standard, approx) ──────────────────────────────────────────
const TZ = {
  NRT:9,  KIX:9,  ICN:9,  GMP:9,  PUS:9,  TAE:9,  KWJ:9,  CJU:9,  GUM:10,
  OKA:9,  FUK:9,  ITM:9,  NGO:9,  CTS:9,
  JFK:-5, EWR:-5, BOS:-5, IAD:-5, DTW:-5, ATL:-5, YYZ:-5, YUL:-5,
  PHL:-5, CLT:-5, MIA:-5, MCO:-5, IND:-5,
  ORD:-6, DFW:-6, MSP:-6, MEX:-6, MTY:-6, STL:-6, MCI:-6, AUS:-6,
  DEN:-7, YYC:-7, SLC:-7, PHX:-7,
  LAX:-8, SFO:-8, SEA:-8, SAN:-8, YVR:-8, LAS:-8, PDX:-8, SJC:-8,
  HNL:-10, ANC:-9,
  PTY:-5,
  PEK:8,  PVG:8,  HKG:8,  SIN:8,  TPE:8,  MNL:8,  KUL:8,  PER:8,
  CAN:8,  SZX:8,  MFM:8,  HGH:8,  TSN:8,  CTU:8,  XIY:8,
  KHH:8,  CEB:8,  TSA:8,
  BKK:7,  CGK:7,  SGN:7,  HAN:7,  PNH:7,  VTE:7,  HKT:7,
  DPS:8,
  DEL:5.5, BOM:5.5, BLR:5.5, HYD:5.5, CMB:5.5,
  KHI:5,  MLE:5,
  KTM:5.75,
  RGN:6.5, DAC:6,
  SUB:7,
  ULN:8,
  LHR:1,
  CDG:2, FRA:2, MUC:2, ZRH:2, VIE:2, FCO:2, MXP:2,
  ARN:2, WAW:2, GVA:2, HEL:2,
  AMS:2, BRU:2, DUB:0, LIS:0,
  BCN:1, MAD:1, CPH:1, OSL:1, PRG:1, BUD:1, ZAG:1, BER:1,
  IST:3, ATH:2,
  DOH:3, AUH:4, DXB:4,
  CAI:3, ADD:3, JNB:2,
  SYD:10, MEL:10, BNE:10, CNS:10, AKL:12,
  // ── Codeshare-only cities (not ANA destinations — see VIA_CONNECTIONS) ────
  CMN:1, LOS:1, NBO:3, GRU:-3, SCL:-4, EZE:-3, GIG:-3, BOG:-5, LIM:-5, NAN:12, PPT:-10,
};

// ── Schedule ─────────────────────────────────────────────────────────────────
function m(h, min) { return h * 60 + (min || 0); }

const SCHEDULE = {
  // ── North America 3x daily ─────────────────────────────────────────────────
  JFK: { ac:[1,8,2], outDeps:[m(10,50),m(16,55),m(21,10)],    inArrs:[m(16,50),m(22,55),m(3,10)],     dur:810, nos:['NH 9', 'NH 11','NH 13'],    partner:'United',     partnerNo:'UA 79',  prices:{e:158000,pe:318000,bc:798000,fc:1980000} },
  LAX: { ac:[1,8,2], outDeps:[m(11,10),m(17,15),m(21,50)], inArrs:[m(9,40),m(15,45),m(20,20)],dur:600, nos:['NH 5', 'NH 7', 'NH 99'],   partner:'United',     partnerNo:'UA 837', prices:{e:145000,pe:295000,bc:748000,fc:1820000} },
  SFO: { ac:[1,8,2], outDeps:[m(10,50),m(16,45),m(21,10)],    inArrs:[m(8,20),m(14,15),m(18,40)],  dur:600, nos:['NH 1', 'NH 3', 'NH 107'],  partner:'United',     partnerNo:'UA 837', prices:{e:145000,pe:295000,bc:748000,fc:1820000} },
  ORD: { ac:[8,9,2], outDeps:[m(10,15),m(15,50),m(20,55)], inArrs:[m(13,45),m(19,20),m(0,25)],dur:750, nos:['NH 101','NH 103','NH 105'], partner:'United',    partnerNo:'UA 881', prices:{e:138000,pe:278000,bc:698000,fc:1680000} },
  SEA: { ac:[8,9,2], outDeps:[m(10,45),m(16,20),m(20,35)], inArrs:[m(7,15),m(12,50),m(17,5)],dur:540, nos:['NH 107','NH 109','NH 111'], partner:'United',    partnerNo:'UA 849', prices:{e:138000,pe:278000,bc:698000,fc:1520000} },
  // ── North America 2x daily ─────────────────────────────────────────────────
  HNL: { ac:[1,2],   outDeps:[m(9,10),m(20,5)],              inArrs:[m(2,10),m(13,5)],         dur:450, nos:['NH 183','NH 185'],          partner:'United',     partnerNo:'UA 803', prices:{e:92000, pe:185000,bc:468000,fc:1198000} },
  BOS: { ac:[9,3],   outDeps:[m(10,10),m(21,5)],              inArrs:[m(17,10),m(4,5)],            dur:840, nos:['NH 139','NH 141'],          partner:null,                             prices:{e:142000,pe:285000,bc:718000,fc:1868000} },
  IAH: { ac:[9,3],   outDeps:[m(10,50),m(21,15)],              inArrs:[m(18),m(4,25)],            dur:845, nos:['NH 115','NH 169'],          partner:'United',     partnerNo:'UA 7',   prices:{e:138000,pe:278000,bc:698000,fc:1698000} },
  YVR: { ac:[9,3],   outDeps:[m(10,50),m(21,25)],              inArrs:[m(8,20),m(18,55)],            dur:570, nos:['NH 117','NH 173'],          partner:'Air Canada',  partnerNo:'AC 5',  prices:{e:135000,pe:272000,bc:678000,fc:1498000} },
  YYZ: { ac:[8,9],   outDeps:[m(11,25),m(21,50)],           inArrs:[m(17,25),m(3,50)],            dur:810, nos:['NH 119','NH 175'],          partner:'Air Canada',  partnerNo:'AC 3',  prices:{e:148000,pe:298000,bc:748000,fc:1820000} },
  // ── North America 1x daily ─────────────────────────────────────────────────
  IAD: { ac:[9],     outDeps:[m(15,5)],                       inArrs:[m(22,5)],                  dur:840, nos:['NH 125'],                   partner:'United',     partnerNo:'UA 803', prices:{e:148000,pe:298000,bc:748000,fc:1820000} },
  DTW: { ac:[3],     outDeps:[m(14,10)],                       inArrs:[m(19,40)],                     dur:795, nos:['NH 127'],                   partner:null,                             prices:{e:132000,pe:268000,bc:668000,fc:null} },
  MSP: { ac:[3],     outDeps:[m(14,45)],                    inArrs:[m(16,15)],                     dur:690, nos:['NH 129'],                   partner:null,                             prices:{e:132000,pe:268000,bc:668000,fc:null} },
  ATL: { ac:[3],     outDeps:[m(15,20)],                       inArrs:[m(0,20)],                  dur:900, nos:['NH 131'],                   partner:null,                             prices:{e:135000,pe:272000,bc:678000,fc:null} },
  DFW: { ac:[9],     outDeps:[m(14,40)],                    inArrs:[m(20,40)],                     dur:810, nos:['NH 133'],                   partner:null,                             prices:{e:148000,pe:298000,bc:748000,fc:1820000} },
  DEN: { ac:[3],     outDeps:[m(14,45)],                    inArrs:[m(15,15)],                     dur:660, nos:['NH 135'],                   partner:'United',     partnerNo:'UA 133', prices:{e:132000,pe:268000,bc:668000,fc:null} },
  SAN: { ac:[3],     outDeps:[m(14,20)],                       inArrs:[m(13,50)],                     dur:630, nos:['NH 137'],                   partner:null,                             prices:{e:132000,pe:268000,bc:668000,fc:null} },
  YYC: { ac:[3],     outDeps:[m(14,35)],                    inArrs:[m(12,5)],                  dur:570, nos:['NH 143'],                   partner:'Air Canada',  partnerNo:'AC 11', prices:{e:128000,pe:255000,bc:638000,fc:null} },
  YUL: { ac:[9],     outDeps:[m(15,15)],                       inArrs:[m(23,15)],                  dur:870, nos:['NH 145'],                   partner:'Air Canada',  partnerNo:'AC 7',  prices:{e:148000,pe:298000,bc:748000,fc:1820000} },
  MEX: { ac:[9],     outDeps:[m(15,15)],                       inArrs:[m(0,15)],                     dur:900, nos:['NH 147'],                   partner:'Avianca',    partnerNo:'AV 5',   prices:{e:148000,pe:298000,bc:748000,fc:1820000} },
  MIA: { ac:[3],     outDeps:[m(14,40)],                    inArrs:[m(8,30)],                  dur:870, nos:['NH 193'],                   partner:null,                             prices:{e:145000,pe:290000,bc:738000,fc:null} },
  MCO: { ac:[3],     outDeps:[m(15,0)],                     inArrs:[m(9,0)],                   dur:870, nos:['NH 195'],                   partner:null,                             prices:{e:142000,pe:285000,bc:730000,fc:null} },
  // ── North America 4–5x weekly ─────────────────────────────────────────────
  PHL: { ac:[3],     outDeps:[m(14,40)],                    inArrs:[m(21,10)],                  dur:825, nos:['NH 149'],                   partner:null,                             prices:{e:142000,pe:285000,bc:718000,fc:null}, days:[1,3,4,5,0] },
  LAS: { ac:[3],     outDeps:[m(15,5)],                       inArrs:[m(13,55)],                     dur:610, nos:['NH 151'],                   partner:null,                             prices:{e:138000,pe:278000,bc:698000,fc:null}, days:[1,3,5,6] },
  SLC: { ac:[3],     outDeps:[m(15,25)],                       inArrs:[m(15,25)],                     dur:645, nos:['NH 153'],                   partner:null,                             prices:{e:132000,pe:268000,bc:668000,fc:null}, days:[2,4,5,0] },
  PHX: { ac:[3],     outDeps:[m(15,15)],                       inArrs:[m(14,45)],                     dur:630, nos:['NH 155'],                   partner:null,                             prices:{e:132000,pe:268000,bc:668000,fc:null}, days:[1,2,4,6] },
  CLT: { ac:[3],     outDeps:[m(15,10)],                       inArrs:[m(23,10)],                  dur:870, nos:['NH 157'],                   partner:null,                             prices:{e:135000,pe:272000,bc:678000,fc:null}, days:[1,3,5,6,0] },
  PDX: { ac:[3],     outDeps:[m(15,15)],                       inArrs:[m(11,25)],                     dur:560, nos:['NH 159'],                   partner:null,                             prices:{e:132000,pe:268000,bc:668000,fc:null}, days:[2,3,5,6] },
  MTY: { ac:[3],     outDeps:[m(15,25)],                       inArrs:[m(23,25)],                     dur:870, nos:['NH 161'],                   partner:null,                             prices:{e:142000,pe:285000,bc:718000,fc:null} },
  SJC: { ac:[3],     outDeps:[m(15,5)],                       inArrs:[m(12,35)],                     dur:600, nos:['NH 163'],                   partner:null,                             prices:{e:145000,pe:295000,bc:748000,fc:null} },
  PTY: { ac:[3],     outDeps:[m(15,5)],                       inArrs:[m(2,5)],                     dur:960, nos:['NH 165'],                   partner:'Copa Airlines',partnerNo:'CM 253',prices:{e:152000,pe:305000,bc:768000,fc:null}, days:[1,3,5] },
  // ── North America 3–4x weekly ─────────────────────────────────────────────
  IND: { ac:[3],     outDeps:[m(15,5)],                       inArrs:[m(19,35)],                     dur:765, nos:['NH 179'],                   partner:null,                             prices:{e:132000,pe:268000,bc:668000,fc:null}, days:[1,3,6] },
  STL: { ac:[3],     outDeps:[m(15,5)],                       inArrs:[m(18,35)],                     dur:750, nos:['NH 181'],                   partner:null,                             prices:{e:132000,pe:268000,bc:668000,fc:null}, days:[2,4,0] },
  MCI: { ac:[3],     outDeps:[m(15,20)],                       inArrs:[m(17,50)],                     dur:720, nos:['NH 187'],                   partner:null,                             prices:{e:132000,pe:268000,bc:668000,fc:null}, days:[1,4,6] },
  ANC: { ac:[3],     outDeps:[m(9,15)],                        inArrs:[m(5,45)],                     dur:450, nos:['NH 189'],                   partner:null,                             prices:{e:98000, pe:195000,bc:498000,fc:null}, days:[1,2,4,6] },
  AUS: { ac:[3],     outDeps:[m(15,50)],                    inArrs:[m(22,50)],                     dur:840, nos:['NH 191'],                   partner:null,                             prices:{e:138000,pe:278000,bc:698000,fc:null}, days:[1,3,5,0] },
  // ── Asia 3x daily ─────────────────────────────────────────────────────────
  PEK: { ac:[10,4,5], outDeps:[m(8,25),m(13,20),m(20,15)],    inArrs:[m(17,10),m(22,5),m(5)],   dur:210, nos:['NH 901','NH 903','NH 905'], partner:'Air China',   partnerNo:'CA 183', prices:{e:32000, pe:62000, bc:185000,fc:448000} },
  PVG: { ac:[10,4,5], outDeps:[m(8,50),m(13,55),m(20,35)], inArrs:[m(16,15),m(21,20),m(4)],dur:170,nos:['NH 907','NH 909','NH 911'], partner:'Air China',   partnerNo:'CA 937', prices:{e:28000, pe:55000, bc:168000,fc:398000} },
  HKG: { ac:[10,5,4,5,4], outDeps:[m(9,20),m(11,45),m(14,5),m(17,55),m(21,15)], inArrs:[m(20,5),m(22,30),m(0,50),m(4,40),m(8)], dur:270, nos:['NH 913','NH 969','NH 915','NH 971','NH 917'], partner:null, prices:{e:42000,pe:82000,bc:225000,fc:528000} },
  ICN: { ac:[10,4,5,5,5], outDeps:[m(7,30),m(8,15),m(13,10),m(16,30),m(19,55)], inArrs:[m(10,30),m(14,45),m(17,45),m(19,40),m(2,25)], dur:150, nos:['NH 861','NH 919','NH 921','NH 863','NH 923'], partner:null, prices:{e:28000, pe:52000, bc:158000,fc:368000} },
  SIN: { ac:[10,4,5], outDeps:[m(9,45),m(14,40),m(23,25)], inArrs:[m(2,15),m(7,10),m(15,55)], dur:450, nos:['NH 925','NH 927','NH 929'], partner:'Singapore Airlines', partnerNo:'SQ 11', prices:{e:55000,pe:108000,bc:288000,fc:698000} },
  TPE: { ac:[10,4,5], outDeps:[m(8,5),m(13,10),m(20,15)],    inArrs:[m(15,50),m(20,55),m(4)],dur:180, nos:['NH 931','NH 933','NH 935'], partner:'EVA Air',     partnerNo:'BR 197', prices:{e:32000, pe:62000, bc:185000,fc:448000} },
  BKK: { ac:[10,5,5], outDeps:[m(9,15),m(14,10),m(23,5)],    inArrs:[m(0,15),m(5,10),m(14,5)],   dur:390, nos:['NH 937','NH 939','NH 941'], partner:'Thai Airways', partnerNo:'TG 640', prices:{e:48000, pe:92000, bc:258000,fc:618000} },
  MNL: { ac:[10,5,5], outDeps:[m(9,25),m(14,5),m(21,15)],    inArrs:[m(20,30),m(1,10),m(8,20)],dur:280, nos:['NH 943','NH 945','NH 947'], partner:null,                             prices:{e:38000, pe:72000, bc:198000,fc:478000} },
  CGK: { ac:[10,5,5], outDeps:[m(9,20),m(15,25),m(23,10)],    inArrs:[m(2,20),m(8,25),m(16,10)],   dur:450, nos:['NH 949','NH 951','NH 953'], partner:null,                             prices:{e:52000, pe:98000, bc:268000,fc:638000} },
  KUL: { ac:[10,5,5], outDeps:[m(9,45),m(15,10),m(23,5)],    inArrs:[m(2,25),m(7,50),m(15,45)],dur:440, nos:['NH 955','NH 957','NH 959'], partner:null,                             prices:{e:52000, pe:98000, bc:268000,fc:638000} },
  // ── Asia 2x daily ─────────────────────────────────────────────────────────
  SGN: { ac:[10,5],   outDeps:[m(10,25),m(22,50)],           inArrs:[m(23,25),m(11,50)],         dur:330, nos:['NH 961','NH 963'],          partner:null,                             prices:{e:45000, pe:88000, bc:235000,fc:null} },
  HAN: { ac:[10,5],   outDeps:[m(9,45),m(22,20)],              inArrs:[m(21,30),m(10,5)],            dur:300, nos:['NH 965','NH 967'],          partner:null,                             prices:{e:42000, pe:82000, bc:218000,fc:null} },
  TSA: { ac:[10,5],   outDeps:[m(8,10),m(14,0)],               inArrs:[m(14,30),m(20,0)],             dur:165, nos:['NH 973','NH 975'],          partner:null,                             prices:{e:32000, pe:62000, bc:185000,fc:null} },
  // ── Asia 1x daily ─────────────────────────────────────────────────────────
  CAN: { ac:[5],     outDeps:[m(13,20)],                       inArrs:[m(23,15)],                     dur:245, nos:['NH 805'],                   partner:'Air China',   partnerNo:'CA 445', prices:{e:38000, pe:72000, bc:198000,fc:null} },
  SZX: { ac:[5],     outDeps:[m(13,15)],                       inArrs:[m(22,40)],                     dur:230, nos:['NH 801'],                   partner:'Shenzhen Airlines',partnerNo:'ZH 7012',prices:{e:38000,pe:72000,bc:198000,fc:null} },
  MFM: { ac:[5],     outDeps:[m(13,35)],                    inArrs:[m(23,10)],                  dur:235, nos:['NH 803'],                   partner:'Air China',   partnerNo:'CA 451', prices:{e:38000, pe:72000, bc:198000,fc:null} },
  HGH: { ac:[5],     outDeps:[m(9,55)],                     inArrs:[m(18,10)],                  dur:195, nos:['NH 807'],                   partner:'Air China',   partnerNo:'CA 441', prices:{e:32000, pe:62000, bc:178000,fc:null} },
  GMP: { ac:[10,5,5], outDeps:[m(7,0),m(9,20),m(15,45)], inArrs:[m(10,30),m(14,50),m(21,15)], dur:120, nos:['NH 865','NH 857','NH 859'], partner:null, prices:{e:22000, pe:42000, bc:125000,fc:null} },
  PUS: { ac:[5,5],   outDeps:[m(9,25),m(15,0)],             inArrs:[m(14,55),m(20,30)],            dur:120, nos:['NH 809','NH 871'],          partner:null,                             prices:{e:22000, pe:42000, bc:125000,fc:null} },
  TSN: { ac:[5],     outDeps:[m(9,20)],                        inArrs:[m(17,15)],                  dur:185, nos:['NH 811'],                   partner:'Air China',   partnerNo:'CA 435', prices:{e:28000, pe:55000, bc:162000,fc:null} },
  DAC: { ac:[5],     outDeps:[m(23,20)],                       inArrs:[m(18,50)],                     dur:420, nos:['NH 813'],                   partner:null,                             prices:{e:62000, pe:122000,bc:318000,fc:null} },
  KHI: { ac:[5],     outDeps:[m(23,15)],                       inArrs:[m(23,45)],                     dur:540, nos:['NH 815'],                   partner:null,                             prices:{e:72000, pe:142000,bc:368000,fc:null} },
  DEL: { ac:[10],     outDeps:[m(22,40)],                    inArrs:[m(19,10)],                    dur:540, nos:['NH 817'],                   partner:'Air India',   partnerNo:'AI 307', prices:{e:65000, pe:125000,bc:338000,fc:798000} },
  BOM: { ac:[5],     outDeps:[m(22,15)],                       inArrs:[m(20,45)],                  dur:600, nos:['NH 819'],                   partner:'Air India',   partnerNo:'AI 309', prices:{e:68000, pe:132000,bc:348000,fc:null} },
  HYD: { ac:[5],     outDeps:[m(22,5)],                       inArrs:[m(20,35)],                    dur:600, nos:['NH 821'],                   partner:'Air India',   partnerNo:'AI 311', prices:{e:65000, pe:125000,bc:338000,fc:null} },
  BLR: { ac:[5],     outDeps:[m(22,20)],                       inArrs:[m(21,50)],                    dur:630, nos:['NH 823'],                   partner:'Air India',   partnerNo:'AI 313', prices:{e:68000, pe:132000,bc:348000,fc:null} },
  CTU: { ac:[5],     outDeps:[m(14,10)],                       inArrs:[m(0,55)],                     dur:270, nos:['NH 825'],                   partner:'Air China',   partnerNo:'CA 457', prices:{e:38000, pe:72000, bc:198000,fc:null} },
  XIY: { ac:[5],     outDeps:[m(14,15)],                       inArrs:[m(0)],                     dur:240, nos:['NH 827'],                   partner:'Air China',   partnerNo:'CA 461', prices:{e:35000, pe:68000, bc:188000,fc:null} },
  CEB: { ac:[5],     outDeps:[m(10,35)],                    inArrs:[m(21,40)],                     dur:280, nos:['NH 829'],                   partner:null,                             prices:{e:42000, pe:82000, bc:215000,fc:null} },
  SUB: { ac:[5],     outDeps:[m(23,50)],                    inArrs:[m(17,50)],                     dur:420, nos:['NH 831'],                   partner:null,                             prices:{e:55000, pe:108000,bc:278000,fc:null} },
  GUM: { ac:[5],     outDeps:[m(9,35)],                     inArrs:[m(17,50)],                 dur:210, nos:['NH 977'],                   partner:null,                             prices:{e:28000, pe:52000, bc:145000,fc:null} },
  // ── Asia 5x weekly ────────────────────────────────────────────────────────
  TAE: { ac:[5],     outDeps:[m(9,25)],                        inArrs:[m(14,15)],                  dur:100, nos:['NH 833'],                   partner:null,                             prices:{e:20000, pe:38000, bc:115000,fc:null}, days:[1,2,3,5,6] },
  KWJ: { ac:[5],     outDeps:[m(9,15)],                        inArrs:[m(14,45)],                     dur:120, nos:['NH 835'],                   partner:null,                             prices:{e:20000, pe:38000, bc:115000,fc:null}, days:[1,3,4,5,0] },
  CJU: { ac:[5],     outDeps:[m(9,20)],                        inArrs:[m(15,10)],                     dur:130, nos:['NH 837'],                   partner:null,                             prices:{e:20000, pe:38000, bc:115000,fc:null}, days:[1,2,4,5,6] },
  HKT: { ac:[5],     outDeps:[m(10,10)],                       inArrs:[m(2,10)],                     dur:420, nos:['NH 839'],                   partner:null,                             prices:{e:48000, pe:92000, bc:248000,fc:null}, days:[2,4,5,6,0] },
  KHH: { ac:[5],     outDeps:[m(9,5)],                        inArrs:[m(16,20)],                     dur:195, nos:['NH 841'],                   partner:null,                             prices:{e:28000, pe:52000, bc:152000,fc:null}, days:[1,2,3,5,0] },
  DPS: { ac:[5],     outDeps:[m(13,30)],                       inArrs:[m(6,0)],                     dur:445, nos:['NH 843'],                   partner:null,                             prices:{e:54000, pe:102000, bc:278000,fc:null} },
  RGN: { ac:[5],     outDeps:[m(10,5)],                       inArrs:[m(0,5)],                     dur:390, nos:['NH 843'],                   partner:null,                             prices:{e:45000, pe:88000, bc:228000,fc:null}, days:[1,3,5,6] },
  KTM: { ac:[5],     outDeps:[m(23,25)],                       inArrs:[m(17,25)],                     dur:480, nos:['NH 845'],                   partner:null,                             prices:{e:62000, pe:122000,bc:315000,fc:null}, days:[2,4,6,0] },
  MLE: { ac:[5],     outDeps:[m(23,20)],                       inArrs:[m(19,50)],                     dur:540, nos:['NH 847'],                   partner:null,                             prices:{e:68000, pe:132000,bc:338000,fc:null}, days:[1,3,5,0] },
  CMB: { ac:[5],     outDeps:[m(23,15)],                       inArrs:[m(19,45)],                     dur:540, nos:['NH 849'],                   partner:null,                             prices:{e:65000, pe:128000,bc:328000,fc:null}, days:[2,4,6,0] },
  ULN: { ac:[5],     outDeps:[m(14,10)],                       inArrs:[m(0,55)],                     dur:270, nos:['NH 851'],                   partner:null,                             prices:{e:32000, pe:62000, bc:168000,fc:null}, days:[1,3,4,0] },
  PNH: { ac:[5],     outDeps:[m(10,25)],                       inArrs:[m(0,25)],                  dur:360, nos:['NH 853'],                   partner:null,                             prices:{e:42000, pe:82000, bc:215000,fc:null}, days:[2,4,5,6] },
  VTE: { ac:[5],     outDeps:[m(10,25)],                       inArrs:[m(0,25)],                  dur:360, nos:['NH 855'],                   partner:null,                             prices:{e:42000, pe:82000, bc:215000,fc:null}, days:[1,3,5,6] },
  // ── Domestic ──────────────────────────────────────────────────────────────────
  // ac 6 = A350-900 Domestic (FC 6 / Premium Class 40 / EC 270), ac 7 = B787-8 Domestic (Premium Class 35 / EC 243)
  OKA: { ac:[6,6,6,7,6,6,7,7], outDeps:[m(6,0),m(8,0),m(10,0),m(12,0),m(14,0),m(16,0),m(18,0),m(20,0)], inArrs:[m(12,15),m(14,15),m(16,15),m(18,15),m(20,15),m(22,15),m(0,15),m(2,15)], dur:165, nos:['NH 3001','NH 3003','NH 3005','NH 3007','NH 3009','NH 3011','NH 3013','NH 3015'], partner:null, prices:{e:22000,pe:null,bc:42000,fc:58000}, domestic:true },
  FUK: { ac:[6,6,6,7,6,7,6,7,7,7,7,7], outDeps:[m(6,0),m(7,30),m(9,0),m(10,30),m(12,0),m(13,30),m(15,0),m(16,30),m(18,0),m(19,30),m(21,0),m(22,30)], inArrs:[m(10,20),m(11,50),m(13,20),m(14,50),m(16,20),m(17,50),m(19,20),m(20,50),m(22,20),m(23,50),m(1,20),m(2,50)], dur:110, nos:['NH 3101','NH 3103','NH 3105','NH 3107','NH 3109','NH 3111','NH 3113','NH 3115','NH 3117','NH 3119','NH 3121','NH 3123'], partner:null, prices:{e:16000,pe:null,bc:32000,fc:45000}, domestic:true },
  ITM: { ac:[6,6,7,7,7,7,7,6,6,7], outDeps:[m(6,0),m(7,30),m(9,0),m(10,30),m(12,0),m(14,0),m(15,30),m(17,0),m(18,30),m(20,30)], inArrs:[m(9,0),m(10,30),m(12,0),m(13,30),m(15,0),m(17,0),m(18,30),m(20,0),m(21,30),m(23,30)], dur:75, nos:['NH 3201','NH 3203','NH 3205','NH 3207','NH 3209','NH 3211','NH 3213','NH 3215','NH 3217','NH 3219'], partner:null, prices:{e:12000,pe:null,bc:24000,fc:34000}, domestic:true },
  NGO: { ac:[6,7,6,7,7], outDeps:[m(8,0),m(10,30),m(13,0),m(15,30),m(18,0)], inArrs:[m(10,5),m(12,35),m(15,5),m(17,35),m(20,5)], dur:50, nos:['NH 3301','NH 3303','NH 3305','NH 3307','NH 3309'], partner:null, prices:{e:8000,pe:null,bc:16000,fc:22000}, domestic:true },
  CTS: { ac:[6,7,6,7,6,7,6,7,6,7,6,7], outDeps:[m(6,0),m(7,30),m(9,0),m(10,30),m(12,0),m(13,30),m(15,0),m(16,30),m(18,0),m(19,30),m(21,0),m(22,30)], inArrs:[m(9,55),m(11,25),m(12,55),m(14,25),m(15,55),m(17,25),m(18,55),m(20,25),m(21,55),m(23,25),m(0,55),m(2,25)], dur:100, nos:['NH 3401','NH 3403','NH 3405','NH 3407','NH 3409','NH 3411','NH 3413','NH 3415','NH 3417','NH 3419','NH 3421','NH 3423'], partner:null, prices:{e:18000,pe:null,bc:36000,fc:50000}, domestic:true },
  // ── KIX ↔ NRT Hub Connector (3x daily, B787-8 domestic) ──────────────────
  KIX: { ac:[6,6,7,7,7], outDeps:[m(9,30),m(11,0),m(13,0),m(16,30),m(20,0)], inArrs:[m(8,45),m(10,15),m(12,15),m(15,30),m(18,45)], dur:75, nos:['NH 9201','NH 9203','NH 9205','NH 9207','NH 9209'], partner:null, prices:{e:13000,pe:null,bc:26000,fc:36000}, domestic:true },
  // ── Europe 2x daily ───────────────────────────────────────────────────────
  LHR: { ac:[1,9],   outDeps:[m(11,20),m(22,45)],           inArrs:[m(14,50),m(2,15)],            dur:750, nos:['NH 211','NH 213'],          partner:null,                             prices:{e:168000,pe:335000,bc:848000,fc:2180000} },
  CDG: { ac:[8,9],   outDeps:[m(11,55),m(22,50)],           inArrs:[m(14,55),m(1,50)],         dur:735, nos:['NH 201','NH 203'],          partner:null,                             prices:{e:165000,pe:328000,bc:828000,fc:2080000} },
  FRA: { ac:[9,3],   outDeps:[m(12,5),m(22,40)],           inArrs:[m(14,35),m(1,10)],            dur:720, nos:['NH 205','NH 207'],          partner:'Lufthansa',   partnerNo:'LH 715', prices:{e:162000,pe:325000,bc:818000,fc:2050000} },
  MUC: { ac:[9,3],   outDeps:[m(12,25),m(22,35)],           inArrs:[m(15,25),m(1,35)],         dur:735, nos:['NH 209','NH 215'],          partner:'Lufthansa',   partnerNo:'LH 723', prices:{e:162000,pe:325000,bc:818000,fc:2050000} },
  IST: { ac:[9,3],   outDeps:[m(12,50),m(22,45)],           inArrs:[m(14,20),m(0,15)],         dur:720, nos:['NH 217','NH 219'],          partner:'Turkish Airlines',partnerNo:'TK 51',prices:{e:158000,pe:315000,bc:798000,fc:1980000} },
  SYD: { ac:[2,3],   outDeps:[m(10,5),m(23,25)],              inArrs:[m(7,35),m(20,55)],         dur:570, nos:['NH 891','NH 893'],          partner:'Air New Zealand',partnerNo:'NZ 91',prices:{e:118000,pe:235000,bc:598000,fc:1480000} },
  // ── Europe 1x daily ───────────────────────────────────────────────────────
  // HEL served via WAW — see VIA_CONNECTIONS
  BRU: { ac:[3],     outDeps:[m(12,5)],                       inArrs:[m(15,35)],                  dur:750, nos:['NH 241'],                   partner:'Brussels Airlines',partnerNo:'SN 291',prices:{e:158000,pe:315000,bc:798000,fc:null} },
  ARN: { ac:[3],     outDeps:[m(11,50)],                    inArrs:[m(13,20)],                     dur:690, nos:['NH 233'],                   partner:null,                             prices:{e:158000,pe:315000,bc:798000,fc:null} },
  MXP: { ac:[3],     outDeps:[m(12,50)],                    inArrs:[m(15,50)],                     dur:735, nos:['NH 257'],                   partner:'ITA Airways',  partnerNo:'AZ 789', prices:{e:162000,pe:325000,bc:818000,fc:null} },
  // ── Europe 4–5x weekly (direct ANA) ──────────────────────────────────────
  WAW: { ac:[3],     outDeps:[m(22,35)],                    inArrs:[m(0,5)],                     dur:690, nos:['NH 245'],                   partner:'LOT Polish',   partnerNo:'LO 77',  prices:{e:152000,pe:305000,bc:768000,fc:null} },
  VIE: { ac:[3],     outDeps:[m(22,50)],                    inArrs:[m(1,20)],                     dur:720, nos:['NH 247'],                   partner:'Austrian',     partnerNo:'OS 51',  prices:{e:155000,pe:308000,bc:778000,fc:null} },
  ZRH: { ac:[3],     outDeps:[m(22,50)],                    inArrs:[m(1,50)],                     dur:735, nos:['NH 249'],                   partner:'Swiss',        partnerNo:'LX 161', prices:{e:158000,pe:315000,bc:798000,fc:null} },
  GVA: { ac:[3],     outDeps:[m(22,45)],                    inArrs:[m(2,15)],                     dur:750, nos:['NH 251'],                   partner:'Swiss',        partnerNo:'LX 165', prices:{e:158000,pe:315000,bc:798000,fc:null} },
  FCO: { ac:[3],     outDeps:[m(22,15)],                       inArrs:[m(1,45)],                     dur:750, nos:['NH 253'],                   partner:'ITA Airways',  partnerNo:'AZ 791', prices:{e:158000,pe:315000,bc:798000,fc:null} },
  // ── Middle East ───────────────────────────────────────────────────────────
  DOH: { ac:[3],     outDeps:[m(23,25)],                       inArrs:[m(23,55)],                     dur:660, nos:['NH 271'],                   partner:null,                             prices:{e:88000, pe:175000,bc:448000,fc:null} },
  AUH: { ac:[3],     outDeps:[m(23,10)],                       inArrs:[m(1,40)],                     dur:720, nos:['NH 273'],                   partner:null,                             prices:{e:92000, pe:185000,bc:468000,fc:null} },
  DXB: { ac:[2],     outDeps:[m(23,15)],                       inArrs:[m(23,0)],                     dur:660, nos:['NH 275'],                   partner:null,                             prices:{e:92000, pe:185000,bc:468000,fc:1180000} },
  // ── Africa ────────────────────────────────────────────────────────────────
  CAI: { ac:[3],     outDeps:[m(23,15)],                       inArrs:[m(6,15)],                     dur:840, nos:['NH 291'],                   partner:'EgyptAir',     partnerNo:'MS 927', prices:{e:138000,pe:278000,bc:698000,fc:null} },
  ADD: { ac:[3],     outDeps:[m(23,15)],                       inArrs:[m(7,15)],                     dur:870, nos:['NH 293'],                   partner:'Ethiopian',    partnerNo:'ET 665', prices:{e:145000,pe:292000,bc:738000,fc:null} },
  // JNB served via ADD — see VIA_CONNECTIONS
  // ── Oceania ───────────────────────────────────────────────────────────────
  MEL: { ac:[3],     outDeps:[m(10,25)],                       inArrs:[m(8,55)],                  dur:600, nos:['NH 895'],                   partner:null,                             prices:{e:108000,pe:215000,bc:548000,fc:null} },
  BNE: { ac:[3],     outDeps:[m(10,55)],                    inArrs:[m(7,25)],                     dur:570, nos:['NH 897'],                   partner:null,                             prices:{e:102000,pe:202000,bc:518000,fc:null} },
  PER: { ac:[3],     outDeps:[m(11,5)],                       inArrs:[m(10,35)],                  dur:630, nos:['NH 899'],                   partner:null,                             prices:{e:98000, pe:195000,bc:498000,fc:null} },
  AKL: { ac:[3],     outDeps:[m(22,25)],                       inArrs:[m(23,55)],                    dur:690, nos:['NH 889'],                   partner:'Air New Zealand',partnerNo:'NZ 97',prices:{e:125000,pe:248000,bc:628000,fc:null} },
  CNS: { ac:[3],     outDeps:[m(10,5)],                       inArrs:[m(3,5)],                     dur:450, nos:['NH 887'],                   partner:null,                             prices:{e:82000, pe:162000,bc:418000,fc:null}, days:[1,2,4,5,6] },
};

// ── Via-connections ───────────────────────────────────────────────────────────
const VIA_CONNECTIONS = {
  DUB: { viaCode:'BRU', freedom:true, partner:'ANA', partnerNo:'NH 501', dur:105, note:'ANA freedom flight via Brussels'   },
  CPH: { viaCode:'MUC', freedom:true, partner:'ANA', partnerNo:'NH 503', dur:150, note:'ANA freedom flight via Munich'    },
  HEL: { viaCode:'WAW', freedom:true, partner:'ANA', partnerNo:'NH 505', dur:145, note:'ANA freedom flight via Warsaw'     },
  OSL: { viaCode:'ARN', freedom:true, partner:'ANA', partnerNo:'NH 507', dur:90,  note:'ANA freedom flight via Stockholm'  },
  BER: { viaCode:'FRA', freedom:true, partner:'ANA', partnerNo:'NH 509', dur:70,  note:'ANA freedom flight via Frankfurt'  },
  PRG: { viaCode:'MUC', freedom:true, partner:'ANA', partnerNo:'NH 511', dur:95,  note:'ANA freedom flight via Munich'     },
  LIS: { viaCode:'ZRH', freedom:true, partner:'ANA', partnerNo:'NH 513', dur:200, note:'ANA freedom flight via Zurich'     },
  MAD: { viaCode:'GVA', freedom:true, partner:'ANA', partnerNo:'NH 515', dur:125, note:'ANA freedom flight via Geneva'     },
  BCN: { viaCode:'FCO', freedom:true, partner:'ANA', partnerNo:'NH 517', dur:135, note:'ANA freedom flight via Rome'       },
  ATH: { viaCode:'IST', freedom:true, partner:'ANA', partnerNo:'NH 519', dur:135, note:'ANA freedom flight via Istanbul'   },
  BUD: { viaCode:'IST', freedom:true, partner:'ANA', partnerNo:'NH 521', dur:215, note:'ANA freedom flight via Istanbul'   },
  ZAG: { viaCode:'VIE', freedom:true, partner:'ANA', partnerNo:'NH 523', dur:70,  note:'ANA freedom flight via Vienna'     },
  AMS: { viaCode:'FRA', freedom:true, partner:'ANA', partnerNo:'NH 525', dur:60,  note:'ANA freedom flight via Frankfurt'  },
  JNB: { viaCode:'ADD', freedom:true, partner:'ANA', partnerNo:'NH 527', dur:240, note:'ANA freedom flight via Addis Ababa'},

  // ── Codeshare-only connections ─────────────────────────────────────────────
  // NOT ANA destinations/freedom flights — these are interline itineraries:
  // ANA operates the NRT↔hub leg, the partner airline operates its own
  // flight (own number, own metal) on to the final city. Shown in search
  // results as "ANA / <Partner>", not counted in ANA route/destination stats.
  CMN: { viaCode:'IST', partner:'Turkish Airlines',  partnerNo:'TK 559', dur:285, note:'Codeshare connection on Turkish Airlines', acName:'Airbus A321neo' },
  LOS: { viaCode:'ADD', partner:'Ethiopian Airlines', partnerNo:'ET 901', dur:325, note:'Codeshare connection on Ethiopian Airlines', acName:'Boeing 787-9' },
  NBO: { viaCode:'FRA', partner:'Lufthansa',          partnerNo:'LH 590', dur:490, note:'Codeshare connection on Lufthansa', acName:'Boeing 787-9' },
  GRU: { viaCode:'FRA', partner:'Lufthansa',          partnerNo:'LH 506', dur:755, note:'Codeshare connection on Lufthansa', acName:'Boeing 777-300ER' },
  SCL: { viaCode:'PTY', partner:'Copa Airlines',      partnerNo:'CM 195', dur:395, note:'Codeshare connection on Copa Airlines', acName:'Boeing 737 MAX 9' },
  EZE: { viaCode:'PTY', partner:'Copa Airlines',      partnerNo:'CM 213', dur:432, note:'Codeshare connection on Copa Airlines', acName:'Boeing 737 MAX 9' },
  GIG: { viaCode:'PTY', partner:'Copa Airlines',      partnerNo:'CM 231', dur:434, note:'Codeshare connection on Copa Airlines', acName:'Boeing 737-800' },
  BOG: { viaCode:'IAH', partner:'United Airlines',    partnerNo:'UA 205', dur:295, note:'Codeshare connection on United Airlines', acName:'Boeing 737-900' },
  LIM: { viaCode:'IAH', partner:'United Airlines',    partnerNo:'UA 843', dur:395, note:'Codeshare connection on United Airlines', acName:'Boeing 787-8' },
  NAN: { viaCode:'AKL', partner:'Air New Zealand',    partnerNo:'NZ 851', dur:185, note:'Codeshare connection on Air New Zealand', acName:'Airbus A321neo' },
  PPT: { viaCode:'AKL', partner:'Air New Zealand',    partnerNo:'NZ 71',  dur:300, note:'Codeshare connection on Air New Zealand', acName:'Boeing 787-9' },
};

// ── Partner own-flight operations ─────────────────────────────────────────────
const PARTNER_OPS = {
  PEK: { name:'Air China',          nos:['CA 181','CA 183'],   outDeps:[m(10),   m(16,30)], inArrs:[m(11,30),m(18)],    dur:null,  acName:'Airbus A330-200' },
  PVG: { name:'Air China',          nos:['CA 935','CA 937'],   outDeps:[m(9,30), m(16)],    inArrs:[m(10,30),m(17)],    dur:null,  acName:'Boeing 737 MAX' },
  CAN: { name:'Air China',          nos:['CA 443'],            outDeps:[m(14)],             inArrs:[m(13)],             dur:245,   acName:'Airbus A330-200' },
  SZX: { name:'Shenzhen Airlines', nos:['ZH 7010'],           outDeps:[m(9,30)],           inArrs:[m(8,30)],           dur:230,   acName:'Airbus A320neo' },
  SIN: { name:'Singapore Airlines', nos:['SQ 11', 'SQ 639'],  outDeps:[m(11),   m(23,30)], inArrs:[m(9),    m(22)],    dur:null,  acName:'Airbus A350-900' },
  TPE: { name:'EVA Air',            nos:['BR 197','BR 195'],   outDeps:[m(9,30), m(17)],    inArrs:[m(11),   m(18,30)], dur:null,  acName:'Boeing 787-9' },
  BKK: { name:'Thai Airways',       nos:['TG 640','TG 642'],   outDeps:[m(11),   m(22,30)], inArrs:[m(10),   m(21,30)], dur:null,  acName:'Boeing 777-300ER' },
  DEL: { name:'Air India',          nos:['AI 307'],            outDeps:[m(23)],             inArrs:[m(11)],             dur:null,  acName:'Airbus A350-900' },
  FRA: { name:'Lufthansa',          nos:['LH 715'],            outDeps:[m(14)],             inArrs:[m(7,30)],           dur:720,   acName:'Airbus A340-300' },
  MUC: { name:'Lufthansa',          nos:['LH 723'],            outDeps:[m(14)],             inArrs:[m(7,30)],           dur:735,   acName:'Airbus A340-300' },
  IST: { name:'Turkish Airlines',   nos:['TK 51'],             outDeps:[m(14,30)],          inArrs:[m(8,30)],           dur:720,   acName:'Boeing 777-300ER' },
  WAW: { name:'LOT Polish Airlines',nos:['LO 77'],             outDeps:[m(22,30)],          inArrs:[m(7)],              dur:690,   acName:'Boeing 787-9' },
  ZRH: { name:'Swiss',              nos:['LX 161'],            outDeps:[m(22,30)],          inArrs:[m(7)],              dur:735,   acName:'Airbus A340-300' },
  FCO: { name:'ITA Airways',        nos:['AZ 791'],            outDeps:[m(22)],             inArrs:[m(7)],              dur:750,   acName:'Airbus A320neo' },
  VIE: { name:'Austrian Airlines',  nos:['OS 51'],             outDeps:[m(22,30)],          inArrs:[m(7)],              dur:720,   acName:'Boeing 767-300ER' },
  SYD: { name:'Air New Zealand',    nos:['NZ 91'],             outDeps:[m(23,30)],          inArrs:[m(22)],             dur:570,   acName:'Boeing 787-9' },
  AKL: { name:'Air New Zealand',    nos:['NZ 97'],             outDeps:[m(23,30)],          inArrs:[m(22)],             dur:690,   acName:'Boeing 787-9' },
  EWR: { name:'United Airlines',    nos:['UA 79'],             outDeps:[m(14)],             inArrs:[m(10)],             dur:810,   acName:'Boeing 787-9', prices:{e:145000,pe:null,bc:738000,fc:null} },
  ORD: { name:'United Airlines',    nos:['UA 881','UA 883'],   outDeps:[m(15),   m(22)],    inArrs:[m(12),   m(18)],    dur:750,   acName:'Boeing 787-9' },
  IAH: { name:'United Airlines',    nos:['UA 7',  'UA 837'],   outDeps:[m(14,30),m(22)],    inArrs:[m(8),    m(17)],    dur:845,   acName:'Boeing 777-200' },
  SEA: { name:'United Airlines',    nos:['UA 849'],            outDeps:[m(15)],             inArrs:[m(12)],             dur:540,   acName:'Boeing 787-9' },
  SFO: { name:'United Airlines',    nos:['UA 837'],            outDeps:[m(15)],             inArrs:[m(13)],             dur:570,   acName:'Boeing 777-200' },
  LAX: { name:'United Airlines',    nos:['UA 801'],            outDeps:[m(15)],             inArrs:[m(13,30)],          dur:600,   acName:'Boeing 777-200' },
  DEN: { name:'United Airlines',    nos:['UA 133'],            outDeps:[m(22)],             inArrs:[m(10)],             dur:660,   acName:'Boeing 787-9' },
  IAD: { name:'United Airlines',    nos:['UA 803'],            outDeps:[m(22)],             inArrs:[m(9)],              dur:840,   acName:'Boeing 787-9' },
  HNL: { name:'United Airlines',    nos:['UA 803'],            outDeps:[m(14)],             inArrs:[m(12)],             dur:450,   acName:'Boeing 777-200' },
  YVR: { name:'Air Canada',         nos:['AC 5'],              outDeps:[m(14)],             inArrs:[m(12,30)],          dur:570,   acName:'Boeing 787-9' },
  YYZ: { name:'Air Canada',         nos:['AC 3'],              outDeps:[m(14,30)],          inArrs:[m(12,30)],          dur:810,   acName:'Airbus A330-300' },
  YUL: { name:'Air Canada',         nos:['AC 7'],              outDeps:[m(22,30)],          inArrs:[m(8)],              dur:870,   acName:'Boeing 787-9' },
};

// ── JAL Schedule (direct NRT↔dest only — JAL is modeled as a leaner, more
// selective second carrier: 3 widebody types (A350-1000/787-9/787-8, reusing
// ACFT codes 2/3/5), no connecting-hub or codeshare network of its own in this
// model. Frequencies below are the daily-departure count nearest each route's
// real weekly total (e.g. a 10/week route shows as 2x/day, a 4/week route as
// 1x/day) — the demo has no weekly-calendar view, so day-of-week gating is not
// modeled for these routes; they show every day they're searched. ─────────────
const JAL_SCHEDULE = {
  // ── Asia 5x daily (787-9) ────────────────────────────────────────────────
  ICN: { ac:[3,3,3,3,3], outDeps:[m(7,20),m(9,50),m(13,15),m(16,40),m(20,20)], inArrs:[m(10,15),m(12,45),m(17,30),m(21,10),m(0,45)], dur:150, nos:['JL 701','JL 703','JL 705','JL 707','JL 709'], prices:{e:28000,pe:52000,bc:158000,fc:null} },
  HKG: { ac:[3,3,3,3,3], outDeps:[m(7,20),m(9,50),m(13,15),m(16,40),m(20,20)], inArrs:[m(10,15),m(12,45),m(17,30),m(21,10),m(0,45)], dur:270, nos:['JL 711','JL 713','JL 715','JL 717','JL 719'], prices:{e:42000,pe:82000,bc:225000,fc:null} },
  SIN: { ac:[3,3,3,3,3], outDeps:[m(7,20),m(9,50),m(13,15),m(16,40),m(20,20)], inArrs:[m(10,15),m(12,45),m(17,30),m(21,10),m(0,45)], dur:450, nos:['JL 721','JL 723','JL 725','JL 727','JL 729'], prices:{e:55000,pe:108000,bc:288000,fc:null} },
  // ── Asia 3x daily ────────────────────────────────────────────────────────
  BKK: { ac:[3,3,3],   outDeps:[m(8,45),m(14,20),m(22,5)], inArrs:[m(11,30),m(17,50),m(1,20)], dur:390, nos:['JL 731','JL 733','JL 735'], prices:{e:48000,pe:92000,bc:258000,fc:null} },
  CGK: { ac:[3,3,3],   outDeps:[m(8,45),m(14,20),m(22,5)], inArrs:[m(11,30),m(17,50),m(1,20)], dur:450, nos:['JL 741','JL 743','JL 745'], prices:{e:52000,pe:98000,bc:268000,fc:null} },
  KUL: { ac:[3,3,3],   outDeps:[m(8,45),m(14,20),m(22,5)], inArrs:[m(11,30),m(17,50),m(1,20)], dur:440, nos:['JL 751','JL 753','JL 755'], prices:{e:52000,pe:98000,bc:268000,fc:null} },
  GMP: { ac:[5,5,5],   outDeps:[m(8,45),m(14,20),m(22,5)], inArrs:[m(11,30),m(17,50),m(1,20)], dur:120, nos:['JL 761','JL 763','JL 765'], prices:{e:22000,pe:42000,bc:125000,fc:null} },
  // ── Asia 2x daily ────────────────────────────────────────────────────────
  PUS: { ac:[5,5],     outDeps:[m(8,55),m(15,20)],         inArrs:[m(12,10),m(19,35)],         dur:120, nos:['JL 801','JL 803'], prices:{e:22000,pe:42000,bc:125000,fc:null} },
  PEK: { ac:[5,5],     outDeps:[m(8,55),m(15,20)],         inArrs:[m(12,10),m(19,35)],         dur:210, nos:['JL 811','JL 813'], prices:{e:32000,pe:62000,bc:185000,fc:null} },
  PVG: { ac:[5,5],     outDeps:[m(8,55),m(15,20)],         inArrs:[m(12,10),m(19,35)],         dur:170, nos:['JL 821','JL 823'], prices:{e:28000,pe:55000,bc:168000,fc:null} },
  HAN: { ac:[3,3],     outDeps:[m(8,55),m(15,20)],         inArrs:[m(12,10),m(19,35)],         dur:300, nos:['JL 831','JL 833'], prices:{e:42000,pe:82000,bc:218000,fc:null} },
  SGN: { ac:[3,3],     outDeps:[m(8,55),m(15,20)],         inArrs:[m(12,10),m(19,35)],         dur:330, nos:['JL 841','JL 843'], prices:{e:45000,pe:88000,bc:235000,fc:null} },
  MNL: { ac:[3,3],     outDeps:[m(8,55),m(15,20)],         inArrs:[m(12,10),m(19,35)],         dur:280, nos:['JL 851','JL 853'], prices:{e:38000,pe:72000,bc:198000,fc:null} },
  TPE: { ac:[3,5],     outDeps:[m(8,55),m(15,20)],         inArrs:[m(12,10),m(19,35)],         dur:180, nos:['JL 861','JL 863'], prices:{e:32000,pe:62000,bc:185000,fc:null} },
  // ── Asia 1x daily, day bank (787-8) ──────────────────────────────────────
  HGH: { ac:[5],       outDeps:[m(9,40)],                  inArrs:[m(18,20)],                  dur:195, nos:['JL 901'], prices:{e:32000,pe:62000,bc:178000,fc:null} },
  CTU: { ac:[5],       outDeps:[m(9,40)],                  inArrs:[m(18,20)],                  dur:270, nos:['JL 911'], prices:{e:38000,pe:72000,bc:198000,fc:null} },
  CAN: { ac:[5],       outDeps:[m(9,40)],                  inArrs:[m(18,20)],                  dur:245, nos:['JL 921'], prices:{e:38000,pe:72000,bc:198000,fc:null} },
  MFM: { ac:[5],       outDeps:[m(9,40)],                  inArrs:[m(18,20)],                  dur:235, nos:['JL 931'], prices:{e:38000,pe:72000,bc:198000,fc:null} },
  CEB: { ac:[5],       outDeps:[m(9,40)],                  inArrs:[m(18,20)],                  dur:280, nos:['JL 881'], prices:{e:42000,pe:82000,bc:215000,fc:null} },
  // ── Asia 1x daily, night bank (long thin routes) ─────────────────────────
  DEL: { ac:[3],       outDeps:[m(22,45)],                 inArrs:[m(13,30)],                  dur:540, nos:['JL 871'], prices:{e:65000,pe:125000,bc:338000,fc:null} },
  DOH: { ac:[3],       outDeps:[m(22,45)],                 inArrs:[m(13,30)],                  dur:660, nos:['JL 891'], prices:{e:88000,pe:175000,bc:448000,fc:null} },
  BOM: { ac:[5],       outDeps:[m(22,45)],                 inArrs:[m(13,30)],                  dur:600, nos:['JL 941'], prices:{e:68000,pe:132000,bc:348000,fc:null} },
  // ── North America 2x daily (A350-1000) ───────────────────────────────────
  LAX: { ac:[2,2],     outDeps:[m(11,40),m(20,15)],        inArrs:[m(9,15),m(18,50)],          dur:600, nos:['JL 001','JL 003'], prices:{e:145000,pe:295000,bc:748000,fc:1820000} },
  SFO: { ac:[2,2],     outDeps:[m(11,40),m(20,15)],        inArrs:[m(9,15),m(18,50)],          dur:600, nos:['JL 011','JL 013'], prices:{e:145000,pe:295000,bc:748000,fc:1820000} },
  ORD: { ac:[2,2],     outDeps:[m(11,40),m(20,15)],        inArrs:[m(9,15),m(18,50)],          dur:750, nos:['JL 021','JL 023'], prices:{e:138000,pe:278000,bc:698000,fc:1680000} },
  JFK: { ac:[2,2],     outDeps:[m(11,40),m(20,15)],        inArrs:[m(9,15),m(18,50)],          dur:810, nos:['JL 031','JL 033'], prices:{e:158000,pe:318000,bc:798000,fc:1980000} },
  HNL: { ac:[2,2],     outDeps:[m(11,40),m(20,15)],        inArrs:[m(9,15),m(18,50)],          dur:450, nos:['JL 041','JL 043'], prices:{e:92000, pe:185000,bc:468000,fc:1198000} },
  DFW: { ac:[2,2],     outDeps:[m(11,40),m(20,15)],        inArrs:[m(9,15),m(18,50)],          dur:810, nos:['JL 051','JL 053'], prices:{e:148000,pe:298000,bc:748000,fc:1820000} },
  // ── North America 2x daily (787-9, thinner) ──────────────────────────────
  SEA: { ac:[3,3],     outDeps:[m(11,40),m(20,15)],        inArrs:[m(9,15),m(18,50)],          dur:540, nos:['JL 061','JL 063'], prices:{e:138000,pe:278000,bc:698000,fc:null} },
  // ── North America 1x daily (787-9) ───────────────────────────────────────
  SAN: { ac:[3],       outDeps:[m(14,50)],                 inArrs:[m(16,35)],                  dur:630, nos:['JL 071'], prices:{e:132000,pe:268000,bc:668000,fc:null} },
  BOS: { ac:[3],       outDeps:[m(14,50)],                 inArrs:[m(16,35)],                  dur:840, nos:['JL 081'], prices:{e:142000,pe:285000,bc:718000,fc:null} },
  YVR: { ac:[3],       outDeps:[m(14,50)],                 inArrs:[m(16,35)],                  dur:570, nos:['JL 091'], prices:{e:135000,pe:272000,bc:678000,fc:null} },
  MUC: { ac:[3],       outDeps:[m(22,30)],                 inArrs:[m(0,40)],                   dur:735, nos:['JL 431'], prices:{e:162000,pe:325000,bc:818000,fc:null} },
  YUL: { ac:[3],       outDeps:[m(14,50)],                 inArrs:[m(16,35)],                  dur:870, nos:['JL 111'], prices:{e:148000,pe:298000,bc:748000,fc:null} },
  MEX: { ac:[3],       outDeps:[m(14,50)],                 inArrs:[m(16,35)],                  dur:900, nos:['JL 121'], prices:{e:148000,pe:298000,bc:748000,fc:null} },
  // ── North America 1x daily (A350-1000) ───────────────────────────────────
  YYZ: { ac:[2],       outDeps:[m(14,50)],                 inArrs:[m(16,35)],                  dur:810, nos:['JL 101'], prices:{e:148000,pe:298000,bc:748000,fc:1820000} },
  // ── Europe 2x daily (A350-1000) ───────────────────────────────────────────
  LHR: { ac:[2,2],     outDeps:[m(10,5),m(22,0)],          inArrs:[m(13,20),m(1,45)],          dur:750, nos:['JL 401','JL 403'], prices:{e:168000,pe:335000,bc:848000,fc:2180000} },
  CDG: { ac:[2,2],     outDeps:[m(10,5),m(22,0)],          inArrs:[m(13,20),m(1,45)],          dur:735, nos:['JL 411','JL 413'], prices:{e:165000,pe:328000,bc:828000,fc:2080000} },
  // ── Europe 1x daily, night bank (A350-1000) ──────────────────────────────
  FRA: { ac:[2],       outDeps:[m(22,30)],                 inArrs:[m(0,40)],                   dur:720, nos:['JL 421'], prices:{e:162000,pe:325000,bc:818000,fc:2050000} },
  HEL: { ac:[2],       outDeps:[m(22,30)],                 inArrs:[m(0,40)],                   dur:585, nos:['JL 441'], prices:{e:155000,pe:310000,bc:780000,fc:1900000} },
  // ── Oceania 1x daily (A350-1000 / 787-9) ─────────────────────────────────
  SYD: { ac:[2],       outDeps:[m(10,45)],                 inArrs:[m(9,5)],                    dur:570, nos:['JL 771'], prices:{e:118000,pe:235000,bc:598000,fc:1480000} },
  MEL: { ac:[3],       outDeps:[m(10,45)],                 inArrs:[m(9,5)],                    dur:600, nos:['JL 775'], prices:{e:108000,pe:215000,bc:548000,fc:null} },
  BNE: { ac:[3],       outDeps:[m(10,45)],                 inArrs:[m(9,5)],                    dur:570, nos:['JL 779'], prices:{e:102000,pe:202000,bc:518000,fc:null} },
  PER: { ac:[3],       outDeps:[m(10,45)],                 inArrs:[m(9,5)],                    dur:630, nos:['JL 783'], prices:{e:98000, pe:195000,bc:498000,fc:null} },
  AKL: { ac:[3],       outDeps:[m(10,45)],                 inArrs:[m(9,5)],                    dur:690, nos:['JL 787'], prices:{e:125000,pe:248000,bc:628000,fc:null} },
};

// ── JAL direct NRT↔dest builder — mirrors buildDirect's structure/timing
// logic exactly, without the KIX/partner/via-connection branches this pass
// doesn't model for JAL. Cards carry the same segments/layovers shape so they
// render through the existing itinerary-view.js path unmodified. ─────────────
// nrtGateOut/nrtGateIn label gates "(ANA)"/"(Star Alliance)" since they were
// written before JAL existed in this model — relabel for JAL's own cards
// rather than touching the shared helper ANA's own rendering still relies on.
function jalGateLabel(raw) {
  return raw.replace(/\(ANA\)$/, '(JAL)').replace(/\(Star Alliance\)$/, '(JAL)');
}

function buildJalDirect(code, s, outbound) {
  const tz = TZ[code] || 0;
  const results = [];
  const count = Math.min(s.outDeps.length, 3);
  for (let i = 0; i < count; i++) {
    const ac = s.ac[i] || s.ac[0];
    const cabin = cabinStr(ac);
    const prices = {...s.prices};
    if (!ACFT[ac].hasPe) prices.pe = null;
    if (!ACFT[ac].hasFc) prices.fc = null;
    const dep = outbound ? s.outDeps[i] : s.inArrs[i];
    let depLocal, arrLocal, plusDays = 0;
    if (outbound) {
      const rawArr = dep + s.dur + (tz - 9) * 60;
      arrLocal = toHHMM(rawArr); plusDays = Math.floor(rawArr / 1440); depLocal = toHHMM(dep);
    } else {
      const rawDep = dep - s.dur + (tz - 9) * 60;
      depLocal = toHHMM(rawDep); arrLocal = toHHMM(dep); plusDays = Math.floor((s.dur - (tz - 9) * 60) / 1440);
    }
    const flightNo = outbound ? s.nos[i] : inboundNo(s.nos[i]);
    const acName = ACFT[ac].name;
    const nrtGateOutJal = jalGateLabel(nrtGateOut(code));
    const nrtGateInJal  = jalGateLabel(nrtGateIn(code, false));
    const termOut = outbound ? 'Tokyo Mega Hub (NRT) — '+nrtGateOutJal : `${AIRPORTS[code]?.city||code} (${code}) — ${worldTerm(code)}`;
    const termDest = outbound ? `${AIRPORTS[code]?.city||code} (${code}) — ${worldTerm(code)}` : 'Tokyo Mega Hub (NRT)';
    results.push({
      tag: null, direct:true,
      operator:'JAL', flightOut:flightNo, flightIn:'—',
      depLocal, arrHub:toHHMM(dep), hubDep:outbound ? toHHMM(dep) : '—',
      arrDest:arrLocal, seg1Time:outbound?'—':durStr(s.dur), seg2Time:outbound?durStr(s.dur):'—',
      transitTime:'—', totalTime:durStr(s.dur), aircraft1:acName, aircraft2:acName,
      cabinOut:cabin, cabinIn:cabin,
      termOut,
      termHub1: outbound ? 'Tokyo Mega Hub (NRT) — '+nrtGateOutJal : 'Tokyo Mega Hub (NRT) — '+nrtGateInJal,
      termHub2: outbound ? 'Tokyo Mega Hub (NRT) — '+nrtGateOutJal : '—',
      termDest,
      transfer:'Direct service — no transfer required', mct:'Direct flight',
      note: plusDays > 0 ? `+${plusDays} day${plusDays>1?'s':''}` : null, prices,
      segments: [ outbound
        ? mkLeg('NRT', code, flightNo, 'JAL', acName, cabin, depLocal, termOut, arrLocal, termDest, durStr(s.dur))
        : mkLeg(code, 'NRT', flightNo, 'JAL', acName, cabin, depLocal, termOut, arrLocal, termDest, durStr(s.dur))
      ],
      layovers: [],
    });
  }
  return results.length > 0 ? results : null;
}

// ── KIX Schedule (ANA-operated) ───────────────────────────────────────────────
const KIX_SCHEDULE = {
  // ── Domestic ─────────────────────────────────────────────────────────────
  OKA: { ac:[6,6,7,7,7], outDeps:[m(7,30),m(9,30),m(11,30),m(14,0),m(17,30)], inArrs:[m(8,40),m(10,40),m(12,40),m(15,10),m(18,40)], dur:100, nos:['NH 9051','NH 9053','NH 9055','NH 9057','NH 9059'], partner:null, prices:{e:20000,pe:null,bc:40000,fc:56000}, domestic:true },
  CTS: { ac:[6,6,7,7,7,7], outDeps:[m(7,0),m(9,30),m(12,0),m(14,0),m(16,30),m(19,0)], inArrs:[m(9,0),m(11,30),m(14,0),m(16,0),m(18,30),m(21,0)], dur:120, nos:['NH 9401','NH 9403','NH 9405','NH 9407','NH 9409','NH 9411'], partner:null, prices:{e:22000,pe:null,bc:44000,fc:60000}, domestic:true },
  FUK: { ac:[7,7,7], outDeps:[m(7, 0),m(11,30),m(17, 0)], inArrs:[m(10,5),m(14,35),m(20,35)], dur:65,  nos:['NH 9101','NH 9103','NH 9105'], partner:null, prices:{e:12000,pe:null,bc:24000,fc:null}, domestic:true },
  // ── North America daily ───────────────────────────────────────────────────
  JFK: { ac:[9], outDeps:[m(16, 0)], inArrs:[m(20,50)], dur:820, nos:['NH 8009'], partner:'United',           partnerNo:'UA 80',   prices:{e:148000,pe:295000,bc:748000,fc:1850000} },
  LAX: { ac:[9], outDeps:[m(16,30)], inArrs:[m(14,40)], dur:620, nos:['NH 8005'], partner:'United',           partnerNo:'UA 8837', prices:{e:135000,pe:268000,bc:698000,fc:1720000} },
  SFO: { ac:[3], outDeps:[m(16,30)], inArrs:[m(14, 0)], dur:600, nos:['NH 8001'], partner:'United',           partnerNo:'UA 8037', prices:{e:135000,pe:268000,bc:698000,fc:null} },
  ORD: { ac:[3], outDeps:[m(15,30)], inArrs:[m(18,20)], dur:760, nos:['NH 8101'], partner:'United',           partnerNo:'UA 8881', prices:{e:128000,pe:255000,bc:648000,fc:null} },
  SEA: { ac:[3], outDeps:[m(16, 0)], inArrs:[m(12,30)], dur:570, nos:['NH 8107'], partner:'United',           partnerNo:'UA 8849', prices:{e:128000,pe:255000,bc:648000,fc:null} },
  YVR: { ac:[3], outDeps:[m(16, 0)], inArrs:[m(13,30)], dur:600, nos:['NH 8117'], partner:'Air Canada',       partnerNo:'AC 85',   prices:{e:125000,pe:248000,bc:628000,fc:null} },
  YYZ: { ac:[3], outDeps:[m(15,30)], inArrs:[m(19,20)], dur:790, nos:['NH 8119'], partner:'Air Canada',       partnerNo:'AC 83',   prices:{e:138000,pe:275000,bc:698000,fc:null} },
  MEX: { ac:[3], outDeps:[m(15,30)], inArrs:[m(17,30)], dur:880, nos:['NH 8147'], partner:null, prices:{e:138000,pe:275000,bc:698000,fc:null}, days:[1,3,5,0] },
  // ── Europe daily ──────────────────────────────────────────────────────────
  LHR: { ac:[9], outDeps:[m(13, 0)], inArrs:[m(16,50)], dur:790, nos:['NH 8201'], partner:null,                                    prices:{e:152000,pe:305000,bc:768000,fc:1920000} },
  CDG: { ac:[9], outDeps:[m(13, 0)], inArrs:[m(17,50)], dur:820, nos:['NH 8203'], partner:null,                                    prices:{e:152000,pe:305000,bc:768000,fc:1920000} },
  FRA: { ac:[3], outDeps:[m(13,30)], inArrs:[m(17, 0)], dur:780, nos:['NH 8205'], partner:'Lufthansa',        partnerNo:'LH 8715', prices:{e:148000,pe:295000,bc:748000,fc:null} },
  IST: { ac:[3], outDeps:[m(13,30)], inArrs:[m(15, 0)], dur:720, nos:['NH 8217'], partner:'Turkish Airlines', partnerNo:'TK 851',  prices:{e:145000,pe:290000,bc:738000,fc:null} },
  // ── Europe 4–5x weekly ────────────────────────────────────────────────────
  MUC: { ac:[3], outDeps:[m(13,30)], inArrs:[m(17, 0)], dur:780, nos:['NH 8209'], partner:'Lufthansa',        partnerNo:'LH 8723', prices:{e:148000,pe:295000,bc:748000,fc:null}, days:[1,2,4,5,6] },
  ZRH: { ac:[3], outDeps:[m(13,30)], inArrs:[m(17,30)], dur:795, nos:['NH 8249'], partner:'Swiss',            partnerNo:'LX 8161', prices:{e:148000,pe:295000,bc:748000,fc:null}, days:[1,2,4,5,6] },
  GVA: { ac:[3], outDeps:[m(13,30)], inArrs:[m(18, 0)], dur:810, nos:['NH 8251'], partner:'Swiss',            partnerNo:'LX 8165', prices:{e:148000,pe:295000,bc:748000,fc:null}, days:[1,2,4,5,6] },
  VIE: { ac:[3], outDeps:[m(13,30)], inArrs:[m(16, 0)], dur:750, nos:['NH 8247'], partner:'Austrian',         partnerNo:'OS 851',  prices:{e:145000,pe:290000,bc:738000,fc:null}, days:[1,2,4,5,6] },
  FCO: { ac:[3], outDeps:[m(13,30)], inArrs:[m(18, 0)], dur:810, nos:['NH 8253'], partner:'ITA Airways',      partnerNo:'AZ 8791', prices:{e:148000,pe:295000,bc:748000,fc:null}, days:[1,2,4,5,6] },
  MXP: { ac:[3], outDeps:[m(13,30)], inArrs:[m(18, 0)], dur:810, nos:['NH 8257'], partner:'ITA Airways',      partnerNo:'AZ 8789', prices:{e:148000,pe:295000,bc:748000,fc:null}, days:[1,2,4,5,6] },
  BRU: { ac:[3], outDeps:[m(13,30)], inArrs:[m(17, 0)], dur:780, nos:['NH 8241'], partner:'Brussels Airlines',partnerNo:'SN 8291', prices:{e:148000,pe:295000,bc:748000,fc:null}, days:[1,2,4,5,6] },
  WAW: { ac:[3], outDeps:[m(13,30)], inArrs:[m(16, 0)], dur:750, nos:['NH 8245'], partner:'LOT Polish',       partnerNo:'LO 877',  prices:{e:145000,pe:290000,bc:738000,fc:null}, days:[1,2,4,5,6] },
  // ── Oceania daily ─────────────────────────────────────────────────────────
  SYD: { ac:[3], outDeps:[m(18, 0)], inArrs:[m(14,50)], dur:580, nos:['NH 8891'], partner:'Air New Zealand', partnerNo:'NZ 891',  prices:{e:108000,pe:215000,bc:548000,fc:null} },
  // ── Korea ─────────────────────────────────────────────────────────────────
  ICN: { ac:[10,5,5], outDeps:[m(8,0),m(14,0),m(19,0)], inArrs:[m(12,5),m(18,5),m(23,5)], dur:100, nos:['NH 8401','NH 8403','NH 8405'], partner:null,                                    prices:{e:28000, pe:55000, bc:168000,fc:null} },
  GMP: { ac:[5],   outDeps:[m(11,0)],           inArrs:[m(15, 5)],            dur:100, nos:['NH 8411'],           partner:null,                                    prices:{e:28000, pe:55000, bc:168000,fc:null} },
  PUS: { ac:[5],   outDeps:[m(10,0)],           inArrs:[m(12,20)],            dur:55,  nos:['NH 8415'],           partner:null,                                    prices:{e:18000, pe:35000, bc:108000,fc:null} },
  // ── Taiwan ────────────────────────────────────────────────────────────────
  TPE: { ac:[10,5], outDeps:[m(8,30),m(14,0)],   inArrs:[m(14,15),m(19,45)],  dur:150, nos:['NH 8421','NH 8423'], partner:'EVA Air',     partnerNo:'BR 117',        prices:{e:35000, pe:68000, bc:205000,fc:null} },
  TSA: { ac:[5],   outDeps:[m(12, 0)],          inArrs:[m(17,45)],            dur:150, nos:['NH 8431'],           partner:null,                                    prices:{e:35000, pe:68000, bc:205000,fc:null} },
  // ── China ─────────────────────────────────────────────────────────────────
  PEK: { ac:[5,5], outDeps:[m(7,30),m(13, 0)], inArrs:[m(14,15),m(19,45)],  dur:180, nos:['NH 8451','NH 8453'], partner:'Air China',   partnerNo:'CA 419',        prices:{e:38000, pe:75000, bc:225000,fc:null} },
  PVG: { ac:[5,5], outDeps:[m(8, 0),m(14, 0)], inArrs:[m(13,45),m(19,45)],  dur:150, nos:['NH 8461','NH 8463'], partner:'Air China',   partnerNo:'CA 8935',       prices:{e:35000, pe:68000, bc:205000,fc:null} },
  HKG: { ac:[10,5,5],outDeps:[m(7,30),m(11,30),m(16,0)],inArrs:[m(14,15),m(18,15),m(22,45)],dur:180,nos:['NH 8441','NH 8443','NH 8445'],partner:null,             prices:{e:42000, pe:82000, bc:248000,fc:null} },
  // ── Southeast Asia ────────────────────────────────────────────────────────
  SIN: { ac:[10,5], outDeps:[m(8,30),m(21, 0)], inArrs:[m(22,30),m(11, 0)],  dur:390, nos:['NH 8471','NH 8473'], partner:'Singapore Airlines',partnerNo:'SQ 611',  prices:{e:52000,pe:102000,bc:308000,fc:null} },
  BKK: { ac:[10,5], outDeps:[m(8,30),m(19,30)], inArrs:[m(20,30),m( 7,30)],  dur:330, nos:['NH 8481','NH 8483'], partner:'Thai Airways', partnerNo:'TG 8640',      prices:{e:45000,pe:88000, bc:265000,fc:null} },
  MNL: { ac:[10],   outDeps:[m(9, 0)],           inArrs:[m(18, 0)],            dur:240, nos:['NH 8491'],           partner:null,                                    prices:{e:40000, pe:78000, bc:238000,fc:null} },
  CEB: { ac:[5],   outDeps:[m(9,30)],           inArrs:[m(16,45)],            dur:195, nos:['NH 8495'],           partner:null,                                    prices:{e:40000, pe:78000, bc:238000,fc:null} },
  KUL: { ac:[10],   outDeps:[m(9, 0)],           inArrs:[m(23, 0)],            dur:390, nos:['NH 8501'],           partner:null,                                    prices:{e:52000,pe:102000,bc:308000,fc:null} },
  HAN: { ac:[10],   outDeps:[m(10,0)],           inArrs:[m(21, 0)],            dur:300, nos:['NH 8511'],           partner:null,                                    prices:{e:42000, pe:82000, bc:252000,fc:null} },
  SGN: { ac:[10],   outDeps:[m(10,0)],           inArrs:[m(22, 0)],            dur:330, nos:['NH 8521'],           partner:null,                                    prices:{e:48000,pe:95000, bc:285000,fc:null} },
  CGK: { ac:[10],   outDeps:[m(9, 0)],           inArrs:[m( 0, 0)],            dur:420, nos:['NH 8531'],           partner:null,                                    prices:{e:55000,pe:108000,bc:328000,fc:null} },
  DPS: { ac:[5],   outDeps:[m(19,30)],          inArrs:[m(16, 0)],             dur:420, nos:['NH 8536'],           partner:null,                                    prices:{e:56000,pe:110000,bc:295000,fc:null}, days:[2,4,6,0] },
  // ── South Asia ────────────────────────────────────────────────────────────
  DEL: { ac:[10],   outDeps:[m(21, 0)],          inArrs:[m(13, 0)],            dur:450, nos:['NH 8541'],           partner:'Air India',   partnerNo:'AI 9307',       prices:{e:62000,pe:122000,bc:375000,fc:null} },
  // ── Middle East ───────────────────────────────────────────────────────────
  DXB: { ac:[3],   outDeps:[m(23, 0)],          inArrs:[m(20, 0)],            dur:600, nos:['NH 8275'],           partner:null,                                    prices:{e:88000,pe:175000,bc:448000,fc:null}, days:[1,2,4,5,6] },
  // ── Pacific ───────────────────────────────────────────────────────────────
  GUM: { ac:[5],   outDeps:[m(8,30)],           inArrs:[m(15,15)],            dur:180, nos:['NH 8551'],           partner:null,                                    prices:{e:38000, pe:75000, bc:225000,fc:null}, days:[1,2,4,5,6] },
  HNL: { ac:[3],   outDeps:[m(17, 0)],          inArrs:[m(10, 0)],            dur:480, nos:['NH 8183'],           partner:'United',      partnerNo:'UA 8803',       prices:{e:78000,pe:155000,bc:468000,fc:null} },
};

// ── KIX Partner ops (partner-operated at KIX) ─────────────────────────────────
const KIX_PARTNER_OPS = {
  EWR: { name:'United Airlines',  nos:['UA 7832'], outDeps:[m(15, 0)], inArrs:[m(19,50)], dur:820, acName:'Boeing 787-9',  prices:{e:138000,pe:null,bc:698000,fc:null} },
  DEN: { name:'United Airlines',  nos:['UA 7835'], outDeps:[m(15,30)], inArrs:[m(15, 0)], dur:660, acName:'Boeing 787-9',  prices:{e:122000,pe:null,bc:618000,fc:null} },
  IAH: { name:'United Airlines',  nos:['UA 7838'], outDeps:[m(15, 0)], inArrs:[m(21, 0)], dur:855, acName:'Boeing 777-200',prices:{e:128000,pe:null,bc:648000,fc:null} },
  IAD: { name:'United Airlines',  nos:['UA 7803'], outDeps:[m(15, 0)], inArrs:[m(20,50)], dur:850, acName:'Boeing 787-9',  prices:{e:138000,pe:null,bc:698000,fc:null} },
  YUL: { name:'Air Canada',          nos:['AC 8007','AC 8009','AC 8011','AC 8013'], outDeps:[m(7,0),m(11,0),m(15,30),m(21,0)], inArrs:[m(6,30),m(10,30),m(22,20),m(2,30)], dur:880, acName:'Boeing 787-9',     prices:{e:138000,pe:null,bc:698000,fc:null} },
  AKL: { name:'Air New Zealand',     nos:['NZ 8091'], outDeps:[m(22, 0)], inArrs:[m(21,30)], dur:660, acName:'Boeing 787-9',     prices:{e:118000,pe:null,bc:568000,fc:null} },
  SIN: { name:'Singapore Airlines',  nos:['SQ 611'],  outDeps:[m(12, 0)], inArrs:[m( 2, 0)], dur:390, acName:'Airbus A350-900',  prices:{e:58000, pe:null,bc:348000,fc:null} },
  BKK: { name:'Thai Airways',        nos:['TG 8640'], outDeps:[m(12,30)], inArrs:[m( 0,30)], dur:330, acName:'Boeing 777-300ER', prices:{e:48000, pe:null,bc:288000,fc:null} },
  PEK: { name:'Air China',           nos:['CA 419'],  outDeps:[m(10, 0)], inArrs:[m(16,45)], dur:180, acName:'Airbus A330-200',  prices:{e:35000, pe:null,bc:208000,fc:null} },
  PVG: { name:'Air China',           nos:['CA 8935'], outDeps:[m( 9,30)], inArrs:[m(15,15)], dur:150, acName:'Boeing 737 MAX',   prices:{e:32000, pe:null,bc:192000,fc:null} },
  TPE: { name:'EVA Air',             nos:['BR 117'],  outDeps:[m(11, 0)], inArrs:[m(16,45)], dur:150, acName:'Boeing 787-9',     prices:{e:32000, pe:null,bc:192000,fc:null} },
};

// ── Terminal / Gate helpers ──────────────────────────────────────────────────
const NA_CODES = new Set([
  'JFK','LAX','SFO','ORD','SEA','IAH','BOS','IAD','DEN','DTW','ATL','DFW','MSP','SAN','HNL','EWR',
  'YVR','YYZ','YYC','YUL','MEX','PHL','LAS','SLC','PHX','CLT','PDX','MTY','SJC','PTY','MIA','MCO',
  'IND','STL','MCI','ANC','AUS',
]);
const ASIA_CODES = new Set([
  'PEK','PVG','HKG','ICN','GMP','SIN','TPE','TSA','BKK','MNL','CGK','KUL','SGN','HAN','DEL','BOM','BLR','HYD','GUM',
  'CAN','SZX','MFM','HGH','PUS','TSN','DAC','KHI','CTU','XIY','CEB','SUB',
  'TAE','KWJ','CJU','HKT','KHH','RGN','KTM','MLE','CMB','ULN','PNH','VTE','DPS',
]);
const DOMESTIC_CODES = new Set(['OKA','FUK','ITM','NGO','CTS','KIX']);

function region(code) {
  if (NA_CODES.has(code))       return 'NA';
  if (DOMESTIC_CODES.has(code)) return 'DOMESTIC';
  if (ASIA_CODES.has(code))     return 'ASIA';
  return 'EU';
}

function hashN(code) {
  let h = 5381;
  for (let i = 0; i < code.length; i++) h = ((h << 5) + h) ^ code.charCodeAt(i);
  return Math.abs(h);
}

const GATE_IN_TABLE = {
  OKA:1,  FUK:5,  ITM:9,  NGO:13, CTS:17,
  JFK:130,LAX:131,SFO:132,ORD:133,SEA:134,HNL:135,BOS:136,IAH:137,YVR:138,YYZ:139,
  IAD:130,DTW:131,MSP:132,ATL:133,DFW:134,DEN:135,SAN:136,YYC:137,YUL:138,MEX:139,
  PHL:130,LAS:131,SLC:132,PHX:133,CLT:134,PDX:135,MTY:136,SJC:137,PTY:138,
  IND:130,STL:131,MCI:132,ANC:133,AUS:134,
  EWR:140,
  PEK:70,PVG:71,HKG:72,ICN:73,GMP:73,SIN:74,TPE:75,BKK:76,MNL:77,CGK:78,KUL:79,
  SGN:80,HAN:81,DEL:82,BOM:83,BLR:84,HYD:85,GUM:86,
  CAN:87,SZX:88,MFM:89,HGH:90,PUS:70,TSN:71,DAC:72,KHI:73,CTU:74,XIY:75,
  CEB:76,SUB:77,TAE:78,KWJ:79,CJU:80,HKT:81,KHH:82,RGN:83,KTM:84,MLE:85,
  CMB:86,ULN:87,PNH:88,VTE:89,DPS:91,
  LHR:168,CDG:169,FRA:170,MUC:171,IST:172,SYD:173,HEL:174,BRU:175,ARN:176,
  MXP:168,WAW:169,VIE:170,ZRH:171,GVA:172,FCO:173,
  DOH:174,AUH:175,DXB:176,CAI:177,ADD:168,MEL:170,BNE:171,PER:172,AKL:173,CNS:174,
};

const GATE_OUT_TABLE = {
  OKA:1,  FUK:5,  ITM:9,  NGO:13, CTS:17,
  JFK:130,LAX:131,SFO:132,ORD:133,SEA:134,HNL:135,BOS:136,IAH:137,YVR:138,YYZ:139,
  IAD:130,DTW:131,MSP:132,ATL:133,DFW:134,DEN:135,SAN:136,YYC:137,YUL:138,MEX:139,
  PHL:130,LAS:131,SLC:132,PHX:133,CLT:134,PDX:135,MTY:136,SJC:137,PTY:138,
  IND:130,STL:131,MCI:132,ANC:133,AUS:134,
  PEK:70,PVG:71,HKG:72,ICN:73,GMP:73,SIN:74,TPE:75,BKK:76,MNL:77,CGK:78,KUL:79,
  SGN:80,HAN:81,DEL:82,BOM:83,BLR:84,HYD:85,GUM:86,
  CAN:87,SZX:88,MFM:89,HGH:90,PUS:70,TSN:71,DAC:72,KHI:73,CTU:74,XIY:75,
  CEB:76,SUB:77,TAE:78,KWJ:79,CJU:80,HKT:81,KHH:82,RGN:83,KTM:84,MLE:85,
  CMB:86,ULN:87,PNH:88,VTE:89,DPS:91,
  LHR:168,CDG:169,FRA:170,MUC:171,IST:172,SYD:173,HEL:174,BRU:175,ARN:176,
  MXP:168,WAW:169,VIE:170,ZRH:171,GVA:172,FCO:173,
  DOH:174,AUH:175,DXB:176,CAI:177,ADD:168,MEL:170,BNE:171,PER:172,AKL:173,CNS:174,
};

const GATE_PARTNER_TABLE = {
  EWR:140,ORD:141,IAH:142,SEA:143,SFO:144,LAX:145,DEN:146,IAD:147,HNL:140,
  YVR:141,YYZ:142,YUL:143,
  ICN:91,PUS:92,PEK:93,PVG:94,CAN:95,SIN:96,TPE:97,BKK:98,DEL:99,
  FRA:177,MUC:178,IST:179,WAW:180,ZRH:181,FCO:182,VIE:183,
  SYD:177,AKL:178,
};

function nrtGateIn(code, isPartner) {
  const r = region(code);
  if (r === 'DOMESTIC') {
    const g = GATE_IN_TABLE[code];
    return g ? `T1 Domestic, Gate ${g} (ANA)` : `T1 Domestic, Gate ${1 + hashN(code) % 34} (ANA)`;
  }
  if (isPartner) {
    const g = GATE_PARTNER_TABLE[code];
    if (g) {
      if (r === 'NA')   return `T2A, Gate ${g} (Star Alliance Partner)`;
      if (r === 'ASIA') return `T1 Asia, Gate ${g}`;
      return `T2B, Gate ${g} (Star Alliance Partner)`;
    }
    if (r === 'NA')   return `T2A, Gate ${140 + hashN(code) % 8} (Star Alliance Partner)`;
    if (r === 'ASIA') return `T1 Asia, Gate ${91 + hashN(code) % 28}`;
    return `T2B, Gate ${177 + hashN(code) % 7} (Star Alliance Partner)`;
  }
  const g = GATE_IN_TABLE[code];
  if (g) {
    if (r === 'NA')   return `T2A, Gate ${g} (ANA)`;
    if (r === 'ASIA') return `T1 Asia, Gate ${g} (ANA)`;
    return `T2B, Gate ${g} (Star Alliance)`;
  }
  if (r === 'NA')   return `T2A, Gate ${130 + hashN(code) % 10} (ANA)`;
  if (r === 'ASIA') return `T1 Asia, Gate ${70 + hashN(code) % 21} (ANA)`;
  return `T2B, Gate ${168 + hashN(code) % 9} (Star Alliance)`;
}

function nrtGateOut(code) {
  const r = region(code);
  if (r === 'DOMESTIC') {
    const g = GATE_OUT_TABLE[code];
    return g ? `T1 Domestic, Gate ${g} (ANA)` : `T1 Domestic, Gate ${1 + hashN(code) % 34} (ANA)`;
  }
  const g = GATE_OUT_TABLE[code];
  if (g) {
    if (r === 'NA')   return `T2A, Gate ${g} (ANA)`;
    if (r === 'ASIA') return `T1 Asia, Gate ${g} (ANA)`;
    return `T2B, Gate ${g} (Star Alliance)`;
  }
  if (r === 'NA')   return `T2A, Gate ${130 + hashN(code) % 10} (ANA)`;
  if (r === 'ASIA') return `T1 Asia, Gate ${70 + hashN(code) % 21} (ANA)`;
  return `T2B, Gate ${168 + hashN(code) % 9} (Star Alliance)`;
}

function transferPath(fromCode, toCode) {
  const r1 = region(fromCode), r2 = region(toCode);
  if (r1 === 'DOMESTIC' || r2 === 'DOMESTIC') {
    if (r1 === r2) return 'T1 Domestic → same concourse (~5 min walk)';
    return 'People Mover: T1 Domestic → other Terminal (~12 min)';
  }
  if (r1 === r2) {
    if (r1 === 'ASIA') return 'T1 Asia → same concourse (~5 min walk)';
    if (r1 === 'NA')   return 'T2A → same satellite (~3 min walk)';
    return 'T2B → same satellite (~3 min walk)';
  }
  if ((r1 === 'NA' && r2 === 'EU') || (r1 === 'EU' && r2 === 'NA'))
    return 'T2A/T2B underground walkway → People Mover (~8 min)';
  return 'People Mover: Terminal Station → Underground → other Terminal (~12 min)';
}

function mctLabel(fromCode, toCode) {
  const r1 = region(fromCode), r2 = region(toCode);
  const mct = (r1 === r2) ? 70 : 90;
  return `Min. connection time: ${mct} min  ·  Recommended: ${mct + 60}min+`;
}

const WORLD_TERMINAL = {
  OKA:'Main Terminal', FUK:'Domestic Terminal', ITM:'South Building', NGO:'Terminal 1', CTS:'Domestic Terminal', KIX:'International Terminal (Hub)',
  TSA:'Terminal 1',
  JFK:'Terminal 7', LAX:'Tom Bradley TBIT', SFO:'Terminal I', ORD:'Terminal 5',
  SEA:'North Satellite', IAH:'Terminal E', BOS:'Terminal E', IAD:'Terminal B',
  DTW:'McNamara Terminal', ATL:'Terminal F', DFW:'Terminal D', DEN:'Terminal B (Intl)',
  SAN:'Terminal 2', HNL:'International Terminal', YVR:'International Terminal',
  YYZ:'Terminal 1', YYC:'International Terminal', YUL:'Terminal 3', MEX:'Terminal 2',
  PHL:'Terminal A (Intl)', LAS:'Terminal 3', SLC:'Terminal 1 (Intl)', PHX:'Terminal 4',
  CLT:'Terminal E', PDX:'International Terminal', MTY:'Terminal B',
  SJC:'Terminal B', PTY:'Terminal 2', MIA:'North Terminal', MCO:'Terminal B',
  IND:'Terminal A', STL:'Terminal 1', MCI:'Terminal B', ANC:'Main Terminal', AUS:'Barbara Jordan Terminal',
  LHR:'Terminal 2', CDG:'Terminal 2G', FRA:'Terminal 1 B-Gates', MUC:'Terminal 2',
  IST:'Main International Terminal', AMS:'Pier H', BRU:'Terminal B',
  ZRH:'Terminal E', VIE:'Terminal 3', FCO:'Terminal 3', ARN:'Terminal 5',
  HEL:'Terminal 2', WAW:'Terminal A', GVA:'Terminal 1',
  MXP:'Terminal 1', DUB:'Terminal 2', CPH:'Terminal 3 (Intl)', OSL:'Terminal 2',
  LIS:'Terminal 1', BCN:'Terminal 1', MAD:'Terminal 4S', ATH:'Main Terminal',
  BUD:'Terminal 2B', ZAG:'Terminal 2', PRG:'Terminal 2', BER:'Terminal 1',
  DOH:'Concourse D', AUH:'Terminal 1', DXB:'Terminal 3', CAI:'Terminal 2', ADD:'Terminal 2',
  JNB:'Terminal A', SYD:'Terminal 1 (Intl)', MEL:'Terminal 2', BNE:'International Terminal',
  PER:'Terminal 1', AKL:'International Terminal', CNS:'Terminal 1',
  PEK:'Terminal 3', PVG:'Terminal 2', HKG:'Terminal 1', ICN:'Terminal 1', GMP:'International Terminal',
  SIN:'Terminal 1', TPE:'Terminal 2', BKK:'Suvarnabhumi Terminal', MNL:'Terminal 1',
  CGK:'Terminal 3', KUL:'KLIA Main Terminal', SGN:'Terminal 2', HAN:'Terminal 2', DPS:'International Terminal',
  DEL:'Terminal 3', BOM:'Terminal 2', BLR:'Terminal 2', HYD:'Terminal 1', GUM:'Main Terminal',
  CAN:'Terminal 2', SZX:'Terminal 3', MFM:'Main Terminal', HGH:'Terminal 3',
  PUS:'International Terminal', TSN:'Terminal 2', CTU:'Terminal T2', XIY:'Terminal 3',
  DAC:'Terminal 1', KHI:'Terminal 1', CEB:'Terminal 2', SUB:'Terminal 2',
  TAE:'Main Terminal', KWJ:'Main Terminal', CJU:'International Terminal',
  HKT:'Main Terminal', KHH:'Terminal 1', RGN:'Terminal 1', KTM:'Terminal 2',
  MLE:'Main Terminal', CMB:'Terminal 2', ULN:'Terminal 2', PNH:'Terminal 1',
  VTE:'Main Terminal',
};

function worldTerm(code) { return WORLD_TERMINAL[code] || 'International Terminal'; }

// ── Time helpers ─────────────────────────────────────────────────────────────
function toHHMM(mins) {
  const n = ((mins % 1440) + 1440) % 1440;
  return String(Math.floor(n / 60)).padStart(2,'0') + ':' + String(n % 60).padStart(2,'0');
}
function durStr(mins) {
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2,'0')}m`;
}
function inboundNo(outNo) {
  return outNo.replace(/(\d+)$/, n => Number(n) + 1);
}

// ── Segment/layover model for the expanded itinerary view ─────────────────────
// Every card gets a `segments` array (one entry per REAL flight leg, in order)
// and a `layovers` array (one entry per stop BETWEEN legs, length = segments-1).
// This replaces the old approach of merging a hub transit into an adjacent
// segment's duration, which is what caused stops to be mislabeled (e.g. a KIX
// transit reported as NRT) — every real stop now gets its own honest entry.
function mkLeg(from, to, flightNo, operator, aircraft, cabin, depTime, depTerm, arrTime, arrTerm, duration, codeshare) {
  return { from, to, flightNo, operator, aircraft, cabin, depTime, depTerm, arrTime, arrTerm, duration, codeshare: codeshare || null };
}
function mkStop(code, wait, hubLabel, detail, note, overnight) {
  const ap = AIRPORTS[code];
  return { code, label: ap ? `${ap.city} (${code})` : code, wait, hubLabel, detail, note: note || null, overnight: !!overnight };
}

// ── Price helpers ─────────────────────────────────────────────────────────────
function connectPrices(p1, p2) {
  const merge = (a, b) => (a && b) ? Math.round((a + b) * 0.82) :
                           (a || b) ? Math.round((a || b) * 1.1) : null;
  return { e:merge(p1.e,p2.e), pe:merge(p1.pe,p2.pe), bc:merge(p1.bc,p2.bc), fc:merge(p1.fc,p2.fc) };
}

// ── Via-connection builders ───────────────────────────────────────────────────
function buildViaFromHub(destCode, via) {
  const s = SCHEDULE[via.viaCode];
  if (!s) return null;
  const tzVia  = TZ[via.viaCode] || 0;
  const tzDest = TZ[destCode]    || 0;
  const CONN   = 75;
  const results = [];
  for (let i = 0; i < s.outDeps.length && results.length < 3; i++) {
    const nrtDep      = s.outDeps[i];
    const viaArrLocal = nrtDep + s.dur + (tzVia - 9) * 60;
    const viaDepLocal = viaArrLocal + CONN;
    const destArrLocal = viaDepLocal + via.dur + (tzDest - tzVia) * 60;
    const totalDur    = s.dur + CONN + via.dur;
    const ac          = s.ac[i] || s.ac[0];
    const plusDays    = Math.floor(destArrLocal / 1440);
    const hubCity = AIRPORTS[via.viaCode]?.city || via.viaCode;
    const termOut   = `Tokyo Mega Hub (NRT) — ${nrtGateOut(via.viaCode)}`;
    const termHub1  = `${hubCity} (${via.viaCode}) — International Terminal`;
    const termHub2  = `${hubCity} (${via.viaCode}) — International Terminal`;
    const termDest  = `${AIRPORTS[destCode]?.city || destCode} (${destCode}) — ${worldTerm(destCode)}`;
    const transfer  = via.freedom ? `ANA through-service — same aircraft continues from ${hubCity}` : `Connect in ${hubCity} (${via.viaCode}) — ${via.note}`;
    const seg2Operator = via.freedom ? 'ANA' : via.partner;
    results.push({
      tag: i === 0 ? 'recommended' : null, direct:false,
      operator: via.freedom ? 'ANA' : `ANA / ${via.partner}`,
      _seg1Label:`NRT → ${via.viaCode}`, _seg2Label:`${via.viaCode} → ${destCode}`,
      _hubLabel:`${(hubCity).toUpperCase()} (${via.viaCode})`,
      flightOut:s.nos[i], flightIn:via.partnerNo,
      depLocal:toHHMM(nrtDep), arrHub:toHHMM(viaArrLocal), hubDep:toHHMM(viaDepLocal), arrDest:toHHMM(destArrLocal),
      seg1Time:durStr(s.dur), seg2Time:durStr(via.dur), transitTime:durStr(CONN), totalTime:durStr(totalDur),
      aircraft1:ACFT[ac].name, aircraft2:ACFT[ac].name, cabinOut:cabinStr(ac), cabinIn:cabinStr(ac),
      termOut, termHub1, termHub2, termDest,
      transfer,
      mct: via.freedom ? `Aircraft turn at ${hubCity} — approx. ${CONN} min · No terminal change required` : `Min. connection time at ${hubCity}: 60 min  ·  Recommended: 90min+`,
      note: plusDays > 0 ? `+${plusDays} day${plusDays>1?'s':''}` : null,
      prices:s.prices,
      segments: [
        mkLeg('NRT', via.viaCode, s.nos[i], 'ANA', ACFT[ac].name, cabinStr(ac), toHHMM(nrtDep), termOut, toHHMM(viaArrLocal), termHub1, durStr(s.dur)),
        mkLeg(via.viaCode, destCode, via.partnerNo, seg2Operator, via.freedom ? ACFT[ac].name : (via.acName || '—'), via.freedom ? cabinStr(ac) : 'Economy · Business', toHHMM(viaDepLocal), termHub2, toHHMM(destArrLocal), termDest, durStr(via.dur)),
      ],
      layovers: [ mkStop(via.viaCode, durStr(CONN), `${hubCity.toUpperCase()} (${via.viaCode})`, transfer,
        via.freedom ? `Aircraft turn at ${hubCity} — no terminal change required` : `Min. connection time at ${hubCity}: 60 min · Recommended: 90min+`) ],
    });
  }
  return results.length > 0 ? results : null;
}

function buildViaToHub(fromCode, via) {
  const s = SCHEDULE[via.viaCode];
  if (!s) return null;
  const tzFrom = TZ[fromCode]    || 0;
  const tzVia  = TZ[via.viaCode] || 0;
  const CONN   = 75;
  const results = [];
  for (let i = 0; i < s.inArrs.length && results.length < 3; i++) {
    const nrtArr      = s.inArrs[i];
    const viaDepLocal = (nrtArr - s.dur) + (tzVia - 9) * 60;
    const viaArrLocal = viaDepLocal - CONN;
    const fromDepLocal = viaArrLocal - via.dur + (tzFrom - tzVia) * 60;
    const totalDur    = via.dur + CONN + s.dur;
    const ac          = s.ac[i] || s.ac[0];
    const hubCity2 = AIRPORTS[via.viaCode]?.city || via.viaCode;
    const termOut  = `${AIRPORTS[fromCode]?.city || fromCode} (${fromCode}) — ${worldTerm(fromCode)}`;
    const termHub1 = `${hubCity2} (${via.viaCode}) — International Terminal`;
    const termHub2 = `${hubCity2} (${via.viaCode}) — International Terminal`;
    const termDest = `Tokyo Mega Hub (NRT) — ${nrtGateIn(via.viaCode, false)}`;
    const transfer = via.freedom ? `ANA through-service — same aircraft continues from ${hubCity2}` : `Connect in ${hubCity2} (${via.viaCode}) — ${via.note}`;
    const seg1Operator = via.freedom ? 'ANA' : via.partner;
    const seg1Flight = via.freedom ? inboundNo(via.partnerNo) : via.partnerNo;
    results.push({
      tag: i === 0 ? 'recommended' : null, direct:false,
      operator: via.freedom ? 'ANA' : `${via.partner} / ANA`,
      _seg1Label:`${fromCode} → ${via.viaCode}`, _seg2Label:`${via.viaCode} → NRT`,
      _hubLabel:`${(hubCity2).toUpperCase()} (${via.viaCode})`,
      flightOut: seg1Flight,
      flightIn:inboundNo(s.nos[i]),
      depLocal:toHHMM(fromDepLocal), arrHub:toHHMM(viaArrLocal), hubDep:toHHMM(viaDepLocal), arrDest:toHHMM(nrtArr),
      seg1Time:durStr(via.dur), seg2Time:durStr(s.dur), transitTime:durStr(CONN), totalTime:durStr(totalDur),
      aircraft1:ACFT[ac].name, aircraft2:ACFT[ac].name, cabinOut:cabinStr(ac), cabinIn:cabinStr(ac),
      termOut, termHub1, termHub2, termDest,
      transfer,
      mct: via.freedom ? `Aircraft turn at ${hubCity2} — approx. ${CONN} min · No terminal change required` : `Min. connection time at ${hubCity2}: 60 min  ·  Recommended: 90min+`,
      note:null, prices:s.prices,
      // Raw (unformatted) minute-of-day values so a caller chaining a further
      // onward leg (e.g. codeshare city → real ANA destination) can compute a
      // real, feasible connection instead of guessing at a departure time.
      _nrtArrRaw: nrtArr, _fromDepRaw: fromDepLocal,
      segments: [
        mkLeg(fromCode, via.viaCode, seg1Flight, seg1Operator, via.freedom ? ACFT[ac].name : (via.acName || '—'), via.freedom ? cabinStr(ac) : 'Economy · Business', toHHMM(fromDepLocal), termOut, toHHMM(viaArrLocal), termHub1, durStr(via.dur)),
        mkLeg(via.viaCode, 'NRT', inboundNo(s.nos[i]), 'ANA', ACFT[ac].name, cabinStr(ac), toHHMM(viaDepLocal), termHub2, toHHMM(nrtArr), termDest, durStr(s.dur)),
      ],
      layovers: [ mkStop(via.viaCode, durStr(CONN), `${hubCity2.toUpperCase()} (${via.viaCode})`, transfer,
        via.freedom ? `Aircraft turn at ${hubCity2} — no terminal change required` : `Min. connection time at ${hubCity2}: 60 min · Recommended: 90min+`) ],
    });
  }
  return results.length > 0 ? results : null;
}

// ── Core builder (ANA — unchanged) ────────────────────────────────────────────
function buildFlightsANA(fromCode, toCode) {
  if (!fromCode || !toCode || fromCode === toCode) return null;
  const isFromNRT = fromCode === 'NRT';
  const isToNRT   = toCode   === 'NRT';
  const viaTo   = VIA_CONNECTIONS[toCode];
  const viaFrom = VIA_CONNECTIONS[fromCode];
  if (isFromNRT && viaTo)   return buildViaFromHub(toCode, viaTo);
  if (isToNRT   && viaFrom) return buildViaToHub(fromCode, viaFrom);
  if (!isFromNRT && !isToNRT && viaTo) {
    const s1 = SCHEDULE[fromCode], s2 = SCHEDULE[viaTo.viaCode];
    const po2 = PARTNER_OPS[viaTo.viaCode];
    if (!s1 || !s2) return null;
    const cards = buildConnecting(fromCode, s1, viaTo.viaCode, s2, po2);
    if (cards) {
      const viaCity = AIRPORTS[viaTo.viaCode]?.city || viaTo.viaCode;
      const seg3Term = `${AIRPORTS[toCode]?.city || toCode} (${toCode}) — ${worldTerm(toCode)}`;
      const tzVia = TZ[viaTo.viaCode] || 0, tzDest = TZ[toCode] || 0, tzFrom2 = TZ[fromCode] || 0;
      const CONN = 75; // realistic minimum connection buffer for an interline transfer
      cards.forEach(c => {
        // Real timing: this leg departs CONN minutes after the base card's
        // actual arrival at viaCode — not an instant copy of that arrival time.
        const viaArrRaw  = c._destArrRaw;
        const viaDepRaw  = viaArrRaw + CONN;
        const destArrRaw = viaDepRaw + viaTo.dur + (tzDest - tzVia) * 60;
        const origDepUTC = c._origDepRaw - tzFrom2 * 60;
        const destArrUTC = destArrRaw - tzDest * 60;
        const plusDays   = Math.floor(destArrUTC / 1440) - Math.floor(origDepUTC / 1440);

        c._seg3Label    = `${viaTo.viaCode} → ${toCode}`;
        c._seg3Flight   = viaTo.partnerNo;
        c._seg3Operator = viaTo.partner;
        c._seg3Aircraft = viaTo.acName;
        c._seg3Duration = durStr(viaTo.dur);
        c._seg3Note     = viaTo.note;
        c._seg3Term     = seg3Term;
        c.termDest = `${viaCity} (${viaTo.viaCode}) → ${AIRPORTS[toCode]?.city || toCode} (${toCode}) via ${viaTo.partner}`;
        c.note = plusDays > 0 ? `+${plusDays} day${plusDays > 1 ? 's' : ''}` : null;
        const lastLeg = c.segments[c.segments.length - 1];
        c.segments.push(mkLeg(viaTo.viaCode, toCode, viaTo.partnerNo, viaTo.partner, viaTo.acName || '—', 'Economy · Business',
          toHHMM(viaDepRaw), lastLeg.arrTerm, toHHMM(destArrRaw), seg3Term, durStr(viaTo.dur)));
        c.layovers.push(mkStop(viaTo.viaCode, durStr(CONN), `${viaCity.toUpperCase()} (${viaTo.viaCode})`,
          `Connect in ${viaCity} (${viaTo.viaCode}) — ${viaTo.note}`, 'Minimum connection time: 75 min'));
      });
    }
    return cards;
  }
  // Origin is a codeshare-only city (e.g. Santiago) and destination is a real
  // ANA destination that isn't NRT (e.g. Hong Kong) — chain the partner leg
  // into NRT with buildViaToHub, then continue onward on ANA's own NRT→dest
  // service, mirroring the viaTo case above. The onward leg has its own real
  // schedule (possibly a single flight/day), so we have to actually check the
  // connection is feasible — not just glue it onto every base card.
  if (!isFromNRT && !isToNRT && viaFrom) {
    const baseCards = buildViaToHub(fromCode, viaFrom);
    if (!baseCards) return null;
    const s3 = SCHEDULE[toCode], po3 = PARTNER_OPS[toCode];
    if (!s3 && !po3) return null;
    const onwardDeps = s3 ? s3.outDeps : po3.outDeps;
    const onwardDur  = s3 ? s3.dur : (po3.dur || 600);
    const onwardOperator = s3 ? 'ANA' : po3.name;
    const tzDest = TZ[toCode] || 0, tzFrom2 = TZ[fromCode] || 0;
    const MCT = 90, MAX_TRANSIT = 18 * 60;
    const seg3Term = `${AIRPORTS[toCode]?.city || toCode} (${toCode}) — ${worldTerm(toCode)}`;
    const feasible = [];
    baseCards.forEach(c => {
      // Find the best onward departure this arrival can actually catch —
      // wraps to the next day if every same-day departure has already left.
      let bestK = -1, bestWait = Infinity;
      for (let k = 0; k < onwardDeps.length; k++) {
        const wait = ((onwardDeps[k] - c._nrtArrRaw) % 1440 + 1440) % 1440;
        if (wait >= MCT && wait <= MAX_TRANSIT && wait < bestWait) { bestWait = wait; bestK = k; }
      }
      if (bestK < 0) return; // no feasible connection for this arrival — drop it
      const ac3     = s3 ? (s3.ac[bestK] || s3.ac[0]) : null;
      const flightNo3 = s3 ? s3.nos[bestK] : po3.nos[bestK];
      const acName3 = s3 ? ACFT[ac3].name : po3.acName;
      const cabin3  = s3 ? cabinStr(ac3) : 'Economy · Business';
      const depMin  = onwardDeps[bestK];
      const destArrRaw = depMin + onwardDur + (tzDest - 9) * 60;
      const origDepUTC = c._fromDepRaw - tzFrom2 * 60;
      const destArrUTC = destArrRaw - tzDest * 60;
      const plusDays   = Math.floor(destArrUTC / 1440) - Math.floor(origDepUTC / 1440);
      const isOvernight = bestWait > 8 * 60;

      c._seg3Label    = `NRT → ${toCode}`;
      c._seg3Flight   = flightNo3;
      c._seg3Operator = onwardOperator;
      c._seg3Aircraft = acName3;
      c._seg3Duration = durStr(onwardDur);
      c._seg3Note     = 'Continue onward from Tokyo Mega Hub';
      c._seg3Term     = seg3Term;
      c.termDest = `Tokyo Mega Hub (NRT) → ${AIRPORTS[toCode]?.city || toCode} (${toCode}) via ${onwardOperator}`;
      c.note = isOvernight ? 'Overnight at Tokyo' : (plusDays > 0 ? `+${plusDays} day${plusDays > 1 ? 's' : ''}` : null);
      const lastLeg = c.segments[c.segments.length - 1];
      c.segments.push(mkLeg('NRT', toCode, flightNo3, onwardOperator, acName3, cabin3,
        toHHMM(depMin), lastLeg.arrTerm, toHHMM(destArrRaw), seg3Term, durStr(onwardDur)));
      c.layovers.push(mkStop('NRT', durStr(bestWait), 'TOKYO HUB',
        `Connect at Tokyo Mega Hub (NRT) to the onward flight to ${AIRPORTS[toCode]?.city || toCode}`,
        isOvernight ? 'Long layover — consider an airport hotel' : 'Domestic/international transfer as required', isOvernight));
      feasible.push({ card: c, wait: bestWait });
    });
    if (!feasible.length) return null;
    feasible.sort((a, b) => a.wait - b.wait);
    const results = feasible.map(f => f.card);
    results.forEach((c, i) => { c.tag = i === 0 ? 'recommended' : null; });
    return results;
  }
  if (isFromNRT || isToNRT) {
    const code = isFromNRT ? toCode : fromCode;
    const s = SCHEDULE[code], po = PARTNER_OPS[code];
    if (!s && !po) return null;
    return buildDirect(code, s, isFromNRT, po);
  }
  const isFromKIX = fromCode === 'KIX';
  const isToKIX   = toCode   === 'KIX';
  if (isFromKIX || isToKIX) {
    const code = isFromKIX ? toCode : fromCode;
    const s = KIX_SCHEDULE[code], po = KIX_PARTNER_OPS[code];
    // Direct KIX service (KIX international routes)
    if (s || po) return buildKixDirect(code, s, isFromKIX, po);
    // Fall back to KIX ↔ NRT shuttle + NRT connection
    const kixShuttle = SCHEDULE['KIX'];
    if (kixShuttle) {
      if (isFromKIX) {
        const s2 = SCHEDULE[code], po2 = PARTNER_OPS[code];
        if (s2) return buildConnecting('KIX', kixShuttle, code, s2, po2);
      } else {
        const s1 = SCHEDULE[code];
        if (s1) return buildConnecting(code, s1, 'KIX', kixShuttle, null);
      }
    }
    return null;
  }
  const s1 = SCHEDULE[fromCode], s2 = SCHEDULE[toCode], po2 = PARTNER_OPS[toCode];
  if (!s2) return null;
  // Allow partner-only origins (e.g. EWR: United flies NRT but ANA has no own service)
  if (!s1 && !PARTNER_OPS[fromCode]) return null;
  const allNrtCards = buildConnecting(fromCode, s1 || {inArrs:[],outDeps:[],dur:0,ac:[3],nos:[],prices:{e:0,pe:0,bc:0,fc:0}}, toCode, s2, po2);
  // Collect all KIX via cards from every applicable routing path
  const kixS1 = KIX_SCHEDULE[fromCode], kixS2 = KIX_SCHEDULE[toCode];
  const po1kix = KIX_PARTNER_OPS[fromCode];
  const allKixCards = [];

  // 1. Both origin & dest have direct KIX ANA service
  if (kixS1 && kixS2 && !kixS2.domestic) {
    const cards = buildKixConnecting(fromCode, kixS1, toCode, kixS2);
    if (cards) allKixCards.push(...cards);
  }
  // 2. Partner airline flies origin→KIX; ANA flies KIX→dest
  if (!kixS1 && po1kix && kixS2 && !kixS2.domestic) {
    const s1kixPartner = {
      inArrs: po1kix.inArrs, dur: po1kix.dur,
      prices: po1kix.prices || {e:150000,pe:null,bc:750000,fc:null},
      domestic: false, ac: null, acName: po1kix.acName,
      nos: po1kix.nos, _partner: po1kix.name,
    };
    const cards = buildKixConnecting(fromCode, s1kixPartner, toCode, kixS2);
    if (cards) {
      cards.forEach(c => { c.operator = po1kix.name; c._partner = po1kix.name; });
      allKixCards.push(...cards);
    }
  }
  // 3. Origin has NRT but no direct KIX service; dest has KIX service (NRT→shuttle→KIX)
  if (!kixS1 && kixS2 && !kixS2.domestic && s1) {
    const cards = buildKixViaHub(fromCode, s1, toCode, kixS2);
    if (cards) allKixCards.push(...cards);
  }
  // 4. Origin has KIX service but dest doesn't; dest has NRT service (KIX→shuttle→NRT)
  if (kixS1 && !kixS1.domestic && !kixS2 && s2) {
    const cards = buildKixViaHubReverse(fromCode, kixS1, toCode, s2);
    if (cards) allKixCards.push(...cards);
  }

  if (allKixCards.length > 0) {
    const nrtAna     = (allNrtCards || []).filter(c => c.tag !== 'partner');
    const nrtPartner = (allNrtCards || []).filter(c => c.tag === 'partner');
    return [...nrtAna, ...allKixCards, ...nrtPartner];
  }
  return allNrtCards;
}

// ── Core builder (public entry point) ────────────────────────────────────────
// Wraps the ANA engine above, unmodified, and additively appends JAL's direct
// NRT↔dest flights (JAL_SCHEDULE) whenever one endpoint is NRT and the other
// has JAL service — including routes ANA only reaches via a connection (e.g.
// HEL, where JAL flies direct and ANA doesn't), since this runs after, not
// instead of, the full ANA branch logic above.
function buildFlights(fromCode, toCode) {
  const anaCards = buildFlightsANA(fromCode, toCode);
  const isFromNRT = fromCode === 'NRT', isToNRT = toCode === 'NRT';
  if (!isFromNRT && !isToNRT) return anaCards;
  const code = isFromNRT ? toCode : fromCode;
  const jalS = JAL_SCHEDULE[code];
  if (!jalS) return anaCards;
  const jalCards = buildJalDirect(code, jalS, isFromNRT);
  if (!jalCards) return anaCards;
  return [...(anaCards || []), ...jalCards];
}

// ── Direct NRT↔dest ──────────────────────────────────────────────────────────
function buildDirect(code, s, outbound, po) {
  const tz = TZ[code] || 0;
  const results = [];
  function makeDirectCard(dep, dur, flightNo, acName, cabin, prices, isPartner, pName) {
    let depLocal, arrLocal, plusDays = 0;
    if (outbound) {
      const rawArr = dep + dur + (tz - 9) * 60;
      arrLocal = toHHMM(rawArr); plusDays = Math.floor(rawArr / 1440); depLocal = toHHMM(dep);
    } else {
      const rawDep = dep - dur + (tz - 9) * 60;
      depLocal = toHHMM(rawDep); arrLocal = toHHMM(dep); plusDays = Math.floor((dur - (tz - 9) * 60) / 1440);
    }
    const termOut = outbound ? 'Tokyo Mega Hub (NRT) — '+nrtGateOut(code) : `${AIRPORTS[code]?.city||code} (${code}) — ${worldTerm(code)}`;
    const termDest = outbound ? `${AIRPORTS[code]?.city||code} (${code}) — ${worldTerm(code)}` : 'Tokyo Mega Hub (NRT)';
    const operator = isPartner ? pName : 'ANA';
    return {
      tag: isPartner ? 'partner' : null, _partner: isPartner ? pName : null, direct:true,
      operator, flightOut:flightNo, flightIn:'—',
      depLocal, arrHub:toHHMM(dep), hubDep:outbound ? toHHMM(dep) : '—',
      arrDest:arrLocal, seg1Time:outbound?'—':durStr(dur), seg2Time:outbound?durStr(dur):'—',
      transitTime:'—', totalTime:durStr(dur), aircraft1:acName, aircraft2:acName,
      cabinOut:cabin, cabinIn:cabin,
      termOut,
      termHub1: outbound ? 'Tokyo Mega Hub (NRT) — '+nrtGateOut(code) : 'Tokyo Mega Hub (NRT) — '+nrtGateIn(code, isPartner),
      termHub2: outbound ? 'Tokyo Mega Hub (NRT) — '+nrtGateOut(code) : '—',
      termDest,
      transfer:'Direct service — no transfer required', mct:'Direct flight',
      note: plusDays > 0 ? `+${plusDays} day${plusDays>1?'s':''}` : null, prices,
      segments: [ outbound
        ? mkLeg('NRT', code, flightNo, operator, acName, cabin, depLocal, termOut, arrLocal, termDest, durStr(dur))
        : mkLeg(code, 'NRT', flightNo, operator, acName, cabin, depLocal, termOut, arrLocal, termDest, durStr(dur))
      ],
      layovers: [],
    };
  }
  if (s) {
    const count = Math.min(s.outDeps.length, 3);
    for (let i = 0; i < count; i++) {
      const ac = s.ac[i] || s.ac[0];
      const cabin = cabinStr(ac);
      const prices = {...s.prices};
      if (!ACFT[ac].hasPe) prices.pe = null;
      if (!ACFT[ac].hasFc) prices.fc = null;
      const card = makeDirectCard(outbound ? s.outDeps[i] : s.inArrs[i], s.dur,
        outbound ? s.nos[i] : inboundNo(s.nos[i]), ACFT[ac].name, cabin, prices, false, null);
      if (i === 0) card.tag = 'recommended';
      results.push(card);
    }
  }
  if (po) {
    const deps = outbound ? po.outDeps : po.inArrs;
    const dur  = po.dur ?? (s ? s.dur : 0);
    const nos  = outbound ? po.nos : po.nos.map(inboundNo);
    const prices = po.prices ?? (s ? s.prices : {e:null,pe:null,bc:null,fc:null});
    for (let i = 0; i < deps.length; i++)
      results.push(makeDirectCard(deps[i], dur, nos[i], po.acName, 'Business · Economy', prices, true, po.name));
  }
  return results.length > 0 ? results : null;
}

// ── Direct KIX↔dest ──────────────────────────────────────────────────────────
function buildKixDirect(code, s, outbound, po) {
  const tz = TZ[code] || 0;
  const results = [];
  const isDomestic = s?.domestic || DOMESTIC_CODES.has(code);
  const KIX_TERM = isDomestic
    ? 'Osaka Kansai Hub (KIX) — Domestic Terminal'
    : 'Osaka Kansai Hub (KIX) — International Terminal';
  function makeKixCard(dep, dur, flightNo, acName, cabin, prices, isPartner, pName) {
    let depLocal, arrLocal, plusDays = 0;
    if (outbound) {
      const rawArr = dep + dur + (tz - 9) * 60;
      arrLocal = toHHMM(rawArr); plusDays = Math.floor(rawArr / 1440); depLocal = toHHMM(dep);
    } else {
      const rawDep = dep - dur + (tz - 9) * 60;
      depLocal = toHHMM(rawDep); arrLocal = toHHMM(dep); plusDays = Math.floor((dur - (tz - 9) * 60) / 1440);
    }
    const termOut = outbound ? KIX_TERM : `${AIRPORTS[code]?.city||code} (${code}) — ${worldTerm(code)}`;
    const termDest = outbound ? `${AIRPORTS[code]?.city||code} (${code}) — ${worldTerm(code)}` : KIX_TERM;
    const operator = isPartner ? pName : 'ANA';
    return {
      tag: isPartner ? 'partner' : null, _partner: isPartner ? pName : null, direct:true,
      operator, flightOut:flightNo, flightIn:'—',
      depLocal, arrHub:toHHMM(dep), hubDep:outbound ? toHHMM(dep) : '—',
      arrDest:arrLocal, seg1Time:outbound?'—':durStr(dur), seg2Time:outbound?durStr(dur):'—',
      transitTime:'—', totalTime:durStr(dur), aircraft1:acName, aircraft2:acName,
      cabinOut:cabin, cabinIn:cabin,
      termOut,
      termHub1: KIX_TERM, termHub2: outbound ? KIX_TERM : '—',
      termDest,
      transfer:'Direct service — no transfer required', mct:'Direct flight',
      note: plusDays > 0 ? `+${plusDays} day${plusDays>1?'s':''}` : null, prices,
      segments: [ outbound
        ? mkLeg('KIX', code, flightNo, operator, acName, cabin, depLocal, termOut, arrLocal, termDest, durStr(dur))
        : mkLeg(code, 'KIX', flightNo, operator, acName, cabin, depLocal, termOut, arrLocal, termDest, durStr(dur))
      ],
      layovers: [],
    };
  }
  if (s) {
    const count = Math.min(s.outDeps.length, 3);
    for (let i = 0; i < count; i++) {
      const ac = s.ac[i] || s.ac[0];
      const cabin = cabinStr(ac);
      const prices = {...s.prices};
      if (!ACFT[ac].hasPe) prices.pe = null;
      if (!ACFT[ac].hasFc) prices.fc = null;
      const card = makeKixCard(outbound ? s.outDeps[i] : s.inArrs[i], s.dur,
        outbound ? s.nos[i] : inboundNo(s.nos[i]), ACFT[ac].name, cabin, prices, false, null);
      if (i === 0) card.tag = 'recommended';
      results.push(card);
    }
  }
  if (po) {
    const deps = outbound ? po.outDeps : po.inArrs;
    const dur  = po.dur ?? (s ? s.dur : 0);
    const nos  = outbound ? po.nos : po.nos.map(inboundNo);
    const prices = po.prices ?? (s ? s.prices : {e:null,pe:null,bc:null,fc:null});
    for (let i = 0; i < deps.length; i++)
      results.push(makeKixCard(deps[i], dur, nos[i], po.acName, 'Business · Economy', prices, true, po.name));
  }
  return results.length > 0 ? results : null;
}

// ── Connecting ORG → NRT → DST ───────────────────────────────────────────────
function buildKixConnecting(fromCode, s1kix, toCode, s2kix) {
  const tz1 = TZ[fromCode] || 9;
  const tz2 = TZ[toCode]   || 0;
  const MCT = 90, MAX_TRANSIT = 8 * 60;
  const options = [];
  const usedInboundIdxs = new Set();
  const isDomFrom = s1kix.domestic;
  const kixDomTerm  = 'Osaka Kansai Hub (KIX) — Domestic Terminal';
  const kixIntlTerm = 'Osaka Kansai Hub (KIX) — International Terminal';
  const transfer = isDomFrom
    ? 'Kansai International Airport — Domestic → International Terminal · ~10 min'
    : 'Kansai International Airport — International Terminal · allow 90 min for customs';

  for (let j = 0; j < s2kix.outDeps.length && options.length < 2; j++) {
    const kixDep = s2kix.outDeps[j];
    let bestI = -1, bestTransit = Infinity;
    for (let i = 0; i < s1kix.inArrs.length; i++) {
      if (usedInboundIdxs.has(i)) continue;
      const t = ((kixDep - s1kix.inArrs[i]) % 1440 + 1440) % 1440;
      if (t >= MCT && t <= MAX_TRANSIT && t < bestTransit) { bestTransit = t; bestI = i; }
    }
    if (bestI < 0) continue;
    usedInboundIdxs.add(bestI);
    const kixArr = s1kix.inArrs[bestI];
    const ac1 = s1kix.ac ? (s1kix.ac[bestI] || s1kix.ac[0]) : null;
    const ac2 = s2kix.ac[j] || s2kix.ac[0];
    const rawOrigDep = kixArr - s1kix.dur + (tz1 - 9) * 60;
    const rawDestArr = kixDep + s2kix.dur + (tz2 - 9) * 60;
    const origDepUTC = rawOrigDep - tz1 * 60;
    const destArrLocalAbs = (kixDep - 9 * 60 + s2kix.dur) + tz2 * 60;
    const plusDays = Math.floor(destArrLocalAbs / 1440) - Math.floor(origDepUTC / 1440);
    const ac1Name = ac1 ? ACFT[ac1].name : (s1kix.acName || 'Boeing 787-9');
    const cabin1  = ac1 ? cabinStr(ac1) : 'Business · Economy';
    const p = connectPrices(s1kix.prices, s2kix.prices);
    if (ac1 && (!ACFT[ac1].hasPe || !ACFT[ac2].hasPe)) p.pe = null;
    if (!ac1) p.pe = null;
    if ((ac1 && !ACFT[ac1].hasFc) || !ACFT[ac2].hasFc) p.fc = null;
    const flightOut1 = s1kix.nos ? (s1kix.nos[bestI] ? inboundNo(s1kix.nos[bestI]) : '—') : (s1kix.partnerNo || '—');
    const seg1Operator = s1kix._partner || 'ANA';
    const termOut = `${AIRPORTS[fromCode]?.city||fromCode} (${fromCode}) — ${worldTerm(fromCode)}`;
    const termHub1 = isDomFrom ? kixDomTerm : kixIntlTerm;
    const termDest = `${AIRPORTS[toCode]?.city||toCode} (${toCode}) — ${worldTerm(toCode)}`;
    const mct = `${MCT} min minimum connection time at Osaka Hub`;
    options.push({
      tag: 'kix',
      _kixHub: true, _transit: bestTransit, direct: false, operator: 'ANA',
      flightOut: flightOut1,
      flightIn: s2kix.nos[j],
      depLocal: toHHMM(rawOrigDep), arrHub: toHHMM(kixArr),
      hubDep: toHHMM(kixDep), arrDest: toHHMM(rawDestArr),
      seg1Time: durStr(s1kix.dur), seg2Time: durStr(s2kix.dur),
      transitTime: durStr(bestTransit), totalTime: durStr(s1kix.dur + bestTransit + s2kix.dur),
      aircraft1: ac1Name, aircraft2: ACFT[ac2].name,
      cabinOut: cabin1, cabinIn: cabinStr(ac2),
      termOut, termHub1, termHub2: kixIntlTerm, termDest,
      transfer, mct,
      note: plusDays > 0 ? `+${plusDays} day${plusDays > 1 ? 's' : ''}` : null,
      _seg1Label: `${fromCode} → KIX`,
      _seg2Label: `KIX → ${toCode}`,
      _hubLabel: 'OSAKA HUB',
      prices: p,
      segments: [
        mkLeg(fromCode, 'KIX', flightOut1, seg1Operator, ac1Name, cabin1, toHHMM(rawOrigDep), termOut, toHHMM(kixArr), termHub1, durStr(s1kix.dur)),
        mkLeg('KIX', toCode, s2kix.nos[j], 'ANA', ACFT[ac2].name, cabinStr(ac2), toHHMM(kixDep), kixIntlTerm, toHHMM(rawDestArr), termDest, durStr(s2kix.dur)),
      ],
      layovers: [ mkStop('KIX', durStr(bestTransit), 'OSAKA HUB', transfer, mct) ],
    });
  }
  return options.length > 0 ? options : null;
}

function buildKixViaHub(fromCode, s1, toCode, s2kix) {
  // 3-leg: fromCode→NRT (s1) → NRT→KIX shuttle → KIX→toCode (s2kix)
  const tz1 = TZ[fromCode] || 0;
  const tz2 = TZ[toCode]   || 0;
  const shuttle = SCHEDULE['KIX'];
  if (!shuttle || !s1 || !s1.inArrs || !s1.inArrs.length) return null;

  const MCT_NRT = 90, MAX_NRT = 18 * 60;
  const MCT_KIX = 90, MAX_KIX = 12 * 60;
  const options = [];
  const usedNrtIdxs = new Set();

  for (let k = 0; k < s2kix.outDeps.length && options.length < 2; k++) {
    const kixDep = s2kix.outDeps[k];
    let bestCombo = null, bestKixWait = Infinity;

    for (let si = 0; si < shuttle.outDeps.length; si++) {
      const shuttleDep = shuttle.outDeps[si];
      const kixShuttleArr = (shuttleDep + shuttle.dur) % 1440;
      const kixWait = ((kixDep - kixShuttleArr) % 1440 + 1440) % 1440;
      if (kixWait < MCT_KIX || kixWait > MAX_KIX) continue;

      for (let ni = 0; ni < s1.inArrs.length; ni++) {
        if (usedNrtIdxs.has(ni)) continue;
        const nrtWait = ((shuttleDep - s1.inArrs[ni]) % 1440 + 1440) % 1440;
        if (nrtWait < MCT_NRT || nrtWait > MAX_NRT) continue;
        if (kixWait < bestKixWait) { bestKixWait = kixWait; bestCombo = { ni, si, nrtWait, kixWait }; }
      }
    }

    if (!bestCombo) continue;
    usedNrtIdxs.add(bestCombo.ni);

    const { ni, si } = bestCombo;
    const nrtArr    = s1.inArrs[ni];
    const shuttleDep = shuttle.outDeps[si];
    const kixShuttleArr = (shuttleDep + shuttle.dur) % 1440;
    const ac1 = s1.ac[ni] || s1.ac[0];
    const ac2 = s2kix.ac[k] || s2kix.ac[0];
    const seg1Dur = s1.dur + bestCombo.nrtWait + shuttle.dur;
    const rawOrigDep = nrtArr - s1.dur + (tz1 - 9) * 60;
    const rawDestArr = kixDep + s2kix.dur + (tz2 - 9) * 60;
    const origDepUTC = rawOrigDep - tz1 * 60;
    const destArrLocalAbs = (kixDep - 9 * 60 + s2kix.dur) + tz2 * 60;
    const plusDays = Math.floor(destArrLocalAbs / 1440) - Math.floor(origDepUTC / 1440);
    const p = connectPrices(s1.prices, s2kix.prices);
    if (!ACFT[ac1].hasPe || !ACFT[ac2].hasPe) p.pe = null;
    if (!ACFT[ac1].hasFc || !ACFT[ac2].hasFc) p.fc = null;

    // Real stops: fromCode→NRT (int'l arrival), NRT→KIX (domestic shuttle),
    // KIX→toCode (int'l departure) — three genuine legs, two genuine layovers.
    const acShuttle = shuttle.ac ? (shuttle.ac[si] || shuttle.ac[0]) : null;
    const shuttleAcName = acShuttle ? ACFT[acShuttle].name : (shuttle.acName || 'Boeing 787-9');
    const shuttleCabin  = acShuttle ? cabinStr(acShuttle) : 'Business · Economy';
    const isNrtOvernight = bestCombo.nrtWait > 8 * 60;
    const termOut    = `${AIRPORTS[fromCode]?.city||fromCode} (${fromCode}) — ${worldTerm(fromCode)}`;
    const termNrtArr = `Tokyo Mega Hub (NRT) — ${nrtGateIn(fromCode, false)}`;
    const termNrtDep = `Tokyo Mega Hub (NRT) — ${nrtGateOut('KIX')}`;
    const termKixArr = 'Osaka Kansai Hub (KIX) — Domestic Terminal';
    const termKixDep = 'Osaka Kansai Hub (KIX) — International Terminal';
    const termDest   = `${AIRPORTS[toCode]?.city||toCode} (${toCode}) — ${worldTerm(toCode)}`;
    const nrtTransfer = isNrtOvernight
      ? `Overnight connection at Tokyo Hub — Airport hotel from ¥10,000/night · then domestic transfer to Osaka Hub (KIX)`
      : `Domestic transfer at Tokyo Hub (NRT) to the Osaka Hub (KIX) shuttle`;
    const kixTransfer = 'Kansai International Airport — Domestic → International Terminal · allow 90 min for customs';

    options.push({
      tag: 'kix',
      _kixHub: true, _kixViaNrt: true, _nrtTransit: durStr(bestCombo.nrtWait), _stopCount: 2,
      direct: false, operator: 'ANA',
      flightOut: s1.nos[ni] ? inboundNo(s1.nos[ni]) : '—',
      flightIn: s2kix.nos[k],
      depLocal: toHHMM(rawOrigDep), arrHub: toHHMM(kixShuttleArr),
      hubDep: toHHMM(kixDep), arrDest: toHHMM(rawDestArr),
      seg1Time: durStr(seg1Dur), seg2Time: durStr(s2kix.dur),
      transitTime: durStr(bestCombo.kixWait),
      totalTime: durStr(seg1Dur + bestCombo.kixWait + s2kix.dur),
      aircraft1: ACFT[ac1].name, aircraft2: ACFT[ac2].name,
      cabinOut: cabinStr(ac1), cabinIn: cabinStr(ac2),
      termOut,
      termHub1: termKixDep,
      termHub2: termKixDep,
      termDest,
      transfer: `Via Tokyo Hub (NRT) — ${durStr(bestCombo.nrtWait)} transit · then ANA shuttle to Osaka Hub (KIX)`,
      mct: '90 min minimum connection time at each hub',
      note: plusDays > 0 ? `+${plusDays} day${plusDays > 1 ? 's' : ''}` : null,
      _seg1Label: `${fromCode} → NRT → KIX`,
      _seg2Label: `KIX → ${toCode}`,
      _hubLabel: 'OSAKA HUB',
      prices: p,
      segments: [
        mkLeg(fromCode, 'NRT', s1.nos[ni] ? inboundNo(s1.nos[ni]) : '—', 'ANA', ACFT[ac1].name, cabinStr(ac1), toHHMM(rawOrigDep), termOut, toHHMM(nrtArr), termNrtArr, durStr(s1.dur)),
        mkLeg('NRT', 'KIX', shuttle.nos[si], 'ANA', shuttleAcName, shuttleCabin, toHHMM(shuttleDep), termNrtDep, toHHMM(kixShuttleArr), termKixArr, durStr(shuttle.dur)),
        mkLeg('KIX', toCode, s2kix.nos[k], 'ANA', ACFT[ac2].name, cabinStr(ac2), toHHMM(kixDep), termKixDep, toHHMM(rawDestArr), termDest, durStr(s2kix.dur)),
      ],
      layovers: [
        mkStop('NRT', durStr(bestCombo.nrtWait), 'TOKYO HUB', nrtTransfer, 'Domestic transfer — no customs re-check needed', isNrtOvernight),
        mkStop('KIX', durStr(bestCombo.kixWait), 'OSAKA HUB', kixTransfer, '90 min minimum connection time'),
      ],
    });
  }
  return options.length > 0 ? options : null;
}

function buildKixViaHubReverse(fromCode, s1kix, toCode, s2) {
  // 3-leg: fromCode→KIX (s1kix) → KIX→NRT shuttle → NRT→toCode (s2)
  const tz1 = TZ[fromCode] || 0;
  const tz2 = TZ[toCode]   || 0;
  const shuttle = SCHEDULE['KIX'];
  if (!shuttle || !s2 || !s2.outDeps || !s2.outDeps.length) return null;

  const MCT_KIX = 90, MAX_KIX = 12 * 60;
  const MCT_NRT = 90, MAX_NRT = 18 * 60;
  const options = [];
  const usedKixIdxs = new Set();

  for (let k = 0; k < s2.outDeps.length && options.length < 2; k++) {
    const nrtDep = s2.outDeps[k];
    let bestCombo = null, bestKixWait = Infinity;

    for (let si = 0; si < shuttle.inArrs.length; si++) {
      const nrtArr = shuttle.inArrs[si];
      const kixDepShuttle = (nrtArr - shuttle.dur + 1440) % 1440;
      const nrtWait = ((nrtDep - nrtArr) % 1440 + 1440) % 1440;
      if (nrtWait < MCT_NRT || nrtWait > MAX_NRT) continue;

      for (let ni = 0; ni < s1kix.inArrs.length; ni++) {
        if (usedKixIdxs.has(ni)) continue;
        const kixWait = ((kixDepShuttle - s1kix.inArrs[ni]) % 1440 + 1440) % 1440;
        if (kixWait < MCT_KIX || kixWait > MAX_KIX) continue;
        if (kixWait < bestKixWait) { bestKixWait = kixWait; bestCombo = { ni, si, nrtWait, kixWait }; }
      }
    }

    if (!bestCombo) continue;
    usedKixIdxs.add(bestCombo.ni);

    const { ni, si } = bestCombo;
    const kixArr      = s1kix.inArrs[ni];
    const nrtArr      = shuttle.inArrs[si];
    const kixDepShuttle = (nrtArr - shuttle.dur + 1440) % 1440;
    const ac1 = s1kix.ac ? (s1kix.ac[ni] || s1kix.ac[0]) : null;
    const ac2 = s2.ac[k] || s2.ac[0];
    const seg2Dur = shuttle.dur + bestCombo.nrtWait + s2.dur;
    const rawOrigDep = kixArr - s1kix.dur + (tz1 - 9) * 60;
    const rawDestArr = nrtDep + s2.dur + (tz2 - 9) * 60;
    const origDepUTC = rawOrigDep - tz1 * 60;
    const destArrLocalAbs = (nrtDep - 9 * 60 + s2.dur) + tz2 * 60;
    const plusDays = Math.floor(destArrLocalAbs / 1440) - Math.floor(origDepUTC / 1440);
    const ac1Name = ac1 ? ACFT[ac1].name : (s1kix.acName || 'Boeing 787-9');
    const cabin1 = ac1 ? cabinStr(ac1) : 'Business · Economy';
    const p = connectPrices(s1kix.prices, s2.prices);
    if (ac1 && !ACFT[ac1].hasPe) p.pe = null;
    if (!ac1 || !ACFT[ac2].hasPe) p.pe = null;
    if ((ac1 && !ACFT[ac1].hasFc) || !ACFT[ac2].hasFc) p.fc = null;

    // Real stops: fromCode→KIX (int'l arrival), KIX→NRT (domestic shuttle),
    // NRT→toCode (int'l departure) — three genuine legs, two genuine layovers.
    const acShuttle = shuttle.ac ? (shuttle.ac[si] || shuttle.ac[0]) : null;
    const shuttleAcName = acShuttle ? ACFT[acShuttle].name : (shuttle.acName || 'Boeing 787-9');
    const shuttleCabin  = acShuttle ? cabinStr(acShuttle) : 'Business · Economy';
    const isNrtOvernight = bestCombo.nrtWait > 8 * 60;
    const flightOut1 = s1kix.nos ? (s1kix.nos[ni] ? inboundNo(s1kix.nos[ni]) : '—') : '—';
    const seg1Operator = s1kix._partner || 'ANA';
    const termOut     = `${AIRPORTS[fromCode]?.city||fromCode} (${fromCode}) — ${worldTerm(fromCode)}`;
    const termKixArr  = 'Osaka Kansai Hub (KIX) — International Terminal';
    const termKixDep  = 'Osaka Kansai Hub (KIX) — Domestic Terminal';
    const termNrtArr  = `Tokyo Mega Hub (NRT) — ${nrtGateIn('KIX', false)}`;
    const termNrtDep  = `Tokyo Mega Hub (NRT) — ${nrtGateOut(toCode)}`;
    const termDest    = `${AIRPORTS[toCode]?.city||toCode} (${toCode}) — ${worldTerm(toCode)}`;
    const kixTransfer = 'Kansai International Airport — International → Domestic Terminal · allow time to clear customs first';
    const nrtTransfer = isNrtOvernight
      ? `Overnight connection at Tokyo Hub — Airport hotel from ¥10,000/night · then international departure to ${toCode}`
      : `Domestic arrival at Tokyo Hub (NRT), transfer to international departure`;

    options.push({
      tag: 'kix',
      _kixHub: true, _kixThenNrt: true, _nrtTransit: durStr(bestCombo.nrtWait), _stopCount: 2,
      direct: false, operator: 'ANA',
      flightOut: flightOut1,
      flightIn: s2.nos[k],
      depLocal: toHHMM(rawOrigDep), arrHub: toHHMM(kixArr),
      hubDep: toHHMM(kixDepShuttle), arrDest: toHHMM(rawDestArr),
      seg1Time: durStr(s1kix.dur), seg2Time: durStr(seg2Dur),
      transitTime: durStr(bestCombo.kixWait),
      totalTime: durStr(s1kix.dur + bestCombo.kixWait + seg2Dur),
      aircraft1: ac1Name, aircraft2: ACFT[ac2].name,
      cabinOut: cabin1, cabinIn: cabinStr(ac2),
      termOut,
      termHub1: termKixArr,
      termHub2: termKixArr,
      termDest,
      transfer: `Via Tokyo Hub (NRT) — ANA shuttle KIX→NRT · ${durStr(bestCombo.nrtWait)} NRT transit to ${toCode}`,
      mct: '90 min minimum connection time at each hub',
      note: plusDays > 0 ? `+${plusDays} day${plusDays > 1 ? 's' : ''}` : null,
      _seg1Label: `${fromCode} → KIX`,
      _seg2Label: `KIX → NRT → ${toCode}`,
      _hubLabel: 'OSAKA HUB',
      prices: p,
      segments: [
        mkLeg(fromCode, 'KIX', flightOut1, seg1Operator, ac1Name, cabin1, toHHMM(rawOrigDep), termOut, toHHMM(kixArr), termKixArr, durStr(s1kix.dur)),
        mkLeg('KIX', 'NRT', inboundNo(shuttle.nos[si]), 'ANA', shuttleAcName, shuttleCabin, toHHMM(kixDepShuttle), termKixDep, toHHMM(nrtArr), termNrtArr, durStr(shuttle.dur)),
        mkLeg('NRT', toCode, s2.nos[k], 'ANA', ACFT[ac2].name, cabinStr(ac2), toHHMM(nrtDep), termNrtDep, toHHMM(rawDestArr), termDest, durStr(s2.dur)),
      ],
      layovers: [
        mkStop('KIX', durStr(bestCombo.kixWait), 'OSAKA HUB', kixTransfer, '90 min minimum connection time'),
        mkStop('NRT', durStr(bestCombo.nrtWait), 'TOKYO HUB', nrtTransfer, 'Domestic transfer — no customs re-check needed', isNrtOvernight),
      ],
    });
  }
  return options.length > 0 ? options : null;
}

function buildConnecting(fromCode, s1, toCode, s2, po2) {
  const tz1 = TZ[fromCode] || 0, tz2 = TZ[toCode] || 0;
  const MCT = 90, MAX_TRANSIT = 18 * 60;
  const options = [];
  const usedInboundIdxs = new Set();

  const hasS1 = s1 && s1.inArrs && s1.inArrs.length > 0;

  if (hasS1)
  for (let j = 0; j < s2.outDeps.length && options.length < 3; j++) {
    const outDep = s2.outDeps[j];
    let bestI = -1, bestTransit = Infinity;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < s1.inArrs.length; i++) {
        if (pass === 0 && usedInboundIdxs.has(i)) continue;
        const t = ((outDep - s1.inArrs[i]) % 1440 + 1440) % 1440;
        if (t >= MCT && t <= MAX_TRANSIT && t < bestTransit) { bestTransit = t; bestI = i; }
      }
      if (bestI >= 0) break;
    }
    if (bestI < 0) continue;
    usedInboundIdxs.add(bestI);
    const inArr = s1.inArrs[bestI], transit = bestTransit;
    const ac1 = s1.ac[bestI] || s1.ac[0], ac2 = s2.ac[j] || s2.ac[0];
    const rawOrigDep = inArr - s1.dur + (tz1 - 9) * 60;
    const rawDestArr = outDep + s2.dur + (tz2 - 9) * 60;
    const origDepUTC = rawOrigDep - tz1 * 60;
    const destArrLocalAbs = (outDep - 9*60 + s2.dur) + tz2 * 60;
    const plusDays = Math.floor(destArrLocalAbs / 1440) - Math.floor(origDepUTC / 1440);
    const isOvernight = transit > 8 * 60;
    const termOut  = `${AIRPORTS[fromCode]?.city||fromCode} (${fromCode}) — ${worldTerm(fromCode)}`;
    const termHub1 = `Tokyo Mega Hub (NRT) — ${nrtGateIn(fromCode, false)}`;
    const termHub2 = `Tokyo Mega Hub (NRT) — ${nrtGateOut(toCode)}`;
    const termDest = `${AIRPORTS[toCode]?.city||toCode} (${toCode}) — ${worldTerm(toCode)}`;
    const transfer = transferPath(fromCode, toCode);
    const mct = isOvernight ? `Overnight connection at Tokyo Hub  ·  Airport hotel from ¥10,000/night  ·  ${mctLabel(fromCode,toCode)}` : mctLabel(fromCode,toCode);
    options.push({
      _outDepIdx:j, tag: null, _transit: transit, direct:false, operator:'ANA',
      flightOut:s1.nos[bestI] ? inboundNo(s1.nos[bestI]) : '—', flightIn:s2.nos[j],
      depLocal:toHHMM(rawOrigDep), arrHub:toHHMM(inArr), hubDep:toHHMM(outDep), arrDest:toHHMM(rawDestArr),
      seg1Time:durStr(s1.dur), seg2Time:durStr(s2.dur), transitTime:durStr(transit), totalTime:durStr(s1.dur+transit+s2.dur),
      aircraft1:ACFT[ac1].name, aircraft2:ACFT[ac2].name, cabinOut:cabinStr(ac1), cabinIn:cabinStr(ac2),
      termOut, termHub1, termHub2, termDest, transfer, mct,
      note: isOvernight ? 'Overnight at Tokyo' : (plusDays > 0 ? `+${plusDays} day${plusDays>1?'s':''}` : null),
      _destArrRaw: rawDestArr, _origDepRaw: rawOrigDep,
      prices: (() => {
        const p = connectPrices(s1.prices, s2.prices);
        // Null out PE/FC if either leg's aircraft doesn't carry that cabin
        if (!ACFT[ac1].hasPe || !ACFT[ac2].hasPe) p.pe = null;
        if (!ACFT[ac1].hasFc || !ACFT[ac2].hasFc) p.fc = null;
        return p;
      })(),
      segments: [
        mkLeg(fromCode, 'NRT', s1.nos[bestI] ? inboundNo(s1.nos[bestI]) : '—', 'ANA', ACFT[ac1].name, cabinStr(ac1), toHHMM(rawOrigDep), termOut, toHHMM(inArr), termHub1, durStr(s1.dur)),
        mkLeg('NRT', toCode, s2.nos[j], 'ANA', ACFT[ac2].name, cabinStr(ac2), toHHMM(outDep), termHub2, toHHMM(rawDestArr), termDest, durStr(s2.dur)),
      ],
      layovers: [ mkStop('NRT', durStr(transit), 'TOKYO HUB', transfer, mct, isOvernight) ],
    });
  }

  // Sort ANA options by transit ascending (shortest connection = Recommended)
  options.sort((a, b) => a._transit - b._transit);
  { const _n = options.length; options.forEach((o, i) => { o.tag = i === 0 ? 'recommended' : (_n >= 3 && i === _n - 1 ? 'best value' : null); }); }

  // Partner-operated seg2 (Star Alliance NRT→dest) — only if ANA flies origin leg
  if (po2 && hasS1) {
    const pDur = po2.dur ?? s2.dur;
    for (let pj = 0; pj < po2.outDeps.length; pj++) {
      const outDep = po2.outDeps[pj];
      let bestI = -1, bestTransit = Infinity;
      for (let i = 0; i < s1.inArrs.length; i++) {
        const t = ((outDep - s1.inArrs[i]) % 1440 + 1440) % 1440;
        if (t >= MCT && t <= MAX_TRANSIT && t < bestTransit) { bestTransit = t; bestI = i; }
      }
      if (bestI < 0) continue;
      const inArr = s1.inArrs[bestI], transit = bestTransit;
      const ac1 = s1.ac[bestI] || s1.ac[0];
      const rawOrigDep = inArr - s1.dur + (tz1 - 9) * 60;
      const destArrLocalAbs = (outDep - 9*60 + pDur) + tz2 * 60;
      const plusDays = Math.floor(destArrLocalAbs/1440) - Math.floor((rawOrigDep-tz1*60)/1440);
      const isOvernight = transit > 8 * 60;
      const pPrices = po2.prices ?? s2.prices;
      const merged = connectPrices(s1.prices, pPrices);
      const termOut  = `${AIRPORTS[fromCode]?.city||fromCode} (${fromCode}) — ${worldTerm(fromCode)}`;
      const termHub1 = `Tokyo Mega Hub (NRT) — ${nrtGateIn(fromCode, false)}`;
      const termHub2 = `Tokyo Mega Hub (NRT) — ${nrtGateOut(toCode)}`;
      const termDest = `${AIRPORTS[toCode]?.city||toCode} (${toCode}) — ${worldTerm(toCode)}`;
      const transfer = transferPath(fromCode, toCode);
      const mct = isOvernight ? `Overnight at Tokyo Hub  ·  Airport hotel from ¥10,000/night  ·  ${mctLabel(fromCode,toCode)}` : mctLabel(fromCode,toCode);
      options.push({
        _outDepIdx:-1, tag:'partner', _partner:po2.name, direct:false,
        operator:`ANA / ${po2.name}`,
        flightOut:s1.nos[bestI] ? inboundNo(s1.nos[bestI]) : '—', flightIn:po2.nos[pj],
        depLocal:toHHMM(rawOrigDep), arrHub:toHHMM(inArr), hubDep:toHHMM(outDep), arrDest:toHHMM(destArrLocalAbs),
        seg1Time:durStr(s1.dur), seg2Time:durStr(pDur), transitTime:durStr(transit), totalTime:durStr(s1.dur+transit+pDur),
        aircraft1:ACFT[ac1].name, aircraft2:po2.acName, cabinOut:cabinStr(ac1), cabinIn:'Business · Economy',
        termOut, termHub1, termHub2, termDest, transfer, mct,
        note: isOvernight ? 'Overnight at Tokyo' : (plusDays > 0 ? `+${plusDays} day${plusDays>1?'s':''}` : null),
        _destArrRaw: destArrLocalAbs, _origDepRaw: rawOrigDep,
        prices:{ e:Math.round(merged.e*0.9), pe:null, bc:merged.bc, fc:null },
        segments: [
          mkLeg(fromCode, 'NRT', s1.nos[bestI] ? inboundNo(s1.nos[bestI]) : '—', 'ANA', ACFT[ac1].name, cabinStr(ac1), toHHMM(rawOrigDep), termOut, toHHMM(inArr), termHub1, durStr(s1.dur)),
          mkLeg('NRT', toCode, po2.nos[pj], po2.name, po2.acName, 'Business · Economy', toHHMM(outDep), termHub2, toHHMM(destArrLocalAbs), termDest, durStr(pDur)),
        ],
        layovers: [ mkStop('NRT', durStr(transit), 'TOKYO HUB', transfer, mct, isOvernight) ],
      });
    }
  }

  // Partner-operated seg1 (Star Alliance origin→NRT e.g. Air Canada)
  const po1 = PARTNER_OPS[fromCode];
  if (po1) {
    const p1Dur = po1.dur ?? s1?.dur ?? 840;
    for (let pi = 0; pi < po1.inArrs.length; pi++) {
      const inArr = po1.inArrs[pi];
      let bestJ = -1, bestTransit = Infinity;
      for (let j = 0; j < s2.outDeps.length; j++) {
        const t = ((s2.outDeps[j] - inArr) % 1440 + 1440) % 1440;
        if (t >= MCT && t <= MAX_TRANSIT && t < bestTransit) { bestTransit = t; bestJ = j; }
      }
      if (bestJ < 0) continue;
      const outDep = s2.outDeps[bestJ], transit = bestTransit;
      const ac2 = s2.ac[bestJ] || s2.ac[0];
      const rawOrigDep = inArr - p1Dur + (tz1 - 9) * 60;
      const rawDestArr = outDep + s2.dur + (tz2 - 9) * 60;
      const plusDays = Math.floor((outDep-9*60+s2.dur+tz2*60)/1440) - Math.floor((rawOrigDep-tz1*60)/1440);
      const isOvernight = transit > 8 * 60;
      const pPrices = po1.prices ?? s1?.prices ?? {e:100000,pe:null,bc:500000,fc:null};
      const merged = connectPrices(pPrices, s2.prices);
      const termOut  = `${AIRPORTS[fromCode]?.city||fromCode} (${fromCode}) — ${worldTerm(fromCode)}`;
      const termHub1 = `Tokyo Mega Hub (NRT) — ${nrtGateIn(fromCode, true)}`;
      const termHub2 = `Tokyo Mega Hub (NRT) — ${nrtGateOut(toCode)}`;
      const termDest = `${AIRPORTS[toCode]?.city||toCode} (${toCode}) — ${worldTerm(toCode)}`;
      const transfer = transferPath(fromCode, toCode);
      const mct = isOvernight ? `Overnight at Tokyo Hub  ·  Airport hotel from ¥10,000/night  ·  ${mctLabel(fromCode,toCode)}` : mctLabel(fromCode,toCode);
      options.push({
        _outDepIdx:-2, tag:'partner', _partner:po1.name, direct:false,
        operator:`${po1.name} / ANA`,
        flightOut:po1.nos[pi], flightIn:s2.nos[bestJ],
        depLocal:toHHMM(rawOrigDep), arrHub:toHHMM(inArr), hubDep:toHHMM(outDep), arrDest:toHHMM(rawDestArr),
        seg1Time:durStr(p1Dur), seg2Time:durStr(s2.dur), transitTime:durStr(transit), totalTime:durStr(p1Dur+transit+s2.dur),
        aircraft1:po1.acName, aircraft2:ACFT[ac2].name, cabinOut:'Business · Economy', cabinIn:cabinStr(ac2),
        termOut, termHub1, termHub2, termDest, transfer, mct,
        note: isOvernight ? 'Overnight at Tokyo' : (plusDays > 0 ? `+${plusDays} day${plusDays>1?'s':''}` : null),
        _destArrRaw: rawDestArr, _origDepRaw: rawOrigDep,
        prices:{ e:Math.round(merged.e*0.9), pe:null, bc:merged.bc, fc:null },
        segments: [
          mkLeg(fromCode, 'NRT', po1.nos[pi], po1.name, po1.acName, 'Business · Economy', toHHMM(rawOrigDep), termOut, toHHMM(inArr), termHub1, durStr(p1Dur)),
          mkLeg('NRT', toCode, s2.nos[bestJ], 'ANA', ACFT[ac2].name, cabinStr(ac2), toHHMM(outDep), termHub2, toHHMM(rawDestArr), termDest, durStr(s2.dur)),
        ],
        layovers: [ mkStop('NRT', durStr(transit), 'TOKYO HUB', transfer, mct, isOvernight) ],
      });
    }
  }

  return options.length > 0 ? options : null;
}
