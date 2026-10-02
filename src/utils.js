export const moeda = (n) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Data de hoje no formato AAAA-MM-DD (fuso local)
export const hoje = () => new Date().toLocaleDateString("sv-SE");

// "2026-10-01" -> "01/10/2026"
export const formatarData = (iso) => iso.split("-").reverse().join("/");

export const horaAgora = () =>
  new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

// Hora de um recibo salvo (usa o campo "hora" ou, nos antigos, o horário de criação)
export const horaDe = (a) => {
  if (a.hora) return a.hora;
  const d = a.criadoEm?.toDate?.();
  return d ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
};