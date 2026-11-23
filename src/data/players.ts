// Player pool for Estafet Draft.
// EDITORIAL NOTE: clubs and tiers reflect the 2025/26 season as best known when this
// file was written. Review before release and after every transfer window.
// Row format: "Name|POS|clubId|NAT|tier"   (tier 1 = lowest, 5 = highest)

export type Pos = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: number;
  name: string;
  pos: Pos;
  club: string;
  nat: string;
  tier: 1 | 2 | 3 | 4 | 5;
}

export type LeagueId = 'ENG' | 'ESP' | 'GER' | 'ITA' | 'FRA' | 'AZE';

export const LEAGUES: Record<LeagueId, string> = {
  ENG: 'Premier League',
  ESP: 'La Liga',
  GER: 'Bundesliga',
  ITA: 'Serie A',
  FRA: 'Ligue 1',
  AZE: 'Premyer Liqa',
};

// league: null means the club gives no league chemistry.
export const CLUBS: Record<string, { name: string; short: string; league: LeagueId | null }> = {
  rma: { name: 'Real Madrid', short: 'RMA', league: 'ESP' },
  bar: { name: 'Barcelona', short: 'BAR', league: 'ESP' },
  atm: { name: 'Atlético Madrid', short: 'ATM', league: 'ESP' },
  mci: { name: 'Manchester City', short: 'MCI', league: 'ENG' },
  ars: { name: 'Arsenal', short: 'ARS', league: 'ENG' },
  liv: { name: 'Liverpool', short: 'LIV', league: 'ENG' },
  che: { name: 'Chelsea', short: 'CHE', league: 'ENG' },
  mun: { name: 'Manchester United', short: 'MUN', league: 'ENG' },
  tot: { name: 'Tottenham', short: 'TOT', league: 'ENG' },
  new: { name: 'Newcastle', short: 'NEW', league: 'ENG' },
  avl: { name: 'Aston Villa', short: 'AVL', league: 'ENG' },
  bay: { name: 'Bayern', short: 'BAY', league: 'GER' },
  bvb: { name: 'Dortmund', short: 'BVB', league: 'GER' },
  lev: { name: 'Leverkusen', short: 'B04', league: 'GER' },
  int: { name: 'Inter', short: 'INT', league: 'ITA' },
  mil: { name: 'Milan', short: 'MIL', league: 'ITA' },
  juv: { name: 'Juventus', short: 'JUV', league: 'ITA' },
  nap: { name: 'Napoli', short: 'NAP', league: 'ITA' },
  psg: { name: 'PSG', short: 'PSG', league: 'FRA' },
  qar: { name: 'Qarabağ', short: 'QAR', league: 'AZE' },
  nef: { name: 'Neftçi', short: 'NEF', league: 'AZE' },
  mia: { name: 'Inter Miami', short: 'MIA', league: null },
  nas: { name: 'Al Nassr', short: 'NAS', league: null },
  lafc: { name: 'LAFC', short: 'LAFC', league: null },
  fck: { name: 'Kaiserslautern', short: 'FCK', league: null },
};

export const FLAGS: Record<string, string> = {
  ARG: '🇦🇷', AUT: '🇦🇹', AZE: '🇦🇿', BEL: '🇧🇪', BFA: '🇧🇫', BRA: '🇧🇷', CAN: '🇨🇦', CMR: '🇨🇲',
  COL: '🇨🇴', CPV: '🇨🇻', CRO: '🇭🇷', CZE: '🇨🇿', DEN: '🇩🇰', ECU: '🇪🇨', EGY: '🇪🇬', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  ESP: '🇪🇸', FRA: '🇫🇷', GEO: '🇬🇪', GER: '🇩🇪', GHA: '🇬🇭', GUI: '🇬🇳', HUN: '🇭🇺', ITA: '🇮🇹',
  KOR: '🇰🇷', MAR: '🇲🇦', MNE: '🇲🇪', NED: '🇳🇱', NOR: '🇳🇴', POL: '🇵🇱', POR: '🇵🇹', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  SRB: '🇷🇸', SUI: '🇨🇭', SVK: '🇸🇰', SVN: '🇸🇮', SWE: '🇸🇪', TUR: '🇹🇷', UKR: '🇺🇦', URU: '🇺🇾',
  USA: '🇺🇸',
};

