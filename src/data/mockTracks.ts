import { Track } from '../types';

export const MOCK_TRACKS: Track[] = [
  {
    id: 'sebring',
    name: 'Sebring International Raceway',
    country: 'United States',
    flagCode: 'us',
    lengthMeters: 6019,
    turns: 17,
    recordLapTime: 101.892, // 1:41.892
    recordHolder: 'Jack Aitken',
    recordCar: 'Cadillac V-Series.R',
    viewBox: '0 0 800 500',
    description: 'Iconic historic airfield circuit in Florida famed for its bumpy concrete slabs, high speed sweepers, and the punishing Turn 17 Sunset Bend.',
    sectorBoundaries: {
      sector1EndDist: 2100,
      sector2EndDist: 4350,
    },
    // Realistic Sebring SVG layout
    svgPath: 'M 140,380 L 190,410 C 230,420 280,410 320,380 L 400,320 C 430,300 480,310 520,330 L 620,380 C 660,400 700,390 730,350 C 760,310 740,250 690,230 L 590,200 C 560,190 530,170 510,140 L 480,90 C 460,60 420,50 390,70 L 320,110 C 290,130 250,130 220,110 L 160,70 C 130,50 90,70 80,110 L 70,220 C 60,260 70,300 100,340 Z',
    corners: [
      { number: 1, name: 'Turn 1', distance: 350, x: 190, y: 410, type: 'sweeper', suggestedGear: 4, targetApexSpeed: 185 },
      { number: 3, name: 'Hairpin (T3)', distance: 1100, x: 320, y: 380, type: 'hairpin', suggestedGear: 2, targetApexSpeed: 82 },
      { number: 7, name: 'Fangio Chicane', distance: 2400, x: 520, y: 330, type: 'chicane', suggestedGear: 2, targetApexSpeed: 95 },
      { number: 10, name: 'Cunningham', distance: 3300, x: 690, y: 230, type: 'medium', suggestedGear: 3, targetApexSpeed: 125 },
      { number: 13, name: 'Tower Turn', distance: 4100, x: 510, y: 140, type: 'medium', suggestedGear: 3, targetApexSpeed: 118 },
      { number: 15, name: 'Le Mans Curve', distance: 4850, x: 320, y: 110, type: 'sweeper', suggestedGear: 4, targetApexSpeed: 165 },
      { number: 17, name: 'Sunset Bend', distance: 5650, x: 80, y: 220, type: 'sweeper', suggestedGear: 3, targetApexSpeed: 145 },
    ],
  },
  {
    id: 'imola',
    name: 'Autodromo Enzo e Dino Ferrari (Imola)',
    country: 'Italy',
    flagCode: 'it',
    lengthMeters: 4909,
    turns: 19,
    recordLapTime: 99.435, // 1:39.435
    recordHolder: 'Antonio Fuoco',
    recordCar: 'Ferrari 499P',
    viewBox: '0 0 800 500',
    description: 'Fast, undulating classic Italian circuit running counter-clockwise with aggressive kerbs and legendary chicanes.',
    sectorBoundaries: {
      sector1EndDist: 1750,
      sector2EndDist: 3450,
    },
    // Imola SVG outline
    svgPath: 'M 650,380 L 320,400 C 270,400 230,370 210,330 L 180,270 C 160,230 140,200 110,190 L 80,180 C 60,160 70,120 100,100 L 170,70 C 220,50 270,70 300,110 L 360,180 C 390,210 440,220 480,190 L 530,150 C 560,130 610,130 640,160 L 700,220 C 730,250 740,300 710,340 Z',
    corners: [
      { number: 2, name: 'Variante Tamburello', distance: 680, x: 270, y: 400, type: 'chicane', suggestedGear: 3, targetApexSpeed: 135 },
      { number: 5, name: 'Variante Villeneuve', distance: 1350, x: 180, y: 270, type: 'chicane', suggestedGear: 3, targetApexSpeed: 142 },
      { number: 7, name: 'Tosa', distance: 1850, x: 80, y: 180, type: 'hairpin', suggestedGear: 2, targetApexSpeed: 88 },
      { number: 9, name: 'Piratella', distance: 2400, x: 170, y: 70, type: 'medium', suggestedGear: 4, targetApexSpeed: 168 },
      { number: 11, name: 'Acque Minerali', distance: 3050, x: 360, y: 180, type: 'chicane', suggestedGear: 3, targetApexSpeed: 122 },
      { number: 14, name: 'Variante Alta', distance: 3800, x: 530, y: 150, type: 'chicane', suggestedGear: 2, targetApexSpeed: 105 },
      { number: 17, name: 'Rivazza', distance: 4400, x: 700, y: 220, type: 'medium', suggestedGear: 3, targetApexSpeed: 115 },
    ],
  },
  {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    country: 'United Kingdom',
    flagCode: 'gb',
    lengthMeters: 5891,
    turns: 18,
    recordLapTime: 116.120, // 1:56.120
    recordHolder: 'Raffaele Marciello',
    recordCar: 'Mercedes-AMG GT3',
    viewBox: '0 0 800 500',
    description: 'The home of British motorsport, celebrated for lightning fast direction changes through Maggotts, Becketts, and Chapel.',
    sectorBoundaries: {
      sector1EndDist: 1980,
      sector2EndDist: 4120,
    },
    // Silverstone SVG outline
    svgPath: 'M 180,360 L 140,280 C 130,250 140,220 170,200 L 250,150 C 280,130 320,130 360,150 L 440,200 C 470,220 500,210 520,180 L 550,130 C 570,100 610,90 650,100 L 720,130 C 750,150 760,190 730,220 L 650,280 C 620,310 610,350 630,390 L 650,420 C 660,450 630,470 600,460 L 480,420 C 450,410 420,420 400,440 L 350,470 C 310,480 270,470 250,440 L 200,380 Z',
    corners: [
      { number: 1, name: 'Abbey', distance: 450, x: 140, y: 280, type: 'sweeper', suggestedGear: 5, targetApexSpeed: 215 },
      { number: 3, name: 'The Loop', distance: 1100, x: 250, y: 150, type: 'hairpin', suggestedGear: 2, targetApexSpeed: 78 },
      { number: 6, name: 'Brooklands', distance: 2100, x: 440, y: 200, type: 'medium', suggestedGear: 3, targetApexSpeed: 128 },
      { number: 9, name: 'Copse', distance: 3050, x: 550, y: 130, type: 'sweeper', suggestedGear: 5, targetApexSpeed: 220 },
      { number: 10, name: 'Maggotts', distance: 3450, x: 650, y: 100, type: 'sweeper', suggestedGear: 6, targetApexSpeed: 250 },
      { number: 12, name: 'Becketts', distance: 3750, x: 720, y: 130, type: 'chicane', suggestedGear: 4, targetApexSpeed: 180 },
      { number: 15, name: 'Stowe', distance: 4550, x: 630, y: 390, type: 'sweeper', suggestedGear: 4, targetApexSpeed: 165 },
      { number: 16, name: 'Vale / Club', distance: 5350, x: 350, y: 470, type: 'chicane', suggestedGear: 2, targetApexSpeed: 92 },
    ],
  },
  {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    country: 'Italy',
    flagCode: 'it',
    lengthMeters: 5793,
    turns: 11,
    recordLapTime: 104.982, // 1:44.982
    recordHolder: 'Dries Vanthoor',
    recordCar: 'Audi R8 LMS GT3',
    viewBox: '0 0 800 500',
    description: 'The Temple of Speed. Characterized by colossal slipstream straights, heavy braking zones into tight chicanes, and high top speeds.',
    sectorBoundaries: {
      sector1EndDist: 2150,
      sector2EndDist: 4050,
    },
    // Monza SVG outline
    svgPath: 'M 180,420 L 620,420 C 680,420 740,380 750,320 C 760,250 720,180 660,160 L 460,120 C 420,110 390,90 380,60 L 370,50 C 350,30 320,30 300,50 L 260,100 C 240,120 210,130 180,130 L 120,130 C 70,140 50,190 70,240 L 110,320 C 130,370 150,420 180,420 Z',
    corners: [
      { number: 1, name: 'Variante del Rettifilo', distance: 1150, x: 620, y: 420, type: 'chicane', suggestedGear: 1, targetApexSpeed: 72 },
      { number: 3, name: 'Curva Grande', distance: 1850, x: 740, y: 320, type: 'sweeper', suggestedGear: 5, targetApexSpeed: 235 },
      { number: 4, name: 'Variante della Roggia', distance: 2550, x: 660, y: 160, type: 'chicane', suggestedGear: 2, targetApexSpeed: 105 },
      { number: 6, name: 'Lesmo 1', distance: 3100, x: 460, y: 120, type: 'medium', suggestedGear: 3, targetApexSpeed: 148 },
      { number: 7, name: 'Lesmo 2', distance: 3450, x: 380, y: 60, type: 'medium', suggestedGear: 3, targetApexSpeed: 142 },
      { number: 8, name: 'Variante Ascari', distance: 4400, x: 260, y: 100, type: 'chicane', suggestedGear: 3, targetApexSpeed: 162 },
      { number: 11, name: 'Curva Parabolica', distance: 5350, x: 110, y: 320, type: 'sweeper', suggestedGear: 4, targetApexSpeed: 175 },
    ],
  },
  {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    flagCode: 'be',
    lengthMeters: 7004,
    turns: 19,
    recordLapTime: 134.821, // 2:14.821
    recordHolder: 'Nicki Thiim',
    recordCar: 'Aston Martin Vantage AMR GT3',
    viewBox: '0 0 800 500',
    description: 'The roller-coaster of the Ardennes. Features dramatic elevation changes, Eau Rouge / Raidillon, and the double-left Pouhon.',
    sectorBoundaries: {
      sector1EndDist: 2350,
      sector2EndDist: 5120,
    },
    // Spa SVG outline
    svgPath: 'M 180,410 L 160,340 C 150,300 170,260 210,250 L 310,240 C 350,230 380,200 400,160 L 430,90 C 450,50 500,40 540,70 L 650,150 C 690,180 740,190 760,230 C 780,270 760,320 720,340 L 600,370 C 560,380 520,370 490,340 L 460,310 C 430,280 390,290 370,330 L 330,410 C 300,450 240,460 200,440 Z',
    corners: [
      { number: 1, name: 'La Source', distance: 380, x: 160, y: 340, type: 'hairpin', suggestedGear: 1, targetApexSpeed: 68 },
      { number: 2, name: 'Eau Rouge', distance: 1100, x: 210, y: 250, type: 'sweeper', suggestedGear: 5, targetApexSpeed: 242 },
      { number: 4, name: 'Raidillon', distance: 1420, x: 310, y: 240, type: 'sweeper', suggestedGear: 5, targetApexSpeed: 238 },
      { number: 5, name: 'Les Combes', distance: 2450, x: 400, y: 160, type: 'chicane', suggestedGear: 3, targetApexSpeed: 132 },
      { number: 8, name: 'Bruxelles', distance: 3200, x: 540, y: 70, type: 'hairpin', suggestedGear: 2, targetApexSpeed: 95 },
      { number: 10, name: 'Pouhon', distance: 4150, x: 650, y: 150, type: 'sweeper', suggestedGear: 4, targetApexSpeed: 195 },
      { number: 14, name: 'Campus / Stavelot', distance: 5350, x: 720, y: 340, type: 'medium', suggestedGear: 3, targetApexSpeed: 140 },
      { number: 17, name: 'Blanchimont', distance: 6200, x: 490, y: 340, type: 'sweeper', suggestedGear: 5, targetApexSpeed: 255 },
      { number: 19, name: 'Bus Stop Chicane', distance: 6750, x: 330, y: 410, type: 'chicane', suggestedGear: 1, targetApexSpeed: 75 },
    ],
  },
];
