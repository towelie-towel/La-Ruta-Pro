import type { KeyboardTypeOptions } from "react-native";

interface configs {
    General?: GeneralConfig;
    Themes?: undefined;
    Network?: undefined;
    Admin?: undefined;
    Device?: undefined;
    Service?: undefined;
    Payment?: undefined;
    Config?: undefined;
    Drawer?: undefined;
    SignIn?: SignInConfig;
    SignUp?: undefined;
}

interface GeneralConfig {
    title: string;
    description: string;
    logo: string;
    background: string;
    color: string;
    image: string;
    customConfig: boolean;
}

export interface SignInConfig {
    title: string;
    screenTitle: string;
    description: string;
    logo: string;
    lighTheme: {
        background: string;
        textColor: string;
    };
    darkTheme: {
        background: string;
        textColor: string;
    };
    blurHash: string;
    image: string;
    vanishLogo: boolean;
    errors: {
        phoneError: {
            length: {
                active: boolean,
                message: string;
                value: number
            };
            startsWith: {
                active: boolean;
                message: string;
                value: string
            };
            invalidChars: {
                active: boolean;
                message: string;
                withInvalid: boolean
            };
        };
        passwordError: {
            maxLength: {
                active: boolean;
                message: string;
                value: number
            };
            minLength: {
                active: boolean;
                message: string;
                value: number
            };
        };
    };
    fields: {
        phone: TextInputConfig;
        password: TextInputConfig;
    };
    buttonTexts: {
        initSession: string;
        dontHaveAccount: string;
        createAccount: string;
    };
}

interface ColorByTheme {
    light: string;
    dark: string;
}
interface TextInputConfig {
    placeholder: string;
    placeholderTextColor: ColorByTheme;
    keyboardType: KeyboardTypeOptions;
    autoCapitalize: "none" | "sentences" | "words" | "characters" | undefined;
    maxLength: number;
    autoCorrect: boolean;
    secureTextEntry: boolean;
}