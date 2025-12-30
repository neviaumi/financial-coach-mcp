import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import prefixedElement from "@/prefixed-element.ts";

const elementName = prefixedElement<"page">("page");

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement(elementName)
export class PageElement extends LitElement {
  override connectedCallback() {
    super.connectedCallback();
    this.classList.add(
      "wa-theme-awesome",
      "wa-palette-bright",
      "wa-brand-blue",
    );
  }

  override render() {
    return html`
      <div>
        Hello Page
        <slot name="header"></slot>
        <slot name="main"></slot>
      </div>
    `;
  }

  static override styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: PageElement;
  }
}
