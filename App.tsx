import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Lineup, Score, dailySeed, todayKey } from './src/game/engine';
import { STRINGS } from './src/i18n';
import { Draft } from './src/screens/Draft';
import { Home } from './src/screens/Home';
import { ListGame } from './src/screens/ListGame';
import { XO } from './src/screens/XO';
import { HigherLower } from './src/screens/HigherLower';
import { Target } from './src/screens/Target';
import { Result } from './src/screens/Result';
import { EMPTY, Save, load, persist, recordDaily } from './src/storage';
import { C } from './src/theme';

type Screen =
  | { name: 'home' }
  | { name: 'xo'; vsBot: boolean }
  | { name: 'list' }
  | { name: 'target' }
  | { name: 'hl' }
  | { name: 'draft'; seed: string; title: string; draftNo: number | null; day: string }
  | { name: 'result'; title: string; draftNo: number | null; lineup: Lineup; score: Score; isBest: boolean };

export default function App() {
  const [save, setSave] = useState<Save | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  useEffect(() => {
    load().then(setSave);
  }, []);

  function update(next: Save) {
    setSave(next);
    persist(next);
  }

  const s = save ?? EMPTY;
  const t = STRINGS[s.lang];
  const day = todayKey();

  function startPractice() {
    setScreen({
      name: 'draft',
      seed: `practice:${Date.now()}`,
      title: t.practice,
      draftNo: null,
      day,
    });
  }

  let body = null;
  if (!save) {
    body = <View />;
  } else if (screen.name === 'home') {
    body = (
      <Home
        t={t}
        save={s}
        day={day}
        onLang={(lang) => update({ ...s, lang })}
        onDaily={(n) =>
          setScreen({ name: 'draft', seed: dailySeed(day, n), title: `${day.slice(8)}.${day.slice(5, 7)} #${n}`, draftNo: n, day })
        }
        onPractice={startPractice}
        onXO={(vsBot) => setScreen({ name: 'xo', vsBot })}
        onList={() => setScreen({ name: 'list' })}
        onTarget={() => setScreen({ name: 'target' })}
        onHL={() => setScreen({ name: 'hl' })}
      />
    );
  } else if (screen.name === 'xo') {
    body = <XO t={t} vsBot={screen.vsBot} onQuit={() => setScreen({ name: 'home' })} />;
  } else if (screen.name === 'list') {
    body = <ListGame t={t} lang={s.lang} onQuit={() => setScreen({ name: 'home' })} />;
  } else if (screen.name === 'target') {
    body = <Target t={t} onQuit={() => setScreen({ name: 'home' })} />;
  } else if (screen.name === 'hl') {
    body = <HigherLower t={t} onQuit={() => setScreen({ name: 'home' })} />;
  } else if (screen.name === 'draft') {
    const d = screen;
    body = (
      <Draft
        key={d.seed}
        t={t}
        seed={d.seed}
        title={d.title}
        onQuit={() => setScreen({ name: 'home' })}
        onDone={(lineup, score) => {
          const isBest = d.draftNo !== null && score.total > s.best;
          if (d.draftNo !== null) update(recordDaily(s, d.day, d.draftNo, score.total));
          setScreen({ name: 'result', title: d.title, draftNo: d.draftNo, lineup, score, isBest });
        }}
      />
    );
  } else {
    body = (
      <Result
        t={t}
        title={screen.title}
        lineup={screen.lineup}
        score={screen.score}
        isBest={screen.isBest}
        practice={screen.draftNo === null}
        onHome={() => setScreen({ name: 'home' })}
        onAgain={startPractice}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar style="light" />
        {body}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
