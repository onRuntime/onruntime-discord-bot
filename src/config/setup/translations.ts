import i18n from 'i18next';

export default () => {
    i18n.init({
        lng: 'en',
        fallbackLng: 'en',
        backend: {
            loadPath: 'locales/{{lng}}/{{ns}}.json'
        }
    });

    console.log(i18n.languages);
};