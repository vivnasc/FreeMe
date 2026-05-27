import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "FreeMe <noreply@viviannedossantos.com>";
const ADMIN_EMAIL = "ola@viviannedossantos.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  return new Resend(key);
}

export async function sendPurchaseConfirmationToClient(
  email: string,
  name: string,
  lang: "pt" | "en",
) {
  const subject =
    lang === "pt"
      ? "FreeMe: o teu percurso está desbloqueado"
      : "FreeMe: your journey is unlocked";

  const html =
    lang === "pt"
      ? `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2E241D;">
  <div style="background: #8C4A36; padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: #FBF4EC; font-size: 28px; font-weight: 300; margin: 0;">Free<em>Me</em></h1>
    <p style="color: #EBAE4A; font-size: 14px; margin: 8px 0 0;">A Travessia da Mãe</p>
  </div>
  <div style="background: #FBF4EC; padding: 40px; border-radius: 0 0 16px 16px;">
    <p style="font-size: 16px; line-height: 1.6;">Olá ${name},</p>
    <p style="font-size: 16px; line-height: 1.6;">O teu percurso está desbloqueado. Podes começar a travessia quando quiseres, no teu ritmo.</p>
    <p style="font-size: 16px; line-height: 1.6;">O que te espera:</p>
    <ul style="font-size: 15px; line-height: 1.8; color: #2E241D;">
      <li>Áudios guiados pela minha voz</li>
      <li>Exercícios de escrita (o teu diário da travessia)</li>
      <li>Anotações privadas, só tuas</li>
      <li>Validação final: as tuas palavras do início vs do fim</li>
    </ul>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://freeme.viviannedossantos.com/pt/journey" style="background: #8C4A36; color: #FBF4EC; padding: 16px 40px; border-radius: 32px; text-decoration: none; font-size: 16px;">Começar a travessia</a>
    </div>
    <p style="font-size: 14px; color: #8C4A36; line-height: 1.6;">Vai com calma contigo. Não há pressa.</p>
    <p style="font-size: 14px; color: #7D8A6A; margin-top: 24px;">O FreeMe não substitui acompanhamento terapêutico. Se precisares de ajuda, procura um profissional.</p>
    <hr style="border: none; border-top: 1px solid #F3E4D6; margin: 24px 0;">
    <p style="font-size: 13px; color: #999;">Vivianne dos Santos<br>freeme.viviannedossantos.com</p>
  </div>
</div>`
      : `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2E241D;">
  <div style="background: #8C4A36; padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: #FBF4EC; font-size: 28px; font-weight: 300; margin: 0;">Free<em>Me</em></h1>
    <p style="color: #EBAE4A; font-size: 14px; margin: 8px 0 0;">A Mother's Crossing</p>
  </div>
  <div style="background: #FBF4EC; padding: 40px; border-radius: 0 0 16px 16px;">
    <p style="font-size: 16px; line-height: 1.6;">Hello ${name},</p>
    <p style="font-size: 16px; line-height: 1.6;">Your journey is unlocked. You can begin the crossing whenever you are ready, at your own pace.</p>
    <p style="font-size: 16px; line-height: 1.6;">What awaits you:</p>
    <ul style="font-size: 15px; line-height: 1.8; color: #2E241D;">
      <li>Guided audio in my voice</li>
      <li>Writing exercises (your crossing journal)</li>
      <li>Private annotations, only yours</li>
      <li>Final validation: your words from the start vs the end</li>
    </ul>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://freeme.viviannedossantos.com/en/journey" style="background: #8C4A36; color: #FBF4EC; padding: 16px 40px; border-radius: 32px; text-decoration: none; font-size: 16px;">Begin the crossing</a>
    </div>
    <p style="font-size: 14px; color: #8C4A36; line-height: 1.6;">Go gently with yourself. There is no rush.</p>
    <p style="font-size: 14px; color: #7D8A6A; margin-top: 24px;">FreeMe does not replace professional therapeutic support.</p>
    <hr style="border: none; border-top: 1px solid #F3E4D6; margin: 24px 0;">
    <p style="font-size: 13px; color: #999;">Vivianne dos Santos<br>freeme.viviannedossantos.com</p>
  </div>
</div>`;

  await getResend().emails.send({ from: FROM, to: email, subject, html });
}

export async function sendPurchaseNotificationToAdmin(
  clientEmail: string,
  clientName: string,
  orderId: string,
) {
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Nova compra FreeMe: ${clientName}`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 500px; color: #2E241D;">
  <h2 style="color: #8C4A36;">Nova compra FreeMe</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px 0; color: #666;">Nome</td><td style="padding: 8px 0; font-weight: bold;">${clientName}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">${clientEmail}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">PayPal Order</td><td style="padding: 8px 0; font-family: monospace;">${orderId}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Data</td><td style="padding: 8px 0;">${new Date().toISOString()}</td></tr>
  </table>
</div>`,
  });
}
