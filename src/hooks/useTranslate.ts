import TranslateFunction from "../translation/TranslateFunction";

const useTranslate = (): { __: typeof TranslateFunction } => {
    return {
        __: TranslateFunction
    }
}

export default useTranslate;