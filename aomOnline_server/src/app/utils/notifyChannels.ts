import config from '../config';

// Stub delivery channels for broadcast notifications (email + WhatsApp).
// No SMTP/WhatsApp provider is wired up yet — this just logs what WOULD be
// sent, gated by whether the client has filled in the relevant env vars.
// Swap the body of each function for a real nodemailer / WhatsApp Cloud API
// call once real credentials are provided — callers do not need to change.

export const sendEmail = async (
  to: string,
  subject: string,
  message: string,
): Promise<void> => {
  const configured = Boolean(config.smtp.host && config.smtp.user);
  if (!configured) {
    console.log(
      `📧 [email stub] No SMTP credentials configured — would send to ${to}: "${subject}"`,
    );
    return;
  }
  // TODO: real send via nodemailer once SMTP_* env vars are provided.
  console.log(`📧 [email stub] SMTP configured but sending not yet wired up — would send to ${to}: "${subject}" — ${message}`);
};

export const sendWhatsapp = async (
  to: string,
  message: string,
): Promise<void> => {
  const configured = Boolean(
    config.whatsapp.apiToken && config.whatsapp.phoneNumberId,
  );
  if (!configured) {
    console.log(
      `💬 [whatsapp stub] No WhatsApp API credentials configured — would send to ${to}: "${message}"`,
    );
    return;
  }
  // TODO: real send via WhatsApp Cloud API once WHATSAPP_* env vars are provided.
  console.log(`💬 [whatsapp stub] WhatsApp configured but sending not yet wired up — would send to ${to}: "${message}"`);
};
