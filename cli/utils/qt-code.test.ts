import { prepareQRCodeForURL, printQRCode } from "./qr-code.ts";

Deno.test("Generate QR Code into console", async () => {
  const url = new URL("https://google.com");
  const qtCode = await prepareQRCodeForURL(url);
  printQRCode(qtCode);
  console.log("QR Code generated successfully.");
});
