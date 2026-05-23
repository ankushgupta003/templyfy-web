import { brand } from "../../../shared/brand";

type DownloadEmailArgs = {
  customerName: string;
  productName: string;
  orderNumber: string;
  downloadUrl: string;
  expiryHours: number;
  supportEmail: string;
};

export const downloadReadyEmail = ({
  customerName,
  productName,
  orderNumber,
  downloadUrl,
  expiryHours,
  supportEmail,
}: DownloadEmailArgs) => ({
  subject: `Your download is ready - ${brand.name}`,
  html: `<!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:Manrope,Arial,sans-serif;color:#334155;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(8,17,31,0.08);">
              <tr>
                <td style="padding:32px;background:#08111F;color:#ffffff;">
                  <div style="font-size:14px;letter-spacing:0.16em;text-transform:uppercase;color:#7dd3fc;">${brand.name}</div>
                  <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">Your file is ready</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 16px;">Hi ${customerName},</p>
                  <p style="margin:0 0 16px;">
                    Thank you for your purchase. Your order <strong>${orderNumber}</strong> for
                    <strong>${productName}</strong> has been confirmed.
                  </p>
                  <p style="margin:0 0 24px;">Use the secure button below to download your file.</p>
                  <a href="${downloadUrl}" style="display:inline-block;background:linear-gradient(135deg,#2563EB,#06B6D4);color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:14px;font-weight:700;">
                    Download Your File
                  </a>
                  <p style="margin:24px 0 0;font-size:14px;color:#475569;">
                    This link expires in ${expiryHours} hours for security. If you need help, contact ${supportEmail}.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px;background:#f1f5f9;font-size:13px;color:#64748b;">
                  ${brand.footer}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`,
});

