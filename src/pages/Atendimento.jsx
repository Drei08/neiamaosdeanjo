import { useState } from "react";
import { flushSync } from "react-dom";
import { salvarAtendimento } from "../services/atendimentos.js";
import { formatarData, hoje, horaAgora, moeda } from "../utils.js";

export default function Atendimento() {
  const [data, setData] = useState(hoje());
  const [horaEmissao, setHoraEmissao] = useState("");
  const [cliente, setCliente] = useState("");
  const [servico, setServico] = useState("");
  const [valor, setValor] = useState("");
  const [itens, setItens] = useState([]);
  const [salvo, setSalvo] = useState(false);
  const [aviso, setAviso] = useState("");

  const total = itens.reduce((soma, i) => soma + i.valor, 0);

  function adicionar(e) {
    e.preventDefault();
    const v = parseFloat(String(valor).replace(",", "."));
    if (!servico.trim() || isNaN(v)) return;
    setItens([...itens, { servico: servico.trim(), valor: v }]);
    setServico("");
    setValor("");
    setSalvo(false);
  }

  function remover(index) {
    setItens(itens.filter((_, i) => i !== index));
    setSalvo(false);
  }

  function novo() {
    setItens([]);
    setCliente("");
    setHoraEmissao("");
    setData(hoje());
    setSalvo(false);
    setAviso("");
  }

  async function imprimir() {
  if (itens.length === 0) return;
  setAviso("");
  if (!salvo) {
    const h = horaAgora();
    flushSync(() => setHoraEmissao(h));
    try {
      await salvarAtendimento({ data, cliente, itens, total, hora: h });
      setSalvo(true);
    } catch {
      setAviso("Não foi possível salvar no histórico. Verifique a conexão e as chaves do Firebase.");
    }
  }
  window.print();
}

  return (
    <div className="grade">
      <form className="cartao no-print" onSubmit={adicionar}>
        <h2>Novo Serviço</h2>
        <label>
          Data
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </label>
        <label>
          Cliente (opcional)
          <input value={cliente} onChange={(e) => setCliente(e.target.value)} />
        </label>
        <label>
          Serviço
          <input
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            placeholder="Ex.: barra de calça"
          />
        </label>
        <label>
          Valor (R$)
          <input
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
          />
        </label>
        <button className="primario">Adicionar</button>
      </form>

      <section className="cartao recibo">
        <div className="so-impressao">
          <p className="data-hora">
            {formatarData(data)}{horaEmissao && ` - ${horaEmissao}`}
          </p>
          <h1>{import.meta.env.VITE_NOME_NEGOCIO || "Recibo"}</h1>
          <p>Recibo de serviços</p>
        </div>
        <div className="linha-info">
          {cliente && <span>Cliente: {cliente}</span>}
        </div>

        {itens.length === 0 ? (
          <p className="suave no-print">Nenhum serviço adicionado ainda.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Serviço</th>
                <th className="dir">Valor</th>
                <th className="no-print"></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.servico}</td>
                  <td className="dir">{moeda(i.valor)}</td>
                  <td className="no-print dir">
                    <button className="link" onClick={() => remover(idx)}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="total">
          <span>Total</span>
          <strong>{moeda(total)}</strong>
        </div>

        <div className="so-impressao assinatura">
          <span>Recebido:</span>
          <span className="linha-assinatura"></span>
        </div>

        {aviso && <p className="erro no-print">{aviso}</p>}
        {salvo && <p className="ok no-print">Salvo no histórico.</p>}

        <div className="acoes no-print">
          <button className="primario" onClick={imprimir} disabled={itens.length === 0}>
            Imprimir
          </button>
          <button className="secundario" onClick={novo}>
            Novo Recibo
          </button>
        </div>
      </section>
    </div>
  );
}
