import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Task } from "@lit/task";
import prefixedElement from "@/prefixed-element.ts";
import { getMonthlyStatement } from "@/async.ts";
import { toYearMonthCode } from "@app/bank-statement/year-month-code";
import "@wa/components/button/button.js";

const elementName = prefixedElement<"body">("body");

/**
 * The body element for the web page.
 *
 * @slot - The main content of the body
 */
@customElement(elementName)
export class BodyElement extends LitElement {
  @property({ attribute: "year-month-code" })
  accessor yearMonthCode!: string;

  private _task = new Task(this, {
    task: ([yearMonthCode], { signal }) =>
      getMonthlyStatement(
        toYearMonthCode(yearMonthCode),
        { signal },
      ),
    args: () => [this.yearMonthCode],
  });

  override render() {
    return html`
      <div>
        <slot name="title"></slot>
        <wa-button variant="brand">WA Button</wa-button>
        ${this._task.render({
          pending: () =>
            html`

            `,
          complete: (result) => {
            if (result === null) {
              return html`

              `;
            }
            return html`
              <pre>${JSON.stringify(result, null, 2)}</pre>
            `;
          },
          error: (e) =>
            html`
              <div role="alert">${(e as Error).message}</div>
            `,
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: BodyElement;
  }
}
