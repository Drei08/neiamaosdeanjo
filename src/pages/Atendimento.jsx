import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { salvarAtendimento } from "../services/atendimentos.js";
import { formatarData, hoje, horaAgora, moeda } from "../utils.js";

const linhaVazia = () => ({ servico: "", valor: "" });

export default function Atendimento() {
  const [data, setData] = useState(hoje());
  const [cliente, setCliente] = useState("");
  const [linhas, setLinhas] = useState([linhaVazia()]);
  const [pagamento, setPagamento] = useState("");
  const [semPagamento, setSemPagamento] = useState(false);
  const [itens, setItens] = useState([]);
  const [salvo, setSalvo] = useState(false);
  const [aviso, setAviso] = useState("");
  const [horaEmissao, setHoraEmissao] = useState("");
  const pagamentoRef = useRef(null);

  const total = itens.reduce((soma, i) => soma + i.valor, 0);

  function mudarLinha(index, campo, texto) {
    setLinhas(linhas.map((l, i) => (i === index ? { ...l, [campo]: texto } : l)));
  }

  function maisUmaLinha() {
    setLinhas([...linhas, linhaVazia()]);
  }

  function tirarLinha(index) {
    setLinhas(linhas.filter((_, i) => i !== index));
  }

  // Adiciona ao recibo todas as linhas preenchidas de uma vez
  function adicionar(e) {
    e.preventDefault();
    const novos = linhas
      .map((l) => ({
        servico: l.servico.trim(),
        valor: parseFloat(String(l.valor).replace(",", ".")),
      }))
      .filter((l) => l.servico && !isNaN(l.valor));
    if (novos.length === 0) return;
    setItens([...itens, ...novos]);
    setLinhas([linhaVazia()]);
    setSalvo(false);
  }

  function remover(index) {
    setItens(itens.filter((_, i) => i !== index));
    setSalvo(false);
  }

  function novo() {
    setItens([]);
    setLinhas([linhaVazia()]);
    setCliente("");
    setPagamento("");
    setSemPagamento(false);
    setData(hoje());
    setSalvo(false);
    setAviso("");
    setHoraEmissao("");
  }

  async function imprimir() {
    if (itens.length === 0) return;
    if (!pagamento) {
      setSemPagamento(true);
      window.alert("Selecione a forma de pagamento (Dinheiro, Pix ou Crédito) antes de imprimir.");
      pagamentoRef.current?.focus();
      return;
    }
    setAviso("");
    if (!salvo) {
      const h = horaAgora();
      flushSync(() => setHoraEmissao(h));
      try {
        await salvarAtendimento({ data, cliente, itens, total, hora: h, pagamento });
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

        {linhas.map((l, i) => (
          <div key={i} className="linha-form">
            <label>
              Serviço
              <input
                value={l.servico}
                onChange={(e) => mudarLinha(i, "servico", e.target.value)}
                placeholder="Ex.: barra de calça"
              />
            </label>
            <label>
              Valor (R$)
              <input
                inputMode="decimal"
                value={l.valor}
                onChange={(e) => mudarLinha(i, "valor", e.target.value)}
                placeholder="0,00"
              />
            </label>
            {linhas.length > 1 && (
              <button type="button" className="link" onClick={() => tirarLinha(i)}>
                Remover este serviço
              </button>
            )}
          </div>
        ))}

        <button type="button" className="secundario mais" onClick={maisUmaLinha}>
          + Mais um serviço
        </button>

        <label className="linha-form">
          Forma de pagamento
          <select
            ref={pagamentoRef}
            required
            className={semPagamento && !pagamento ? "campo-erro" : ""}
            value={pagamento}
            onInvalid={(e) => e.target.setCustomValidity("Selecione a forma de pagamento")}
            onChange={(e) => {
              e.target.setCustomValidity("");
              setPagamento(e.target.value);
              setSemPagamento(false);
            }}
          >
            <option value="">Selecione...</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Pix">Pix</option>
            <option value="Crédito">Crédito</option>
          </select>
        </label>

        <button className="primario">Adicionar</button>
      </form>

      <section className="cartao recibo">
        <div className="so-impressao">
          <p className="data-hora">
            {formatarData(data)}
            {horaEmissao && ` - ${horaEmissao}`}
          </p>
          <h1>{import.meta.env.VITE_NOME_NEGOCIO || "Recibo"}</h1>
          <p>Recibo de serviços</p>
        </div>
        <div className="linha-info">
          {cliente && <span>Cliente: <strong>{cliente}</strong></span>}
          {pagamento && <span>Pagamento: <strong>{pagamento}</strong></span>}
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
          <button className="secundario" onClick={novo}>Novo recibo</button>
        </div>
      </section>
    </div>
  );
}
