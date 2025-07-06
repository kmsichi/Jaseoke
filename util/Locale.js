const fs = require('fs').promises;

class Locale {
    localeCache = new Map();

    async getLanguage(locale, key) {
        if (this.localeCache.has(locale)) {
            const langCache = this.localeCache.get(locale);
            if (!langCache.has(key)) {
                let sentence = this.getSentence(locale, key);
                langCache.set(key, sentence);
            }
            return langCache.get(key);
        } else {
            let langCache = new Map();
            langCache.set(key, this.getSentence(locale, key));
            this.localeCache.set(locale, langCache);
            return langCache.get(key);
        }
    }

    async getSentence(locale, sentence) {
        const data = await fs.readFile(`./locales/${locale}.json`, 'utf-8');
        const json = JSON.parse(data);

        return json[sentence];
    }
}

module.exports = new Locale();