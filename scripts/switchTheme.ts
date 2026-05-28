import { Appearance } from "react-native";

const switchUITheme = () => {
    const currTheme = Appearance.getColorScheme();
    if (currTheme === 'dark') {
        Appearance.setColorScheme('light');
    }
    else {
        Appearance.setColorScheme('dark');
    }
}

export default switchUITheme;