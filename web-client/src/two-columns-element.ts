import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { prefixedElementName } from "@/prefixed-element-name.ts";
import { withWAStyles } from "@/wa-styles.ts";

const elementName = prefixedElementName<"two-columns">("two-columns");

@customElement(elementName)
export class TwoColumnsElement extends LitElement {
  static override styles = withWAStyles();

  override connectedCallback() {
    super.connectedCallback();
    this.classList.add("wa-flank");
  }

  override render() {
    return html`
      <slot></slot>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: TwoColumnsElement;
  }
}
