import TranslateOptions from "./TranslateOptions";

const TranslateFunction = (key: string, options: TranslateOptions = { language: 'en' }): string => {
    if(options?.memberId) {
        //TODO: get member language in database
    }

    return key;
};

export default TranslateFunction;