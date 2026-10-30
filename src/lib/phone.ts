export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function smsHref(phone: string, body?: string) {
  const number = phone.replace(/[^\d+]/g, "");
  const encoded = body ? `?body=${encodeURIComponent(body)}` : "";
  return `sms:${number}${encoded}`;
}
