import type { RefObject } from 'react'
import { Icon } from '../ui/Icon'
import { formatMessage, type Language, type Messages } from '../../i18n'

const languageOptions = [
  { code: 'vi', flag: 'vi', label: 'Tiếng Việt' },
  { code: 'en', flag: 'en', label: 'English' },
  { code: 'ja', flag: 'ja', label: '日本語' },
] as const

function FlagIcon({ country }: { country: (typeof languageOptions)[number]['flag'] }) {
  return (
    <svg className="flag-icon" viewBox="0 0 30 20" aria-hidden="true">
      {country === 'vi' && (
        <>
          <rect width="30" height="20" fill="#da251d" />
          <path d="m15 3 1.45 4.47h4.7l-3.8 2.76 1.45 4.47L15 11.94l-3.8 2.76 1.45-4.47-3.8-2.76h4.7z" fill="#ff0" />
        </>
      )}
      {country === 'en' && (
        <>
          <rect width="30" height="20" fill="#012169" />
          <path d="m0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4.5" />
          <path d="m0 0 30 20M30 0 0 20" stroke="#c8102e" strokeWidth="1.8" />
          <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="7" />
          <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3.5" />
        </>
      )}
      {country === 'ja' && (
        <>
          <rect width="30" height="20" fill="#fff" />
          <circle cx="15" cy="10" r="6" fill="#bc002d" />
        </>
      )}
    </svg>
  )
}

type HeaderProps = {
  language: Language
  messages: Messages
  isDark: boolean
  cartCount: number
  languageMenuOpen: boolean
  languagePickerRef: RefObject<HTMLDivElement | null>
  onLanguageMenuToggle: () => void
  onLanguageChange: (language: Language) => void
  onThemeToggle: () => void
  onStatisticsOpen: () => void
  onCartOpen: () => void
}

export function Header({
  language,
  messages,
  isDark,
  cartCount,
  languageMenuOpen,
  languagePickerRef,
  onLanguageMenuToggle,
  onLanguageChange,
  onThemeToggle,
  onStatisticsOpen,
  onCartOpen,
}: HeaderProps) {
  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label={messages.homeLabel}>
        <span className="brand-mark"><Icon name="leaf" size={22} /></span>
        <span className="brand-name">
          {language === 'ja' ? 'ベップ' : language === 'en' ? 'bep' : 'bếp'}
          <span>{language === 'ja' ? 'ニャー' : language === 'en' ? 'nha' : 'nhà'}</span>
          <small>{language === 'ja' ? '新鮮で地元の食材' : 'FRESH & LOCAL'}</small>
        </span>
      </a>
      <div className="topbar-actions">
        <div className="open-status"><span className="status-dot" /> {messages.openStatus}</div>
        <button className="statistics-button" type="button" onClick={onStatisticsOpen}>
          {messages.statistics}
        </button>
        <div className="language-picker" ref={languagePickerRef}>
          <button
            className="language-picker-trigger"
            type="button"
            aria-label={`${messages.languageLabel}: ${languageOptions.find((option) => option.code === language)?.label}`}
            aria-expanded={languageMenuOpen}
            aria-controls="language-menu"
            onClick={onLanguageMenuToggle}
          >
            <FlagIcon country={language} />
          </button>
          {languageMenuOpen && (
            <div className="language-menu" id="language-menu" role="group" aria-label={messages.languageLabel}>
              {languageOptions.map((option) => (
                <button
                  className="language-menu-option"
                  type="button"
                  aria-pressed={language === option.code}
                  key={option.code}
                  onClick={() => onLanguageChange(option.code)}
                >
                  <FlagIcon country={option.flag} />
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className="icon-button theme-toggle"
          type="button"
          aria-label={isDark ? messages.switchToLight : messages.switchToDark}
          onClick={onThemeToggle}
        >
          <Icon name={isDark ? 'sun' : 'moon'} />
        </button>
        <button
          className="mobile-cart-button"
          type="button"
          aria-label={formatMessage(messages.openCart, { count: cartCount })}
          onClick={onCartOpen}
        >
          <Icon name="cart" size={19} />
          {cartCount > 0 && <span>{cartCount}</span>}
        </button>
      </div>
    </header>
  )
}
