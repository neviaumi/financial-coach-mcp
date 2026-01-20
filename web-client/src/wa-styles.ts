import { css, type CSSResultGroup, unsafeCSS } from "lit";
// @ts-ignore: https://github.com/denoland/deno/issues/11961
import nativeCSS from "@wa/styles/native.css?inline";
// @ts-ignore: https://github.com/denoland/deno/issues/11961
import utilitiesCSS from "@wa/styles/utilities.css?inline";
// @ts-ignore: https://github.com/denoland/deno/issues/11961
import themeCSS from "@wa/styles/themes/awesome.css?inline";
export const nativeStyles = css`
  ${unsafeCSS(nativeCSS)};
`;
export const utilitiesStyles = css`
  ${unsafeCSS(utilitiesCSS)};
`;
export const themeStyles = css`
  ${unsafeCSS(themeCSS)};
`;

export function withWAStyles(styles: CSSResultGroup = []): CSSResultGroup {
  return [
    nativeStyles,
    utilitiesStyles,
    ...(Array.isArray(styles) ? styles : [styles]),
  ];
}
