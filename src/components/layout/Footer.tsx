import { Icon } from '../ui/Icon'
import type { Messages } from '../../i18n'

export function Footer({ messages }: { messages: Messages }) {
  return (
    <footer className="site-footer">
      <div className="footer-contact">
        <strong>{messages.footerContact}</strong>
        <a href="https://zalo.me/0357700838" target="_blank" rel="noreferrer">
          {messages.footerZalo}
        </a>
        <address>{messages.footerAddress}</address>
      </div>
      <div className="footer-note">
        <span>{messages.footerCopyright}</span>
        <span><Icon name="leaf" size={14} /> {messages.footerFresh}</span>
      </div>
    </footer>
  )
}
