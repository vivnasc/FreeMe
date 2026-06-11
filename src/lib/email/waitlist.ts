import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "FreeMe <noreply@viviannedossantos.com>";
const ADMIN_EMAIL = "ola@viviannedossantos.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  return new Resend(key);
}

// Inscricao na lista de espera: avisa a Vivianne (para ter a lista no email,
// filtravel pelo assunto) e manda uma confirmacao gentil a pessoa.
export async function sendWaitlistSignup(
  email: string,
  name: string,
  lang: "pt" | "en",
) {
  const resend = getResend();

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Lista de espera FreeMe: ${email}`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 500px; color: #2E241D;">
  <h2 style="color: #8C4A36;">Nova inscrição na lista de espera</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px 0; color: #666;">Nome</td><td style="padding: 8px 0; font-weight: bold;">${name || "(sem nome)"}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Idioma</td><td style="padding: 8px 0;">${lang}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Data</td><td style="padding: 8px 0;">${new Date().toISOString()}</td></tr>
  </table>
</div>`,
  });

  const greeting = name ? (lang === "pt" ? `Olá ${name},` : `Hello ${name},`) : lang === "pt" ? "Olá," : "Hello,";
  const subject =
    lang === "pt" ? "Estás na lista do FreeMe" : "You're on the FreeMe list";
  const body =
    lang === "pt"
      ? "Guardámos o teu lugar. A travessia ainda está a ser afinada com cuidado, e assim que abrir serás das primeiras a saber. Obrigada por confiares antes de eu te pedir."
      : "We've saved your place. The crossing is still being shaped with care, and the moment it opens you'll be among the first to know. Thank you for trusting before I even asked.";

  await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html: `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2E241D;">
  <div style="background: #8C4A36; padding: 36px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: #FBF4EC; font-size: 26px; font-weight: 300; margin: 0;">Free<em>Me</em></h1>
    <p style="color: #F0C9B0; font-size: 14px; margin: 8px 0 0;">${lang === "pt" ? "A Travessia da Mãe" : "A Mother's Crossing"}</p>
  </div>
  <div style="background: #FBF4EC; padding: 36px; border-radius: 0 0 16px 16px;">
    <p style="font-size: 16px; line-height: 1.7;">${greeting}</p>
    <p style="font-size: 16px; line-height: 1.7;">${body}</p>
    <p style="font-size: 14px; color: #7D8A6A; margin-top: 28px;">Vivianne dos Santos<br>freeme.viviannedossantos.com</p>
  </div>
</div>`,
  });
}
