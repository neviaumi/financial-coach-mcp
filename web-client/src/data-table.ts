import { css, html, LitElement, nothing } from "lit";
import { prefixedElementName } from "@/prefixed-element-name.ts";
import { customElement, property } from "lit/decorators.js";
import {
  type ColumnDef as _ColumnDef,
  flexRender,
  getCoreRowModel,
  TableController,
} from "@tanstack/lit-table";
import { withWAStyles } from "@/wa-styles.ts";

const elementName = prefixedElementName<"data-table">("data-table");
export function getValueFromInfo(info: { getValue: () => unknown }) {
  return info.getValue();
}
export { createColumnHelper } from "@tanstack/lit-table";
export type ColumnDef<T> = _ColumnDef<T>;

@customElement(elementName)
export class DataTableElement<TData> extends LitElement {
  static override styles = withWAStyles(css`
    tbody tr td {
      align-content: center;
    }
  `);

  @property({ type: Array })
  accessor data: TData[] = [];

  @property({ type: Array })
  accessor columns: ColumnDef<TData>[] = [];
  @property({ attribute: false })
  accessor calculateRowTitle: (row: TData) => string = () => "";
  private tableController = new TableController<TData>(this);
  override render() {
    const table = this.tableController.table({
      data: this.data,
      columns: this.columns,
      getCoreRowModel: getCoreRowModel(),
    });
    return html`
      <table>
        <thead>
          ${table.getHeaderGroups().map((headerGroup) =>
            html`
              <tr>
                ${headerGroup.headers.map((header) =>
                  html`
                    <th part="header cell">
                      ${header.isPlaceholder ? nothing : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  `
                )}
              </tr>
            `
          )}
        </thead>
        <tbody>
          ${table.getRowModel().rows.map((row) => {
            const rowTitle = this.calculateRowTitle(row.original);
            return html`
              <tr title="${rowTitle}" aria-label="${rowTitle}">
                ${row.getVisibleCells().map((cell) =>
                  html`
                    <td part="cell">
                      ${flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  `
                )}
              </tr>
            `;
          })}
        </tbody>
      </table>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    [elementName]: DataTableElement<unknown>;
  }
}
