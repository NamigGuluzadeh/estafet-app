# Estafet Arena

A football quiz app for the [Estafet](https://www.youtube.com/@EstafetTV) YouTube channel. It has five game modes, runs on iOS, Android and the web, and is available in Azerbaijani and English.

## Game modes

| Mode | How it plays |
|---|---|
| **Futbol X-O** | A 3×3 grid with clubs on one side and nations (sometimes a position) on the other. Name a player who fits both to claim a cell; three in a row wins. Play against a bot or with two players on one phone. A player counts for every club they ever played for. |
| **10-luq** | A top-10 list with hidden answers, such as World Cup winners. Guess the missing entries before you lose three lives. |
| **Hədəf** | Pick five players whose career league goals or appearances add up as close as possible to a target. Beat the bot. |
| **Kim daha çox?** | Two players, one question: more goals, more appearances, more caps, or who is older. Keep your streak going. |
| **Draft** | Three daily drafts that are the same for everyone, plus unlimited practice. Each of 11 rounds, pick one of three player cards and place it on a 4-3-3 pitch. Score comes from card tier (talent) plus links between neighbouring players from the same club, nation or league (chemistry). |

## Running it

You need Node.js 20 or newer.

```bash
npm install
npx expo start
```

Then:

- press `w` to open it in a web browser, or
- scan the QR code with the [Expo Go](https://expo.dev/go) app on your phone.

To check the code before committing:

```bash
npx tsc --noEmit
npx expo lint
```

## Player data

Futbol X-O, Hədəf and Kim daha çox? use `src/data/db.json`: about 11,000 players with nationality, position, birth year and full club history, including league appearances and goals where known.

It covers well-known players who played in the Premier League, La Liga, Bundesliga, Serie A or Ligue 1, plus players from the Azerbaijan Premier League and Azerbaijani nationals.

The data comes from [Wikidata](https://www.wikidata.org), which is public domain (CC0). To refresh it, run the following. It takes 15–20 minutes and overwrites `db.json`:

```bash
node scripts/import-wikidata.mjs
```

Known limits of the data:

- Statistics can lag behind for active players.
- "League" figures exclude cups and European matches.
- Some players have no position, or are listed only as GBR rather than England, Scotland, Wales or Northern Ireland.

The Draft mode uses a separate hand-written list of 187 current players in `src/data/players.ts`. Clubs and card tiers in it should be reviewed after each transfer window.

### Adding quiz lists

10-luq lists live in `src/data/lists.ts`; the format is explained at the top of the file. Each list needs its rows, the correct answers and some wrong choices, so the search box doesn't give the answers away.

## Project layout

```
App.tsx                 screen switching and saved progress
src/screens/            one file per screen (Home, XO, ListGame, Target, HigherLower, Draft, Result)
src/components/         pitch, player card, answer search
src/game/               game rules: draft engine, X-O boards and bot, stat questions
src/data/               player database, draft players, quiz lists
src/i18n.ts             all Azerbaijani and English text
scripts/                Wikidata import and balance checks
```

## Not built yet

- Accounts, online matches against real people, and leaderboards. These need a server.
- Modes that need market values or trophies, which Wikidata doesn't provide.
