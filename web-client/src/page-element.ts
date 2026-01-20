import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { prefixedElementName } from "@/prefixed-element-name.ts";
import { getMonthlyStatement } from "@/async.ts";
import { toYearMonthCode } from "@app/bank-statement/year-month-code";
import { Task } from "@lit/task";
import { handletaskError } from "@/utils.ts";
import { statement } from "@/signals.ts";
import { themeStyles, withWAStyles } from "@/wa-styles.ts";
import "@wa/components/divider/divider.js";

const elementName = prefixedElementName<"page">("page");
const cssVariables = css`
  :host::part(container) {
    --wa-font-family-body: "Roboto Mono", monospace;
    --wa-font-family-heading: "Roboto Mono", monospace;
    --wa-font-family-code: "Google Sans Code", monospace;
    --wa-font-family-longform: "Roboto Mono", monospace;
    --wa-color-surface-default: #f8f7f1;
    --wa-color-brand-fill-normal: #0288d4;
    --wa-color-danger-fill-normal: #eb5a40;
    --wa-color-border-quiet: #e8e6d9;
    --wa-color-brand-on-quiet: #4a4940;
    --wa-color-brand-border-loud: #016ca9;
    --my-grid-system-m: 0.25rem; /* 4px (assuming 1rem=16px) */
    --my-grid-system-l: 0.5rem; /* 8px */
    --my-grid-system-xl: 1rem; /* 16px */
    --my-container-size-xl: calc(var(--my-grid-system-xl) * 64); /**/
    /* Sizing Scale */
    --my-size-0: 0px; /* 0px */
    --my-size-px: 1px;
    --my-size-1: calc(var(--my-grid-system-m) * 1); /* 4px */
    --my-size-2: calc(var(--my-grid-system-m) * 2); /* 8px */
    --my-size-3: calc(var(--my-grid-system-m) * 3); /* 12px */
    --my-size-4: calc(var(--my-grid-system-m) * 4); /* 16px */
    --my-size-5: calc(var(--my-grid-system-m) * 5); /* 20px */
    --my-size-6: calc(var(--my-grid-system-m) * 6); /* 24px */
    --my-size-7: calc(var(--my-grid-system-m) * 7); /* 28px */
    --my-size-8: calc(var(--my-grid-system-m) * 8); /* 32px */
    --my-size-9: calc(var(--my-grid-system-m) * 9); /* 36px */
    --my-size-10: calc(var(--my-grid-system-m) * 10); /* 40px */
    --my-size-11: calc(var(--my-grid-system-m) * 11); /* 44px */
    --my-size-12: calc(var(--my-grid-system-m) * 12); /* 48px */
    --my-size-13: calc(var(--my-grid-system-m) * 13); /* 52px */
    --my-size-14: calc(var(--my-grid-system-m) * 14); /* 56px */
    --my-size-15: calc(var(--my-grid-system-m) * 15); /* 60px */
    --my-size-16: calc(var(--my-grid-system-m) * 16); /* 64px */
    --my-size-17: calc(var(--my-grid-system-l) * 17); /* 136px */
    --my-size-18: calc(var(--my-grid-system-l) * 18); /* 144px */
    --my-size-19: calc(var(--my-grid-system-l) * 19); /* 152px */
    --my-size-20: calc(var(--my-grid-system-l) * 20); /* 160px */
    --my-size-21: calc(var(--my-grid-system-l) * 21); /* 168px */
    --my-size-22: calc(var(--my-grid-system-l) * 22); /* 176px */
    --my-size-23: calc(var(--my-grid-system-l) * 23); /* 184px */
    --my-size-24: calc(var(--my-grid-system-l) * 24); /* 192px */
    --my-size-25: calc(var(--my-grid-system-l) * 25); /* 200px */
    --my-size-26: calc(var(--my-grid-system-l) * 26); /* 208px */
    --my-size-27: calc(var(--my-grid-system-l) * 27); /* 216px */
    --my-size-28: calc(var(--my-grid-system-l) * 28); /* 224px */
    --my-size-29: calc(var(--my-grid-system-l) * 29); /* 232px */
    --my-size-30: calc(var(--my-grid-system-l) * 30); /* 240px */
    --my-size-31: calc(var(--my-grid-system-l) * 31); /* 248px */
    --my-size-32: calc(var(--my-grid-system-l) * 32); /* 256px */
    --my-size-33: calc(var(--my-grid-system-xl) * 33); /* 528px */
    --my-size-34: calc(var(--my-grid-system-xl) * 34); /* 544px */
    --my-size-35: calc(var(--my-grid-system-xl) * 35); /* 560px */
    --my-size-36: calc(var(--my-grid-system-xl) * 36); /* 576px */
    --my-size-37: calc(var(--my-grid-system-xl) * 37); /* 592px */
    --my-size-38: calc(var(--my-grid-system-xl) * 38); /* 608px */
    --my-size-39: calc(var(--my-grid-system-xl) * 39); /* 624px */
    --my-size-40: calc(var(--my-grid-system-xl) * 40); /* 640px */
    --my-size-41: calc(var(--my-grid-system-xl) * 41); /* 656px */
    --my-size-42: calc(var(--my-grid-system-xl) * 42); /* 672px */
    --my-size-43: calc(var(--my-grid-system-xl) * 43); /* 688px */
    --my-size-44: calc(var(--my-grid-system-xl) * 44); /* 704px */
    --my-size-45: calc(var(--my-grid-system-xl) * 45); /* 720px */
    --my-size-46: calc(var(--my-grid-system-xl) * 46); /* 736px */
    --my-size-47: calc(var(--my-grid-system-xl) * 47); /* 752px */
    --my-size-48: calc(var(--my-grid-system-xl) * 48); /* 768px */
  }
`;

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement(elementName)
export class PageElement extends LitElement {
  static override styles = withWAStyles([
    themeStyles,
    cssVariables,
    css`
      main {
        width: var(--my-container-size-xl);
        margin: 0 auto;
        padding: var(--wa-space-xs) var(--wa-space-m);
        text-align: center;
        background-color: var(--wa-color-surface-default);
      }
      wa-divider {
        --color: var(--wa-color-brand-fill-normal);
      }
    `,
  ]);

  private _task = new Task(this, {
    task: async (_, { signal }) => {
      const path = globalThis.location.pathname;
      const segments = path.split("/").filter(Boolean);
      return await getMonthlyStatement(
        toYearMonthCode(segments.pop()),
        { signal },
      ).then((statementResp) => {
        statement.set(statementResp);
        return statementResp;
      });
    },
    args: () => [],
  });

  override render() {
    return html`
      <main part="container" class="wa-theme-awesome wa-palette-bright wa-brand-blue">
        ${this._task.render({
          pending: this.taskRenderPending,
          complete: this.taskRenderComplete,
          error: handletaskError(this.taskRenderError),
        })}
      </main>
    `;
  }

  private taskRenderPending = () => {
    return html`

    `;
  };

  private taskRenderComplete = () => {
    return html`
      <my-header></my-header>
      <wa-divider></wa-divider>
      <my-body></my-body>
    `;
  };

  private taskRenderError = (e: Error) => {
    return html`
      <div role="alert">${e.message}</div>
    `;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: PageElement;
  }
}
