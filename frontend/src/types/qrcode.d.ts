declare module "qrcode.react" {
  import React from "react";
  interface QRCodeProps {
    value: string;
    size?: number;
    bgColor?: string;
    fgColor?: string;
    level?: "L" | "M" | "Q" | "H";
    includeMargin?: boolean;
    renderAs?: "canvas" | "svg";
    className?: string;
    style?: React.CSSProperties;
    imageSettings?: {
      src: string;
      x?: number;
      y?: number;
      height?: number;
      width?: number;
      excavate?: boolean;
    };
  }
  const QRCode: React.FC<QRCodeProps>;
  export default QRCode;
}
