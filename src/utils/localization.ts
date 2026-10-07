import type { MenuItem } from '../types/menu'
import { productTranslations, type Language } from '../i18n'

export function localizeMenuItem(item: MenuItem, language: Language): MenuItem {
  if (language === 'vi') return item

  const translation = productTranslations[language][item.id]
  if (!translation) return item

  return {
    ...item,
    name: translation.name,
    description: translation.description,
    tags: translation.tags ? [...translation.tags] : item.tags,
    sizes: item.sizes?.map((size) => ({
      ...size,
      name: translation.sizes[size.id] ?? size.name,
    })),
    details: item.details
      ? {
          ...item.details,
          ingredients: [...translation.ingredients],
          preparationTime: translation.preparationTime,
          serving: translation.serving,
          note: translation.note,
        }
      : undefined,
  }
}
