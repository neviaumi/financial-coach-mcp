import QRCode from "qrcode";

export function prepareQRCodeForURL(url: URL): Promise<string> {
  return QRCode.toString(url.toString(), {
    type: "terminal",
    errorCorrectionLevel: "L",
  });
}

export function printQRCode(qtCode: string) {
  const leftPadding = " ".repeat(16);
  const lineLength = 24;
  console.log(`${"----".repeat(lineLength)}
`);
  console.log(
    `${
      qtCode.trim().split("\n").map((line) => `${leftPadding}${line}`).join(
        "\n",
      )
    }`,
  );
  console.log(`
${"----".repeat(lineLength)}`);
}
