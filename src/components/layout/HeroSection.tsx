import type { Messages } from '../../i18n'
import { menuItems } from '../../data/menu'
import { Icon } from '../ui/Icon'

export function HeroSection({ messages }: { messages: Messages }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-kicker"><span /> {messages.heroKicker}</span>
        <h1>{messages.heroTitleStart}<br />{messages.heroTitleEnd} <em>{messages.heroTitleEmphasis}</em></h1>
        <p>{messages.heroDescription}</p>
        <div className="hero-details">
          <span><Icon name="clock" size={16} /> 08:00 – 21:30</span>
          <span className="detail-divider" />
          <span><Icon name="leaf" size={16} /> {messages.freshIngredients}</span>
        </div>
      </div>
      <div className="hero-decoration" aria-hidden="true">
        <img
          className="hero-food-image"
          src={menuItems[0].image}
          alt=""
          fetchPriority="high"
        />
        <span className="hero-stamp">{messages.heroStamp}<br /><b>♡</b></span>
      </div>
    </section>
  )
}
