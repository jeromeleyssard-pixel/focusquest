import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

const defaultLng = navigator.language.startsWith('fr')
  ? 'fr'
  : navigator.language.startsWith('es')
    ? 'es'
    : 'en';

i18n.use(initReactI18next).init({
  lng: defaultLng,
  fallbackLng: 'fr',
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    es: { translation: es },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
