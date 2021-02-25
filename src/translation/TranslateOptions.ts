interface TranslateOptions {
    memberId?: string | number;
    language?: 'en' | 'fr';
    count?: number;
    [key: string]: any;
}

export default TranslateOptions;