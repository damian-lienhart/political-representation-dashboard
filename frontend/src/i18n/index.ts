import { createI18n } from 'vue-i18n'
import de from './de.json'
import fr from './fr.json'
import it from './it.json'
import en from './en.json'

const messages = {
    de,
    fr,
    it,
    en
}

const i18n = createI18n({
    legacy: false,
    locale: 'de', // set default locale
    fallbackLocale: 'de', // set fallback locale
    messages
})

export default i18n
