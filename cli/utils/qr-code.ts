import QRCode from "qrcode";

export function prepareQRCodeForURL(url: URL): Promise<string> {
  return QRCode.toString(url.toString(), {
    type: "terminal",
    errorCorrectionLevel: "L",
  });
}

export function printQRCode(qtCode: string) {
  const padding = " ".repeat(4);
  const marginX = " ".repeat(16);
  const borderX = 24;
  console.log(`${"----".repeat(borderX)}
`);
  console.log(
    `${
      qtCode.trim().split("\n").map((line) =>
        `${marginX}|${padding}${line}${padding}|${marginX}`
      ).join(
        "\n",
      )
    }`,
  );
  console.log(`
${"----".repeat(borderX)}`);
}
