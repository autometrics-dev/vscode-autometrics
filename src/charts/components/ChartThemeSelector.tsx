import type { ChartTheme } from "fiberplane-charts";
import { DefaultTheme, ThemeProvider } from "styled-components";

import * as defaultTheme from "../themeValues";

// Reassign to make sure all `ChartTheme` properties are covered.
const theme: ChartTheme & DefaultTheme = { ...defaultTheme };

type Props = {
  children: React.ReactNode;
};

export function ChartThemeProvider(props: Props) {
  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
}
