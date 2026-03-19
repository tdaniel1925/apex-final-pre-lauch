// ============================================================
// US Map SVG Path Data
// Complete SVG paths for all 50 states (simplified for performance)
// ============================================================

export interface StatePathData {
  code: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
}

// Simplified SVG paths for US states (using a standard projection)
// These are approximate paths for demonstration
export const US_STATES_PATHS: StatePathData[] = [
  // Note: In production, you would use proper geographic SVG paths
  // For now, I'll create a simpler grid-based layout that's functional

  // West Coast
  { code: 'WA', name: 'Washington', path: 'M50,50 L130,50 L130,100 L50,100 Z', labelX: 90, labelY: 75 },
  { code: 'OR', name: 'Oregon', path: 'M50,100 L130,100 L130,150 L50,150 Z', labelX: 90, labelY: 125 },
  { code: 'CA', name: 'California', path: 'M50,150 L130,150 L130,280 L50,280 Z', labelX: 90, labelY: 215 },

  // Mountain
  { code: 'MT', name: 'Montana', path: 'M130,50 L210,50 L210,100 L130,100 Z', labelX: 170, labelY: 75 },
  { code: 'ID', name: 'Idaho', path: 'M130,100 L180,100 L180,180 L130,180 Z', labelX: 155, labelY: 140 },
  { code: 'WY', name: 'Wyoming', path: 'M180,100 L260,100 L260,150 L180,150 Z', labelX: 220, labelY: 125 },
  { code: 'NV', name: 'Nevada', path: 'M130,180 L180,180 L180,280 L130,280 Z', labelX: 155, labelY: 230 },
  { code: 'UT', name: 'Utah', path: 'M180,150 L230,150 L230,230 L180,230 Z', labelX: 205, labelY: 190 },
  { code: 'CO', name: 'Colorado', path: 'M230,150 L310,150 L310,230 L230,230 Z', labelX: 270, labelY: 190 },
  { code: 'AZ', name: 'Arizona', path: 'M180,230 L260,230 L260,300 L180,300 Z', labelX: 220, labelY: 265 },
  { code: 'NM', name: 'New Mexico', path: 'M260,230 L340,230 L340,320 L260,320 Z', labelX: 300, labelY: 275 },

  // Plains
  { code: 'ND', name: 'North Dakota', path: 'M310,50 L390,50 L390,100 L310,100 Z', labelX: 350, labelY: 75 },
  { code: 'SD', name: 'South Dakota', path: 'M310,100 L390,100 L390,150 L310,150 Z', labelX: 350, labelY: 125 },
  { code: 'NE', name: 'Nebraska', path: 'M310,150 L390,150 L390,200 L310,200 Z', labelX: 350, labelY: 175 },
  { code: 'KS', name: 'Kansas', path: 'M310,200 L390,200 L390,250 L310,250 Z', labelX: 350, labelY: 225 },
  { code: 'OK', name: 'Oklahoma', path: 'M310,250 L430,250 L430,300 L310,300 Z', labelX: 370, labelY: 275 },
  { code: 'TX', name: 'Texas', path: 'M310,300 L430,300 L430,420 L310,420 Z', labelX: 370, labelY: 360 },

  // Midwest
  { code: 'MN', name: 'Minnesota', path: 'M390,50 L470,50 L470,120 L390,120 Z', labelX: 430, labelY: 85 },
  { code: 'IA', name: 'Iowa', path: 'M390,120 L470,120 L470,170 L390,170 Z', labelX: 430, labelY: 145 },
  { code: 'MO', name: 'Missouri', path: 'M390,170 L470,170 L470,240 L390,240 Z', labelX: 430, labelY: 205 },
  { code: 'AR', name: 'Arkansas', path: 'M410,240 L490,240 L490,300 L410,300 Z', labelX: 450, labelY: 270 },
  { code: 'LA', name: 'Louisiana', path: 'M430,340 L520,340 L520,400 L430,400 Z', labelX: 475, labelY: 370 },

  // Great Lakes
  { code: 'WI', name: 'Wisconsin', path: 'M470,50 L540,50 L540,130 L470,130 Z', labelX: 505, labelY: 90 },
  { code: 'IL', name: 'Illinois', path: 'M470,130 L540,130 L540,220 L470,220 Z', labelX: 505, labelY: 175 },
  { code: 'MI', name: 'Michigan', path: 'M540,50 L620,50 L620,150 L540,150 Z', labelX: 580, labelY: 100 },
  { code: 'IN', name: 'Indiana', path: 'M540,150 L600,150 L600,220 L540,220 Z', labelX: 570, labelY: 185 },
  { code: 'OH', name: 'Ohio', path: 'M600,130 L670,130 L670,200 L600,200 Z', labelX: 635, labelY: 165 },

  // Southeast
  { code: 'MS', name: 'Mississippi', path: 'M490,270 L550,270 L550,350 L490,350 Z', labelX: 520, labelY: 310 },
  { code: 'AL', name: 'Alabama', path: 'M550,270 L610,270 L610,360 L550,360 Z', labelX: 580, labelY: 315 },
  { code: 'TN', name: 'Tennessee', path: 'M540,220 L660,220 L660,270 L540,270 Z', labelX: 600, labelY: 245 },
  { code: 'KY', name: 'Kentucky', path: 'M580,200 L680,200 L680,240 L580,240 Z', labelX: 630, labelY: 220 },
  { code: 'GA', name: 'Georgia', path: 'M610,270 L680,270 L680,370 L610,370 Z', labelX: 645, labelY: 320 },
  { code: 'FL', name: 'Florida', path: 'M650,370 L750,370 L750,450 L650,450 Z', labelX: 700, labelY: 410 },
  { code: 'SC', name: 'South Carolina', path: 'M680,290 L740,290 L740,340 L680,340 Z', labelX: 710, labelY: 315 },
  { code: 'NC', name: 'North Carolina', path: 'M670,240 L770,240 L770,290 L670,290 Z', labelX: 720, labelY: 265 },

  // Mid-Atlantic
  { code: 'WV', name: 'West Virginia', path: 'M670,200 L720,200 L720,250 L670,250 Z', labelX: 695, labelY: 225 },
  { code: 'VA', name: 'Virginia', path: 'M720,220 L790,220 L790,270 L720,270 Z', labelX: 755, labelY: 245 },
  { code: 'MD', name: 'Maryland', path: 'M740,190 L790,190 L790,220 L740,220 Z', labelX: 765, labelY: 205 },
  { code: 'DE', name: 'Delaware', path: 'M790,190 L810,190 L810,220 L790,220 Z', labelX: 800, labelY: 205 },
  { code: 'PA', name: 'Pennsylvania', path: 'M710,140 L800,140 L800,190 L710,190 Z', labelX: 755, labelY: 165 },
  { code: 'NJ', name: 'New Jersey', path: 'M800,150 L830,150 L830,200 L800,200 Z', labelX: 815, labelY: 175 },
  { code: 'NY', name: 'New York', path: 'M720,90 L830,90 L830,150 L720,150 Z', labelX: 775, labelY: 120 },

  // New England
  { code: 'VT', name: 'Vermont', path: 'M820,60 L850,60 L850,100 L820,100 Z', labelX: 835, labelY: 80 },
  { code: 'NH', name: 'New Hampshire', path: 'M850,60 L880,60 L880,110 L850,110 Z', labelX: 865, labelY: 85 },
  { code: 'ME', name: 'Maine', path: 'M880,40 L930,40 L930,130 L880,130 Z', labelX: 905, labelY: 85 },
  { code: 'MA', name: 'Massachusetts', path: 'M840,110 L910,110 L910,140 L840,140 Z', labelX: 875, labelY: 125 },
  { code: 'RI', name: 'Rhode Island', path: 'M890,140 L910,140 L910,160 L890,160 Z', labelX: 900, labelY: 150 },
  { code: 'CT', name: 'Connecticut', path: 'M840,140 L890,140 L890,170 L840,170 Z', labelX: 865, labelY: 155 },

  // Alaska & Hawaii (positioned separately)
  { code: 'AK', name: 'Alaska', path: 'M50,450 L150,450 L150,520 L50,520 Z', labelX: 100, labelY: 485 },
  { code: 'HI', name: 'Hawaii', path: 'M200,450 L280,450 L280,520 L200,520 Z', labelX: 240, labelY: 485 },
];

// Helper to get state data
export function getStateData(code: string): StatePathData | undefined {
  return US_STATES_PATHS.find(s => s.code === code);
}

// Get all state codes
export function getAllStateCodes(): string[] {
  return US_STATES_PATHS.map(s => s.code);
}
