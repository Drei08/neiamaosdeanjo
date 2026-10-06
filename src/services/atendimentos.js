import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { auth, db } from "../firebase.js";

const col = () => collection(db, "atendimentos");

// data no formato "AAAA-MM-DD"
export async function salvarAtendimento({ data, cliente, itens, total, hora, pagamento }) {
  return addDoc(col(), {
    data,
    hora: hora || "",
    pagamento: pagamento || "",
    cliente: cliente || "",
    itens,
    total,
    uid: auth.currentUser?.uid || null,
    criadoEm: serverTimestamp(),
  });
}

export async function listarPorDia(data) {
  const snap = await getDocs(query(col(), where("data", "==", data)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.criadoEm?.seconds || 0) - (b.criadoEm?.seconds || 0));
}

export async function excluirAtendimento(id) {
  return deleteDoc(doc(db, "atendimentos", id));
}