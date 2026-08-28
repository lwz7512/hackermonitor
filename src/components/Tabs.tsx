export type TabKey = 'hn' | 'github';

interface TabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hn', label: 'Hacker News' },
  { key: 'github', label: 'GitHub Trending' },
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
