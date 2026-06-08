import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Globe2,
  Home,
  LoaderCircle,
  MoreHorizontal,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  X
} from 'lucide-react'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  type BrowserSettings,
  type BrowserSnapshot,
  type InternalPage,
  type TabState
} from '../../shared/types'

const EMPTY_SNAPSHOT: BrowserSnapshot = {
  tabs: [],
  activeTabId: null,
  bookmarks: [],
  history: [],
  downloads: [],
  settings: DEFAULT_SETTINGS
}

const internalPages: Record<string, InternalPage> = {
  'liquea://settings': 'settings',
  'liquea://history': 'history',
  'liquea://bookmarks': 'bookmarks',
  'liquea://downloads': 'downloads',
  'liquea://newtab': 'newtab'
}

export function App(): React.JSX.Element {
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT)
  const [address, setAddress] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const addressRef = useRef<HTMLInputElement>(null)
  const activeTab = snapshot.tabs.find((tab) => tab.id === snapshot.activeTabId)
  const isSidebar = snapshot.settings.tabLayout === 'sidebar'

  useEffect(() => {
    void window.liquea.getSnapshot().then(setSnapshot)
    return window.liquea.onSnapshot(setSnapshot)
  }, [])

  useEffect(() => {
    // Navigation is external state; mirror it unless the tab is an internal page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAddress(activeTab?.url.startsWith('liquea://') ? '' : (activeTab?.url ?? ''))
  }, [activeTab?.id, activeTab?.url])

  useEffect(() => {
    const offFind = window.liquea.onFind(() => addressRef.current?.select())
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'l') {
        event.preventDefault()
        addressRef.current?.select()
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'b') {
        event.preventDefault()
        if (activeTab) void window.liquea.toggleBookmark(activeTab.id)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      offFind()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeTab])

  useEffect(() => {
    document.documentElement.dataset.theme = snapshot.settings.themeMode
    document.documentElement.style.setProperty('--accent', snapshot.settings.accentColor)
  }, [snapshot.settings])

  const navigate = (event: FormEvent): void => {
    event.preventDefault()
    if (activeTab) void window.liquea.navigate(activeTab.id, address)
    addressRef.current?.blur()
  }

  const isBookmarked = Boolean(
    activeTab && snapshot.bookmarks.some((bookmark) => bookmark.url === activeTab.url)
  )

  return (
    <main className={`app-shell ${isSidebar ? 'sidebar-layout' : 'topbar-layout'}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      {isSidebar ? (
        <SidebarTabs snapshot={snapshot} />
      ) : (
        <TopTabs snapshot={snapshot} />
      )}

      <header className="navigation glass-panel">
        <div className="nav-controls">
          <IconButton
            label="Back"
            disabled={!activeTab?.canGoBack}
            onClick={() => activeTab && void window.liquea.goBack(activeTab.id)}
          >
            <ArrowLeft />
          </IconButton>
          <IconButton
            label="Forward"
            disabled={!activeTab?.canGoForward}
            onClick={() => activeTab && void window.liquea.goForward(activeTab.id)}
          >
            <ArrowRight />
          </IconButton>
          <IconButton
            label={activeTab?.loading ? 'Stop loading' : 'Refresh'}
            onClick={() =>
              activeTab &&
              void (activeTab.loading
                ? window.liquea.stop(activeTab.id)
                : window.liquea.reload(activeTab.id))
            }
          >
            {activeTab?.loading ? <X /> : <RefreshCw />}
          </IconButton>
          <IconButton
            label="Home"
            onClick={() => activeTab && void window.liquea.goHome(activeTab.id)}
          >
            <Home />
          </IconButton>
        </div>

        <form className="address-bar" onSubmit={navigate}>
          <div className="address-status">
            {activeTab?.loading ? <LoaderCircle className="spin" /> : <ShieldCheck />}
          </div>
          <input
            ref={addressRef}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            placeholder="Search Google or enter an address"
            aria-label="Address and search bar"
            spellCheck={false}
          />
          <button
            type="button"
            className={`address-action ${isBookmarked ? 'active' : ''}`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            onClick={() => activeTab && void window.liquea.toggleBookmark(activeTab.id)}
          >
            <Star fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </form>

        <div className="nav-actions">
          <IconButton label="Downloads" onClick={() => void window.liquea.openInternalPage('downloads')}>
            <Download />
          </IconButton>
          <div className="menu-anchor">
            <IconButton label="Liquea menu" onClick={() => setMenuOpen((open) => !open)}>
              <MoreHorizontal />
            </IconButton>
            {menuOpen && <BrowserMenu close={() => setMenuOpen(false)} />}
          </div>
        </div>
      </header>

      <section className="content-frame">
        {activeTab && internalPages[activeTab.url] && (
          <InternalPage page={internalPages[activeTab.url]} snapshot={snapshot} activeTab={activeTab} />
        )}
        {activeTab?.crashed && <ErrorPage tab={activeTab} />}
      </section>
    </main>
  )
}

function TopTabs({ snapshot }: { snapshot: BrowserSnapshot }): React.JSX.Element {
  return (
    <div className={`top-tabs ${snapshot.settings.tabStyle}`}>
      <div className="brand-mark" aria-label="Liquea">
        <span>L</span>
      </div>
      <div className="tab-strip">
        {snapshot.tabs.map((tab) => (
          <Tab key={tab.id} tab={tab} active={tab.id === snapshot.activeTabId} />
        ))}
      </div>
      <IconButton label="New tab" onClick={() => void window.liquea.createTab()}>
        <Plus />
      </IconButton>
    </div>
  )
}

function SidebarTabs({ snapshot }: { snapshot: BrowserSnapshot }): React.JSX.Element {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-brand">
        <div className="brand-mark"><span>L</span></div>
        <strong>Liquea</strong>
        <IconButton label="New tab" onClick={() => void window.liquea.createTab()}>
          <Plus />
        </IconButton>
      </div>
      <div className="sidebar-tabs">
        {snapshot.tabs.map((tab) => (
          <Tab key={tab.id} tab={tab} active={tab.id === snapshot.activeTabId} />
        ))}
      </div>
      <div className="sidebar-quick">
        <button onClick={() => void window.liquea.openInternalPage('bookmarks')}>
          <Star /> Bookmarks
        </button>
        <button onClick={() => void window.liquea.openInternalPage('history')}>
          <Clock3 /> History
        </button>
        <button onClick={() => void window.liquea.openInternalPage('settings')}>
          <Settings /> Settings
        </button>
      </div>
    </aside>
  )
}

function Tab({ tab, active }: { tab: TabState; active: boolean }): React.JSX.Element {
  return (
    <div
      className={`tab ${active ? 'active' : ''}`}
      onClick={() => void window.liquea.activateTab(tab.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === 'Enter' && void window.liquea.activateTab(tab.id)}
    >
      <span className="tab-favicon">
        {tab.loading ? (
          <LoaderCircle className="spin" />
        ) : tab.favicon ? (
          <img src={tab.favicon} alt="" />
        ) : (
          <Sparkles />
        )}
      </span>
      <span className="tab-title">{tab.title}</span>
      <button
        className="tab-close"
        aria-label={`Close ${tab.title}`}
        onClick={(event) => {
          event.stopPropagation()
          void window.liquea.closeTab(tab.id)
        }}
      >
        <X />
      </button>
    </div>
  )
}

function BrowserMenu({ close }: { close: () => void }): React.JSX.Element {
  const items: Array<[InternalPage, React.ReactNode, string]> = [
    ['newtab', <Plus key="new" />, 'New tab'],
    ['bookmarks', <BookOpen key="bookmarks" />, 'Bookmarks'],
    ['history', <Clock3 key="history" />, 'History'],
    ['downloads', <Download key="downloads" />, 'Downloads'],
    ['settings', <Settings key="settings" />, 'Settings']
  ]
  return (
    <div className="browser-menu glass-panel">
      <div className="menu-heading">Liquea</div>
      {items.map(([page, icon, label]) => (
        <button
          key={page}
          onClick={() => {
            void (page === 'newtab'
              ? window.liquea.createTab()
              : window.liquea.openInternalPage(page))
            close()
          }}
        >
          {icon}
          <span>{label}</span>
          <ChevronRight />
        </button>
      ))}
    </div>
  )
}

function InternalPage({
  page,
  snapshot,
  activeTab
}: {
  page: InternalPage
  snapshot: BrowserSnapshot
  activeTab: TabState
}): React.JSX.Element {
  if (page === 'newtab') return <NewTab snapshot={snapshot} activeTab={activeTab} />
  if (page === 'settings') return <SettingsPage settings={snapshot.settings} />
  if (page === 'bookmarks') return <BookmarksPage snapshot={snapshot} activeTab={activeTab} />
  if (page === 'history') return <HistoryPage snapshot={snapshot} activeTab={activeTab} />
  return <DownloadsPage snapshot={snapshot} />
}

function NewTab({
  snapshot,
  activeTab
}: {
  snapshot: BrowserSnapshot
  activeTab: TabState
}): React.JSX.Element {
  const [query, setQuery] = useState('')
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  }, [])
  const navigate = (event: FormEvent): void => {
    event.preventDefault()
    void window.liquea.navigate(activeTab.id, query)
  }
  return (
    <div className={`internal-page new-tab background-${snapshot.settings.newTabBackground}`}>
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="new-tab-content">
        <div className="new-tab-logo"><span>L</span></div>
        <p className="eyebrow">{greeting}</p>
        <h1>Where will curiosity take you?</h1>
        <form className="new-tab-search glass-panel" onSubmit={navigate}>
          <Search />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the web"
          />
          <span>Google</span>
        </form>
        <div className="quick-links">
          {snapshot.bookmarks.slice(0, 6).map((bookmark) => (
            <button
              key={bookmark.id}
              className="quick-link glass-panel"
              onClick={() => void window.liquea.navigate(activeTab.id, bookmark.url)}
            >
              <Globe2 />
              <span>{bookmark.title}</span>
            </button>
          ))}
          <button
            className="quick-link glass-panel"
            onClick={() => void window.liquea.openInternalPage('bookmarks')}
          >
            <Plus />
            <span>{snapshot.bookmarks.length ? 'All bookmarks' : 'Add a bookmark'}</span>
          </button>
        </div>
        <p className="privacy-note"><ShieldCheck /> Protected by Liquea privacy controls</p>
      </div>
    </div>
  )
}

function SettingsPage({ settings }: { settings: BrowserSettings }): React.JSX.Element {
  const update = (patch: Partial<BrowserSettings>): void => {
    void window.liquea.updateSettings(patch)
  }
  return (
    <PageScaffold icon={<Settings />} eyebrow="Personalize" title="Settings">
      <SettingsSection icon={<Palette />} title="Appearance" description="Shape Liquea around you.">
        <Segmented
          value={settings.themeMode}
          options={['light', 'dark', 'system']}
          onChange={(value) => update({ themeMode: value as BrowserSettings['themeMode'] })}
        />
        <SettingRow label="Accent colour">
          <div className="color-options">
            {['#d8aa58', '#8f7cff', '#49c6b7', '#e66d8c', '#5f98ff'].map((color) => (
              <button
                key={color}
                aria-label={`Use ${color} accent`}
                className={settings.accentColor === color ? 'selected' : ''}
                style={{ background: color }}
                onClick={() => update({ accentColor: color })}
              >
                {settings.accentColor === color && <Check />}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Tab layout">
          <Segmented
            value={settings.tabLayout}
            options={['topbar', 'sidebar']}
            onChange={(value) => update({ tabLayout: value as BrowserSettings['tabLayout'] })}
          />
        </SettingRow>
        <SettingRow label="Tab density">
          <Segmented
            value={settings.tabStyle}
            options={['compact', 'comfortable']}
            onChange={(value) => update({ tabStyle: value as BrowserSettings['tabStyle'] })}
          />
        </SettingRow>
        <SettingRow label="New tab atmosphere">
          <select
            value={settings.newTabBackground}
            onChange={(event) => update({ newTabBackground: event.target.value })}
          >
            <option value="aurora">Golden aurora</option>
            <option value="midnight">Midnight bloom</option>
            <option value="mist">Silver mist</option>
          </select>
        </SettingRow>
      </SettingsSection>

      <SettingsSection icon={<Globe2 />} title="Search & startup" description="Choose how journeys begin.">
        <SettingRow label="Search engine">
          <select
            value={settings.searchEngine}
            onChange={(event) =>
              update({ searchEngine: event.target.value as BrowserSettings['searchEngine'] })
            }
          >
            <option value="google">Google</option>
            <option value="duckduckgo">DuckDuckGo</option>
            <option value="bing">Bing</option>
            <option value="brave">Brave Search</option>
          </select>
        </SettingRow>
        <SettingRow label="Homepage">
          <input
            className="setting-input"
            defaultValue={settings.homepage}
            onBlur={(event) => update({ homepage: event.target.value })}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection icon={<ShieldCheck />} title="Privacy" description="Simple controls, clear intent.">
        <Toggle
          label="Send Do Not Track"
          checked={settings.sendDoNotTrack}
          onChange={(checked) => update({ sendDoNotTrack: checked })}
        />
        <Toggle
          label="Block third-party cookies"
          checked={settings.blockThirdPartyCookies}
          onChange={(checked) => update({ blockThirdPartyCookies: checked })}
        />
        <Toggle
          label="Block pop-up windows"
          checked={settings.blockPopups}
          onChange={(checked) => update({ blockPopups: checked })}
        />
        <button
          className="danger-button"
          onClick={() =>
            void window.liquea.clearBrowsingData({
              history: true,
              cache: true,
              cookies: true,
              downloads: false
            })
          }
        >
          <Trash2 /> Clear browsing data
        </button>
      </SettingsSection>
    </PageScaffold>
  )
}

function BookmarksPage({
  snapshot,
  activeTab
}: {
  snapshot: BrowserSnapshot
  activeTab: TabState
}): React.JSX.Element {
  return (
    <PageScaffold icon={<Star />} eyebrow="Saved places" title="Bookmarks">
      <ItemList
        empty="Pages you bookmark will appear here."
        items={snapshot.bookmarks.map((bookmark) => ({
          id: bookmark.id,
          title: bookmark.title,
          subtitle: bookmark.url,
          icon: <Star />,
          action: () => void window.liquea.navigate(activeTab.id, bookmark.url),
          secondary: () => void window.liquea.removeBookmark(bookmark.id)
        }))}
      />
    </PageScaffold>
  )
}

function HistoryPage({
  snapshot,
  activeTab
}: {
  snapshot: BrowserSnapshot
  activeTab: TabState
}): React.JSX.Element {
  return (
    <PageScaffold icon={<Clock3 />} eyebrow="Recent journeys" title="History">
      <ItemList
        empty="Your browsing history is clear."
        items={snapshot.history.map((entry) => ({
          id: entry.id,
          title: entry.title,
          subtitle: `${new Date(entry.visitedAt).toLocaleString()} · ${entry.url}`,
          icon: <Clock3 />,
          action: () => void window.liquea.navigate(activeTab.id, entry.url)
        }))}
      />
    </PageScaffold>
  )
}

function DownloadsPage({ snapshot }: { snapshot: BrowserSnapshot }): React.JSX.Element {
  return (
    <PageScaffold icon={<Download />} eyebrow="Files" title="Downloads">
      <ItemList
        empty="Downloads will appear here."
        items={snapshot.downloads.map((download) => ({
          id: download.id,
          title: download.filename,
          subtitle:
            download.state === 'progressing'
              ? `${Math.round((download.receivedBytes / Math.max(download.totalBytes, 1)) * 100)}%`
              : download.state,
          icon: <Download />,
          action: () => void window.liquea.showDownload(download.id)
        }))}
      />
    </PageScaffold>
  )
}

function ErrorPage({ tab }: { tab: TabState }): React.JSX.Element {
  return (
    <div className="internal-page error-page">
      <div className="error-card glass-panel">
        <div className="page-icon"><Globe2 /></div>
        <p className="eyebrow">Connection interrupted</p>
        <h1>This page took a wrong turn.</h1>
        <p>Liquea could not load {tab.url}. Check your connection or try again.</p>
        <button className="primary-button" onClick={() => void window.liquea.reload(tab.id)}>
          <RefreshCw /> Try again
        </button>
      </div>
    </div>
  )
}

function PageScaffold({
  icon,
  eyebrow,
  title,
  children
}: {
  icon: React.ReactNode
  eyebrow: string
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="internal-page utility-page">
      <div className="utility-content">
        <header className="page-header">
          <div className="page-icon">{icon}</div>
          <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
        </header>
        {children}
      </div>
    </div>
  )
}

function SettingsSection({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <section className="settings-section glass-panel">
      <header><div className="section-icon">{icon}</div><div><h2>{title}</h2><p>{description}</p></div></header>
      <div className="settings-body">{children}</div>
    </section>
  )
}

function SettingRow({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return <div className="setting-row"><span>{label}</span>{children}</div>
}

function Segmented({
  value,
  options,
  onChange
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
}): React.JSX.Element {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button key={option} className={value === option ? 'active' : ''} onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}): React.JSX.Element {
  return (
    <label className="setting-row toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle-track"><span /></span>
    </label>
  )
}

function ItemList({
  empty,
  items
}: {
  empty: string
  items: Array<{
    id: string
    title: string
    subtitle: string
    icon: React.ReactNode
    action: () => void
    secondary?: () => void
  }>
}): React.JSX.Element {
  if (!items.length) return <div className="empty-state glass-panel"><Sparkles /><p>{empty}</p></div>
  return (
    <div className="item-list glass-panel">
      {items.map((item) => (
        <div className="list-item" key={item.id}>
          <button className="list-main" onClick={item.action}>
            <span className="list-icon">{item.icon}</span>
            <span><strong>{item.title}</strong><small>{item.subtitle}</small></span>
          </button>
          {item.secondary && (
            <IconButton label={`Remove ${item.title}`} onClick={item.secondary}><Trash2 /></IconButton>
          )}
          {!item.secondary && <ExternalLink className="list-trailing" />}
        </div>
      ))}
    </div>
  )
}

function IconButton({
  label,
  children,
  disabled,
  onClick
}: {
  label: string
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}): React.JSX.Element {
  return (
    <button className="icon-button" aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