const RAW = `
Courtois|GK|rma|BEL|5
Carvajal|DEF|rma|ESP|3
Militão|DEF|rma|BRA|4
Rüdiger|DEF|rma|GER|4
Alexander-Arnold|DEF|rma|ENG|4
Huijsen|DEF|rma|ESP|3
Valverde|MID|rma|URU|5
Bellingham|MID|rma|ENG|5
Tchouaméni|MID|rma|FRA|4
Camavinga|MID|rma|FRA|3
Güler|MID|rma|TUR|3
Vinícius Jr|FWD|rma|BRA|5
Mbappé|FWD|rma|FRA|5
Rodrygo|FWD|rma|BRA|4
Joan García|GK|bar|ESP|3
Koundé|DEF|bar|FRA|4
Cubarsí|DEF|bar|ESP|3
Araújo|DEF|bar|URU|3
Balde|DEF|bar|ESP|3
Pedri|MID|bar|ESP|5
De Jong|MID|bar|NED|4
Gavi|MID|bar|ESP|3
Olmo|MID|bar|ESP|3
Yamal|FWD|bar|ESP|5
Raphinha|FWD|bar|BRA|5
Lewandowski|FWD|bar|POL|4
Oblak|GK|atm|SVN|4
Giménez|DEF|atm|URU|3
M. Llorente|MID|atm|ESP|3
Koke|MID|atm|ESP|2
Griezmann|FWD|atm|FRA|4
J. Álvarez|FWD|atm|ARG|4
Donnarumma|GK|mci|ITA|5
Rúben Dias|DEF|mci|POR|4
Gvardiol|DEF|mci|CRO|4
Stones|DEF|mci|ENG|3
Rodri|MID|mci|ESP|5
Bernardo Silva|MID|mci|POR|4
Foden|MID|mci|ENG|4
Reijnders|MID|mci|NED|3
Haaland|FWD|mci|NOR|5
Marmoush|FWD|mci|EGY|3
Doku|FWD|mci|BEL|3
Raya|GK|ars|ESP|4
Saliba|DEF|ars|FRA|5
Gabriel|DEF|ars|BRA|4
Timber|DEF|ars|NED|3
Rice|MID|ars|ENG|5
Ødegaard|MID|ars|NOR|4
Zubimendi|MID|ars|ESP|3
Eze|MID|ars|ENG|3
Saka|FWD|ars|ENG|5
Gyökeres|FWD|ars|SWE|4
Martinelli|FWD|ars|BRA|3
Alisson|GK|liv|BRA|5
Van Dijk|DEF|liv|NED|5
Konaté|DEF|liv|FRA|3
Robertson|DEF|liv|SCO|3
Frimpong|DEF|liv|NED|3
Mac Allister|MID|liv|ARG|4
Szoboszlai|MID|liv|HUN|4
Gravenberch|MID|liv|NED|4
Wirtz|MID|liv|GER|4
Salah|FWD|liv|EGY|5
Isak|FWD|liv|SWE|4
Ekitike|FWD|liv|FRA|3
Gakpo|FWD|liv|NED|3
R. Sánchez|GK|che|ESP|2
Reece James|DEF|che|ENG|3
Cucurella|DEF|che|ESP|3
Colwill|DEF|che|ENG|2
Caicedo|MID|che|ECU|4
Enzo Fernández|MID|che|ARG|4
Palmer|MID|che|ENG|5
João Pedro|FWD|che|BRA|3
Pedro Neto|FWD|che|POR|2
Lammens|GK|mun|BEL|2
De Ligt|DEF|mun|NED|3
Lisandro|DEF|mun|ARG|3
Dalot|DEF|mun|POR|2
Bruno Fernandes|MID|mun|POR|4
Mainoo|MID|mun|ENG|2
Mbeumo|FWD|mun|CMR|3
Cunha|FWD|mun|BRA|3
Šeško|FWD|mun|SVN|2
Vicario|GK|tot|ITA|3
Romero|DEF|tot|ARG|4
Van de Ven|DEF|tot|NED|3
Porro|DEF|tot|ESP|3
Maddison|MID|tot|ENG|3
Xavi Simons|MID|tot|NED|3
Kudus|FWD|tot|GHA|3
Richarlison|FWD|tot|BRA|2
Pope|GK|new|ENG|2
Trippier|DEF|new|ENG|2
Botman|DEF|new|NED|2
Guimarães|MID|new|BRA|4
Tonali|MID|new|ITA|4
Gordon|FWD|new|ENG|3
Woltemade|FWD|new|GER|2
E. Martínez|GK|avl|ARG|4
Neuer|GK|bay|GER|4
Upamecano|DEF|bay|FRA|3
Kim Min-jae|DEF|bay|KOR|3
Davies|DEF|bay|CAN|4
Tah|DEF|bay|GER|3
Kimmich|MID|bay|GER|5
Musiala|MID|bay|GER|5
Goretzka|MID|bay|GER|3
Kane|FWD|bay|ENG|5
Olise|FWD|bay|FRA|4
Luis Díaz|FWD|bay|COL|4
Gnabry|FWD|bay|GER|3
Kobel|GK|bvb|SUI|3
Schlotterbeck|DEF|bvb|GER|3
Süle|DEF|bvb|GER|2
Brandt|MID|bvb|GER|3
Sabitzer|MID|bvb|AUT|2
Guirassy|FWD|bvb|GUI|4
Adeyemi|FWD|bvb|GER|3
Flekken|GK|lev|NED|2
Grimaldo|DEF|lev|ESP|3
Tapsoba|DEF|lev|BFA|2
Andrich|MID|lev|GER|2
Schick|FWD|lev|CZE|3
Sommer|GK|int|SUI|3
Bastoni|DEF|int|ITA|4
Dimarco|DEF|int|ITA|4
Dumfries|DEF|int|NED|3
Barella|MID|int|ITA|4
Çalhanoğlu|MID|int|TUR|4
Lautaro|FWD|int|ARG|5
Thuram|FWD|int|FRA|4
Maignan|GK|mil|FRA|4
Tomori|DEF|mil|ENG|2
Modrić|MID|mil|CRO|4
Rabiot|MID|mil|FRA|3
Leão|FWD|mil|POR|4
Pulisic|FWD|mil|USA|3
Di Gregorio|GK|juv|ITA|2
Bremer|DEF|juv|BRA|3
Cambiaso|DEF|juv|ITA|2
Locatelli|MID|juv|ITA|2
Yıldız|FWD|juv|TUR|3
Vlahović|FWD|juv|SRB|3
Meret|GK|nap|ITA|2
Di Lorenzo|DEF|nap|ITA|3
Buongiorno|DEF|nap|ITA|3
De Bruyne|MID|nap|BEL|4
McTominay|MID|nap|SCO|4
Lobotka|MID|nap|SVK|3
Lukaku|FWD|nap|BEL|3
Højlund|FWD|nap|DEN|2
Chevalier|GK|psg|FRA|3
Hakimi|DEF|psg|MAR|5
Marquinhos|DEF|psg|BRA|4
Nuno Mendes|DEF|psg|POR|5
Pacho|DEF|psg|ECU|3
Vitinha|MID|psg|POR|5
João Neves|MID|psg|POR|4
Fabián Ruiz|MID|psg|ESP|3
Dembélé|FWD|psg|FRA|5
Kvaratskhelia|FWD|psg|GEO|4
Doué|FWD|psg|FRA|4
Barcola|FWD|psg|FRA|3
Messi|FWD|mia|ARG|5
Ronaldo|FWD|nas|POR|4
Son|FWD|lafc|KOR|3
Kochalski|GK|qar|POL|2
Məhəmmədəliyev|GK|qar|AZE|1
Mustafazadə|DEF|qar|AZE|2
Cəfərquliyev|DEF|qar|AZE|2
Hüseynov|DEF|qar|AZE|1
Medina|DEF|qar|COL|2
Matheus Silva|DEF|qar|BRA|2
Bayramov|MID|qar|AZE|2
Yankoviç|MID|qar|MNE|2
Bicalho|MID|qar|BRA|2
Kady|MID|qar|BRA|2
Zubir|FWD|qar|FRA|2
Leandro Andrade|FWD|qar|CPV|2
Axundzadə|FWD|qar|AZE|2
Duran|FWD|qar|COL|2
Addai|FWD|qar|GHA|1
Kaşçuk|FWD|qar|UKR|1
Mahmudov|MID|nef|AZE|1
Emreli|FWD|fck|AZE|1
`;

export const PLAYERS: Player[] = RAW.trim()
  .split('\n')
  .map((row, i) => {
    const [name, pos, club, nat, tier] = row.split('|');
    return { id: i, name, pos: pos as Pos, club, nat, tier: Number(tier) as Player['tier'] };
  });
