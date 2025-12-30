import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import prefixedElement from "@/prefixed-element.ts";
import "@wa/components/button/button.js";

const elementName = prefixedElement<"body">("body");

/**
 * The body element for the web page.
 *
 * @slot - The main content of the body
 */
@customElement(elementName)
export class BodyElement extends LitElement {
  override render() {
    return html`
      <div>
        <slot name="title"></slot>
        <wa-button variant="brand">WA Button</wa-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: BodyElement;
  }
}
