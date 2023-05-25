import { ChartTheme } from "fiberplane-charts";

export interface AdditionalThemeValues extends ChartTheme {
  fontStudioHeadingsH5FontSize: string;
  fontStudioHeadingsH5TextDecoration: string;
  fontStudioHeadingsH5FontFamily: string;
  fontStudioHeadingsH5FontWeight: string;
  fontStudioHeadingsH5FontStyle: string;
  fontStudioHeadingsH5FontStretch: string;
  fontStudioHeadingsH5FontStyleOld: string;
  fontStudioHeadingsH5LetterSpacing: string;
  fontStudioHeadingsH5LineHeight: string;
  fontStudioHeadingsH5ParagraphIndent: string;
  fontStudioHeadingsH5ParagraphSpacing: string;
  fontStudioHeadingsH5TextCase: string;
  fontStudioHeadingsH5ShortHand: string;
  fontStudioBodyCopySmallFontSize: string;
  fontStudioBodyCopySmallTextDecoration: string;
  fontStudioBodyCopySmallFontFamily: string;
  fontStudioBodyCopySmallFontWeight: string;
  fontStudioBodyCopySmallFontStyle: string;
  fontStudioBodyCopySmallFontStretch: string;
  fontStudioBodyCopySmallFontStyleOld: string;
  fontStudioBodyCopySmallLetterSpacing: string;
  fontStudioBodyCopySmallLineHeight: string;
  fontStudioBodyCopySmallParagraphIndent: string;
  fontStudioBodyCopySmallParagraphSpacing: string;
  fontStudioBodyCopySmallTextCase: string;
  fontStudioBodyCopySmallShortHand: string;
}

declare module "styled-components" {
  // rome-ignore lint/suspicious/noEmptyInterface: <explanation>
  export interface DefaultTheme extends AdditionalThemeValues {}
}
