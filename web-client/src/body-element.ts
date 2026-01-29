import { css, html, LitElement, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { map } from "lit/directives/map.js";
import { customElement } from "lit/decorators.js";
import { statement } from "@/signals.ts";
import { prefixedElementName } from "@/prefixed-element-name.ts";
import { createColumnHelper, getValueFromInfo } from "@/data-table.ts";
import type { Statement } from "@app/bank-statement/types";
import { parseMccCodeToLabel } from "@app/open-banking/mcc";
import { withWAStyles } from "@/wa-styles.ts";

import "@wa/components/format-date/format-date.js";
import "@wa/components/format-number/format-number.js";
import "@wa/components/card/card.js";

const aiReviewElementName = prefixedElementName<"ai-review">("ai-review");

@customElement(aiReviewElementName)
export class AiReviewElement extends LitElement {
  static override styles = withWAStyles(css`
    wa-card::part(header) {
      padding-top: var(--wa-space-l);
      padding-bottom: var(--wa-space-l);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    wa-divider {
      --color: var(--wa-color-brand-fill-normal);
    }
    .margin-0 {
      margin: 0;
    }

    wa-card h3 {
      margin-top: var(--wa-space-m);
    }
    wa-card h3.margin-top-0 {
      margin-top: 0;
    }
  `);
  override render() {
    const aiReview = statement.get()?.aiReview;
    if (!aiReview) return nothing;
    return html`
      <wa-card>
        <h2 slot="header" class="margin-0">AI Review</h2>
        <article title="AI Review">
          <section title="Insight Summary">
            <h3 class="margin-top-0">Insight Summary</h3>
            ${unsafeHTML(aiReview.insightSummary.html)}
          </section>
          <section title="Rationale">
            <h3>Rationale</h3>
            <ul>
              ${map(aiReview.analysisRationale, (rationale) =>
                html`
                  <li>${unsafeHTML(rationale.html)}</li>
                `)}
            </ul>
          </section>
          <section title="Action Plans">
            <h3>Action Plans</h3>
            <ul>
              ${map(aiReview.actionPlan, (actionPlan) =>
                html`
                  <li>${unsafeHTML(actionPlan.html)}</li>
                `)}
            </ul>
          </section>
        </article>
      </wa-card>
      <wa-divider></wa-divider>
    `;
  }
}

const elementName = prefixedElementName<"body">("body");
type StatementTransaction = Statement["transactions"][number];
const columnHelper = createColumnHelper<StatementTransaction>();
const columns = [
  columnHelper.accessor("bookingDate", {
    id: "bookingDate",
    header: "Date",
    cell: (info) => {
      const bookingDate = info.getValue();
      return html`
        <wa-format-date
          style="text-wrap-mode: nowrap;"
          .date="${bookingDate}"
          lang="en-GB"
          day="2-digit"
          month="short"
          year="numeric"
        ></wa-format-date>
      `;
    },
  }),
  columnHelper.accessor((row) => row.institution.id.split("_")[0], {
    id: "institution",
    header: "Institution",
    cell: getValueFromInfo,
  }),
  columnHelper.accessor(
    (row) =>
      [
        row.institution.accountType,
        `${row.institution.softCode ?? ""} ${row.institution.accountNumber}`
          .trim(),
      ].join("_"),
    {
      id: "account",
      header: "Account",
      cell: (info) => {
        const [accountType, accountNumber] = info.getValue().split("_");
        return html`
          <div part="account-type">${accountType}</div>
          <span part="account-number">${accountNumber}</span>
        `;
      },
    },
  ),
  columnHelper.accessor(
    (row) =>
      row.merchantCategoryCode
        ? [row.to, row.merchantCategoryCode].join("_")
        : row.to,
    {
      id: "transactionDetails",
      header: "Transaction details",
      cell: (info) => {
        const [to, mccCode] = info.getValue().split("_");
        if (!mccCode) {
          return html`
            <span part="transaction-receiver">${to}</span>
          `;
        }
        return html`
          <span part="transaction-category">${parseMccCodeToLabel(
            mccCode,
          )}</span>
          <br />
          <span part="transaction-receiver">${to}</span>
        `;
      },
    },
  ),
  columnHelper.accessor(
    "transactionAmount",
    {
      id: "Amount",
      header: "Amount",
      cell: (info) => {
        const amount = info.getValue();
        const amountValue = parseFloat(amount.amount);
        const isPossitiveAmount = amountValue >= 0;
        return html`
          <my-two-columns part="amount ${isPossitiveAmount
            ? "amount-income"
            : "amount-payout"}">
            ${isPossitiveAmount ? "+" : "-"}<wa-format-number
              type="currency"
              currency="${amount.currency}"
              value="${Math.abs(amountValue)}"
              lang="en-GB"
            ></wa-format-number></my-two-columns>
        `;
      },
    },
  ),
];

@customElement(elementName)
export class BodyElement extends LitElement {
  static override styles = withWAStyles(css`
    :host {
      --payout-color: var(--wa-color-danger-fill-normal);
      --income-color: var(--wa-color-brand-fill-normal);
    }
    my-data-table::part(cell) {
      font-size: var(--wa-font-size-m);
    }
    my-data-table::part(amount) {
      gap: 0;
    }
    my-data-table::part(account-type) {
      font-size: var(--wa-font-size-2xs);
      font-weight: var(--wa-font-weight-light);
      color: var(--wa-color-text-quiet);
    }
    my-data-table::part(account-number) {
      text-wrap-mode: nowrap;
      font-weight: var(--wa-font-weight-bold);
    }

    my-data-table::part(amount-payout) {
      font-weight: var(--wa-font-weight-bold);
      color: var(--payout-color);
    }
    my-data-table::part(amount-income) {
      font-weight: var(--wa-font-weight-bold);
      color: var(--income-color);
    }
    my-data-table::part(transaction-category) {
      font-size: var(--wa-font-size-2xs);
      font-weight: var(--wa-font-weight-light);
      color: var(--wa-color-text-quiet);
    }
    my-data-table::part(transaction-receiver) {
      font-size: var(--wa-font-size-m);
      font-weight: var(--wa-font-weight-semibold);
    }
  `);
  override render() {
    const transactions = statement.get()?.transactions;
    if (!transactions) return nothing;
    return html`
      <my-ai-review></my-ai-review>
      <my-data-table
        .calculateRowTitle="${this.calculateRowTitle}"
        .data="${transactions}"
        .columns="${columns}"
      ></my-data-table>
    `;
  }
  private calculateRowTitle(row: StatementTransaction): string {
    return [
      row.institution.id,
      row.institution.accountType,
      row.institution.accountNumber,
      "to",
      row.to,
    ].join("_");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: BodyElement;
  }
}
