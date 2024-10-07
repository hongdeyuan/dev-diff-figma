import i18next, { i18n, i18n as I18n, InitOptions as I18nInitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const isProduction = process.env.NODE_ENV === 'production';

const DEFAULT_I18N_OPTIONS = {
  debug: false,
  fallbackLng: 'en',
  supportedLngs: ['zh', 'en'],
  saveMissing: !isProduction,
  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    useRawValueToEscape: false,
    prefix: '{',
    suffix: '}',
  },
  returnObjects: false,
  react: {
    defaultTransParent: 'div', // a valid react element - required before react 16
    // https://react.i18next.com/latest/trans-component#trans-props
    transEmptyNodeValue: '', // what to return for empty Trans
    transSupportBasicHtmlNodes: true, // allow <br/> and simple html elements in translations
    transKeepBasicHtmlNodesFor: ['span', 'a', 'Button', 'Link'], // don't convert to <1></1> if simple react elements
    // Wrap text nodes in a user-specified element.
    // i.e. set it to 'span'. By default, text nodes are not wrapped.
    // Can be used to work around a well-known Google Translate issue with React apps. See: https://github.com/facebook/react/issues/11538
    // (v11.10.0)
    transWrapTextNodes: '',
  },
  contextSeparator: '_::_', // char to split context from key.
  detection: {
    order: ['localStorage'],
    lookupLocalStorage: 'lang',
  },
};

const i18nService = {
  registeredInstances: new Map<string, i18n>(),
  getOrCreateI18nInstance(instanceName: string, initOptions: I18nInitOptions | undefined): i18n {
    if (this.registeredInstances.has(instanceName)) {
      return this.registeredInstances.get(instanceName) as i18n;
    }
    return this.createAndRegisterI18nInstance(instanceName, initOptions);
  },
  switchLanguage(): void {
    const targetLanguage = this.getCurrentLanguage() === 'zh' ? 'en' : 'zh';
    this.changeLanguage(targetLanguage);
  },
  getCurrentLanguage(): string {
    const instances = Array.from(this.registeredInstances.values());
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return [...instances][0]?.language ?? 'zh';
  },

  createAndRegisterI18nInstance(instanceName: string, options?: I18nInitOptions): I18n {
    const initOptions: I18nInitOptions = {
      ...options,
      ...DEFAULT_I18N_OPTIONS,
      initImmediate: false,
    };
    const newInstance = i18next.createInstance().use(initReactI18next).use(LanguageDetector);

    newInstance.init(initOptions);
    this.registeredInstances.set(instanceName, newInstance);
    return newInstance;
  },
  changeLanguage(language: string): void {
    const instances = Array.from(this.registeredInstances.values());
    for (const i18nInstance of instances) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      i18nInstance.changeLanguage(language);
    }
  },
};

export default Object.freeze(i18nService);
