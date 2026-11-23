// Quiz lists for the "10-luq" mode.
// To add a list: add an entry below. `rows` are shown in order; each row's `answer`
// is a key of `options`. `options` must also hold some wrong choices (decoys) so the
// search box does not give the answers away. One guess reveals every row with that answer.

export interface Label {
  az: string;
  en: string;
}

export interface QuizList {
  id: string;
  title: Label;
  rows: { label: string; answer: string }[];
  options: Record<string, Label>;
}

const same = (...names: string[]): Record<string, Label> =>
  Object.fromEntries(names.map((n) => [n, { az: n, en: n }]));

const COUNTRIES: Record<string, Label> = {
  ARG: { az: 'Argentina', en: 'Argentina' },
  GER: { az: 'Almaniya', en: 'Germany' },
  BRA: { az: 'Braziliya', en: 'Brazil' },
  FRA: { az: 'Fransa', en: 'France' },
  ITA: { az: 'İtaliya', en: 'Italy' },
  ESP: { az: 'İspaniya', en: 'Spain' },
  NED: { az: 'Niderland', en: 'Netherlands' },
  DEN: { az: 'Danimarka', en: 'Denmark' },
  GRE: { az: 'Yunanıstan', en: 'Greece' },
  POR: { az: 'Portuqaliya', en: 'Portugal' },
  ENG: { az: 'İngiltərə', en: 'England' },
  CRO: { az: 'Xorvatiya', en: 'Croatia' },
  BEL: { az: 'Belçika', en: 'Belgium' },
  URU: { az: 'Uruqvay', en: 'Uruguay' },
  CZE: { az: 'Çexiya', en: 'Czechia' },
  TUR: { az: 'Türkiyə', en: 'Türkiye' },
  SWE: { az: 'İsveç', en: 'Sweden' },
  RUS: { az: 'Rusiya', en: 'Russia' },
};

const CLUBS = same(
  'Real Madrid', 'Liverpool', 'Bayern', 'Chelsea', 'Manchester City', 'PSG',
  'Barcelona', 'Juventus', 'Atlético Madrid', 'Inter', 'Tottenham', 'Dortmund',
  'Manchester United', 'Arsenal', 'Milan',
);

export const LISTS: QuizList[] = [
  {
    id: 'ballon-dor',
    title: { az: '“Qızıl top” qalibləri (2015–2025)', en: "Ballon d'Or winners (2015–2025)" },
    rows: [
      { label: '2015', answer: 'Messi' },
      { label: '2016', answer: 'Ronaldo' },
      { label: '2017', answer: 'Ronaldo' },
      { label: '2018', answer: 'Modrić' },
      { label: '2019', answer: 'Messi' },
      { label: '2021', answer: 'Messi' },
      { label: '2022', answer: 'Benzema' },
      { label: '2023', answer: 'Messi' },
      { label: '2024', answer: 'Rodri' },
      { label: '2025', answer: 'Dembélé' },
    ],
    options: same(
      'Messi', 'Ronaldo', 'Modrić', 'Benzema', 'Rodri', 'Dembélé',
      'Neymar', 'Mbappé', 'Haaland', 'Lewandowski', 'Vinícius Jr', 'Griezmann',
      'Van Dijk', 'Salah', 'De Bruyne', 'Yamal', 'Bellingham', 'Kane',
    ),
  },
  {
    id: 'world-cup',
    title: { az: 'Dünya çempionları (1986–2022)', en: 'World Cup winners (1986–2022)' },
    rows: [
      { label: '1986', answer: 'ARG' },
      { label: '1990', answer: 'GER' },
      { label: '1994', answer: 'BRA' },
      { label: '1998', answer: 'FRA' },
      { label: '2002', answer: 'BRA' },
      { label: '2006', answer: 'ITA' },
      { label: '2010', answer: 'ESP' },
      { label: '2014', answer: 'GER' },
      { label: '2018', answer: 'FRA' },
      { label: '2022', answer: 'ARG' },
    ],
    options: COUNTRIES,
  },
  {
    id: 'euro',
    title: { az: 'Avropa çempionları (1988–2024)', en: 'Euro winners (1988–2024)' },
    rows: [
      { label: '1988', answer: 'NED' },
      { label: '1992', answer: 'DEN' },
      { label: '1996', answer: 'GER' },
      { label: '2000', answer: 'FRA' },
      { label: '2004', answer: 'GRE' },
      { label: '2008', answer: 'ESP' },
      { label: '2012', answer: 'ESP' },
      { label: '2016', answer: 'POR' },
      { label: '2020', answer: 'ITA' },
      { label: '2024', answer: 'ESP' },
    ],
    options: COUNTRIES,
  },
  {
    id: 'ucl',
    title: { az: 'Çempionlar Liqasının qalibləri (2016–2025)', en: 'Champions League winners (2016–2025)' },
    rows: [
      { label: '2016', answer: 'Real Madrid' },
      { label: '2017', answer: 'Real Madrid' },
      { label: '2018', answer: 'Real Madrid' },
      { label: '2019', answer: 'Liverpool' },
      { label: '2020', answer: 'Bayern' },
      { label: '2021', answer: 'Chelsea' },
      { label: '2022', answer: 'Real Madrid' },
      { label: '2023', answer: 'Manchester City' },
      { label: '2024', answer: 'Real Madrid' },
      { label: '2025', answer: 'PSG' },
    ],
    options: CLUBS,
  },
];
