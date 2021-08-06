import 'styled-components';
import theme from './theme';

declare module 'styled-components' {
    type ThemeType = typeof theme //Created a ThemeType that has the same type as theme

    export interface DefaultTheme extends ThemeType {} //Gets the DefaultTheme and adds the ThemeType to export
}