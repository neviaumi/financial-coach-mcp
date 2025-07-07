import QRCode from "qrcode";

console.log("----".repeat(8))
console.log(
  await QRCode.toString("https://google.com", { type: "terminal", small: true }),
);
console.log("----".repeat(8))
