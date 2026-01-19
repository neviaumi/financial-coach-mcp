import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import {prefixedElementName} from "@/prefixed-element-name.ts";
import "@wa/components/avatar/avatar.js";
import { statement } from "@/signals.ts";
import { SignalWatcher } from "@lit-labs/signals";
import { repeat } from "lit/directives/repeat.js";
import { getInstitutions } from "./transaction.ts";
import { withWAStyles } from "@/wa-styles.ts";
import "@wa/components/tag/tag.js";
import "@wa/components/format-date/format-date.js";
import "@wa/components/format-number/format-number.js";
import "@wa/components/divider/divider.js";

const elementNameStatementBalance = prefixedElementName<"statement-balance">("statement-balance")
@customElement(elementNameStatementBalance)
export class StatementBalanceElement extends SignalWatcher(LitElement) {
  static override styles = withWAStyles(css`
    wa-divider {
      --color: var(--wa-color-border-quiet);
    }
    my-two-columns {
        --content-percentage: var(--my-size-15);
    }
    :host::part(positive) {
        font-weight: var(--wa-font-weight-bold);
        color: var(--wa-color-brand-fill-normal);
    }
    :host::part(negative) {
        font-weight: var(--wa-font-weight-bold);
        color: var(--wa-color-brand-fill-loud);

    }
    `);

  override render() {
    const statementValue = statement.get();
    if (!statementValue) return;
    const { opening, closing } = statementValue.balance;
    return html`
      <my-two-columns>
          <label>Opening balance:</label>
          <wa-format-number
            type="currency"
            currency="${opening.currency}"
            value="${opening.amount}"
            lang="en-GB"
          ></wa-format-number>
      </my-two-columns>
      <wa-divider></wa-divider>
      <my-two-columns>
          <label>Closing balance:</label>
          <wa-format-number
              part=${`balance-closing ${parseFloat(closing.amount) >  parseFloat(opening.amount) ? "positive" : "negative"}`}
            type="currency"
            currency="${closing.currency}"
            value="${closing.amount}"
            lang="en-GB"
          ></wa-format-number>
      </my-two-columns>

    `;
  }
}
const elementNameStatementDateRange = prefixedElementName<
  "statement-date-range"
>(
  "statement-date-range",
);
@customElement(elementNameStatementDateRange)
export class StatementDateRangeElement extends SignalWatcher(LitElement) {
  static override styles = withWAStyles(css`
    my-two-columns {
        --content-percentage: var(--my-size-15);
    }
    :host::part(month-year) {
        text-wrap-mode: nowrap;
    }
    `);

  override render() {
    const statementValue = statement.get();
    if (!statementValue) return;
    const { start, end } = statementValue.period;
    return html`
      <my-two-columns>
          <label>Statement Period:</label>
        <span>
            <div><wa-format-date
              lang="en-GB"
              date="${start}"
              day="2-digit"
            ></wa-format-date> - <wa-format-date
              lang="en-GB"
              date="${end}"
              day="2-digit"
            ></wa-format-date>
            </div>
            <wa-format-date
                part='month-year'
              lang="en-GB"
              date="${end}"
              month="short"
              year="numeric"
            ></wa-format-date>
        </span>
    `;
  }
}

const elementNameInstitutionList = prefixedElementName<"institution-list">(
  "institution-list",
);
@customElement(elementNameInstitutionList)
export class InstitutionListElement extends SignalWatcher(LitElement) {
    static override styles = withWAStyles(css`
      li {
          list-style-type: none;
      }
      h2 {
          font-size: var(--wa-font-size-xl);
          margin-bottom: var(--wa-space-s);
      }
      .my-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--wa-space-2xs);
      }
      :host::part(bank-account-listing) {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--wa-space-xs)
      }
      :host::part(account) {
          margin: var(--my-size-0);
          margin-bottom: var(--wa-space-2xs);
      }
      :host::part(account-type) {
          font-size: var(--wa-font-size-2xs);
          font-weight: var(--wa-font-weight-light);
          color: var(--wa-color-text-quiet);
      }
      :host::part(account-number) {
          font-size: var(--wa-font-size-m);
          font-weight: var(--wa-font-weight-bold);
      }
      `);

  override render() {
    const statementValue = statement.get();
    if (!statementValue) return;
    const institutions = getInstitutions(statementValue.transactions);
    return html`
      <h2>Institutions</h2>
      <div class='my-grid'>
        ${repeat(
          institutions,
          ([institutionId]) => institutionId,
          ([institutionId, accounts]) =>
            html`
              <section title="${institutionId}" part='bank-account-listing'>
                <wa-tag>${institutionId}</wa-tag>
                <ul>
                  ${repeat(
                    accounts,
                    (account) => account.accountNumber,
                    (account) =>{
                        const accountNumber = `${
                          account.softCode ?? ""
                        } ${account.accountNumber}`.trim();
                        return html`
                          <li part='account'>
                              <span part='account-type'>${account.accountType}</span><br/>
                              <span part='account-number'>${accountNumber}</span>
                          </li>
                        `
                    }
                  )}
                </ul>
              </section>
            `,
        )}
      </div>
    `;
  }
}

const elementName = prefixedElementName<"header">("header");
@customElement(elementName)
export class HeaderElement extends LitElement {
  static override styles = withWAStyles(
    css`
      :host {
          break-inside: avoid;
      }
      wa-avatar {
        --size: var(--my-size-20);
      }
      .row1 {
        justify-content: center;
        align-items: center;
      }
      .row2 {
        display: flex;
        justify-content: space-between;
      }
      .row2-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
      }
      wa-divider {
        --color: var(--wa-color-border-quiet);
      }
    `,
  );
  override render() {
    return html`
      <header>
        <div class="row1 wa-gap-3xl">
          <wa-avatar image="/icons.png" label="icon"></wa-avatar>
          <h2>Consolidated Financial Summary</h2>
        </div>
        <wa-divider></wa-divider>
        <div class="row2">
          <my-institution-list></my-institution-list>
          <div class='row2-right'>
              <my-statement-date-range></my-statement-date-range>
              <wa-divider></wa-divider>
              <my-statement-balance></my-statement-balance>
          </div>

        </div>
      </header>
    `;
  }
}



declare global {
  interface HTMLElementTagNameMap {
    [elementName]: HeaderElement;
    [elementNameInstitutionList]: InstitutionListElement;
    [elementNameStatementDateRange]: StatementDateRangeElement;
  }
}
