export type TabKey =
  | 'hn'
  | 'github'
  | 'devto'
  | 'jobs'
  | 'stackoverflow'
  | 'showhn'
  | 'itch'
  | 'quanta'
  | 'infoq'
  | 'xda';

interface TabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hn', label: 'Hacker News' },
  { key: 'github', label: 'GitHub Trending' },
  { key: 'devto', label: 'Dev.to Gamedev' },
  { key: 'jobs', label: 'Who is Hiring' },
  { key: 'stackoverflow', label: 'Stack Overflow' },
  { key: 'showhn', label: 'Show HN' },
  { key: 'itch', label: 'itch.io' },
  { key: 'quanta', label: 'Quanta Magazine' },
  { key: 'infoq', label: 'InfoQ' },
  { key: 'xda', label: 'XDA Developers' },
];

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`tabs__btn${active === tab.key ? ' tabs__btn--active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
