import QRCode from "qrcode";

export function prepareQRCodeForURL(url: URL) {
  return QRCode.toString(url.toString(), {
    type: "terminal",
    small: true,
  });
}

export function printQRCode(qtCode: string) {
  console.log("----".repeat(8));
  console.log(qtCode);
  console.log("----".repeat(8));
}
