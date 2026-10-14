import { Icon } from '../ui/Icon'
import type { Messages } from '../../i18n'

export function Footer({ messages }: { messages: Messages }) {
  return (
    <footer className="site-footer">
      <div className="footer-contact">
        <strong>{messages.footerContact}</strong>
        <a href="tel:+84367227112">{messages.footerPhone}</a>
        <a href="tel:+84355598896">{messages.footerPhoneTwo}</a>
        <address>{messages.footerAddress}</address>
        <span>{messages.footerWifi}</span>
      </div>
      <div className="footer-note">
        <span>{messages.footerCopyright}</span>
        <span><Icon name="leaf" size={14} /> {messages.footerFresh}</span>
      </div>
    </footer>
  )
}
