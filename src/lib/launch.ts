// Modo lista de espera. Enquanto nao abrimos ao publico, evitamos o funil de
// pagamento e recolhemos emails. Por omissao estamos em lista de espera.
// Para ABRIR ao publico, define no Vercel: NEXT_PUBLIC_FREEME_OPEN=true
export const WAITLIST_MODE = process.env.NEXT_PUBLIC_FREEME_OPEN !== "true";
