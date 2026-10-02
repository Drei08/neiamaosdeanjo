import { useEffect, useState } from "react";
import { excluirAtendimento, listarPorDia } from "../services/atendimentos.js";
import { formatarData, hoje, horaDe, moeda } from "../utils.js";

export default function Historico() {
  const [data, setData] = useState(hoje());
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [segundaVia, setSegundaVia] = useState(null);
  const [imprimirDia, setImprimirDia] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro("");
    listarPorDia(data)
      .then((r) => ativo && setLista(r))
      .catch(() => ativo && setErro("Não foi possível carregar o histórico."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [data]);

  // Imprime a 2ª via de um recibo ou o resumo do dia, e limpa a seleção depois
  useEffect(() => {
    if (!segundaVia && !imprimirDia) return;
    const limpar = () => {
      setSegundaVia(null);
      setImprimirDia(false);
    };
    window.addEventListener("afterprint", limpar);
    window.print();
    return () => window.removeEventListener("afterprint", limpar);
  }, [segundaVia, imprimirDia]);

  const totalDia = lista.reduce((s, a) => s + (a.total || 0), 0);

  async function excluir(a) {
    const ok = window.confirm(
      `Excluir o recibo:  ${a.cliente || "Sem nome"}  ${moeda(a.total)} ?
ESSA AÇÃO NÃO PODE SER DESFEITA!`
    );
    if (!ok) return;
    try {
      await excluirAtendimento(a.id);
      setLista((atual) => atual.filter((x) => x.id !== a.id));
    } catch {
      setErro("Não foi possível excluir o recibo. Tente de novo.");
    }
  }

  return (
    <>
      <div className="cartao no-print">
        <h2>Histórico do dia</h2>
        <label>
          Data
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </label>

        {carregando && <p className="suave">Carregando...</p>}
        {erro && <p className="erro">{erro}</p>}
        {!carregando && !erro && lista.length === 0 && (
          <p className="suave">Nenhum recibo em {formatarData(data)}.</p>
        )}

        {lista.map((a) => (
          <article key={a.id} className="item-hist">
            <header>
              <strong>
                {a.cliente || "Sem nome"} <small>{horaDe(a)}</small>
              </strong>
              <span>{moeda(a.total)}</span>
            </header>
            <ul>
              {a.itens.map((i, idx) => (
                <li key={idx}>
                  {i.servico} <span>{moeda(i.valor)}</span>
                </li>
              ))}
            </ul>
            <div className="acoes-item">
              <button className="primario pequeno" onClick={() => setSegundaVia(a)}>
                Imprimir 2ª via
              </button>
              <button className="perigo pequeno" onClick={() => excluir(a)}>
                Excluir
              </button>
            </div>
          </article>
        ))}

        <div className="total dia">
          <span>Total do dia</span>
          <strong>{moeda(totalDia)}</strong>
        </div>

        <div className="acoes">
          <button
            className="primario"
            onClick={() => setImprimirDia(true)}
            disabled={lista.length === 0}
          >
            Imprimir todos do dia
          </button>
        </div>
      </div>

      {/* Só aparece na impressão: 2ª via de um recibo */}
      {segundaVia && (
        <section className="so-impressao">
          <p className="data-hora">
            {formatarData(segundaVia.data)}
            {horaDe(segundaVia) && ` - ${horaDe(segundaVia)}`}
          </p>
          <h1>{import.meta.env.VITE_NOME_NEGOCIO || "Recibo"}</h1>
          <p>Recibo de serviços - 2ª via</p>
          <div className="linha-info">
            {segundaVia.cliente && <span>Cliente: {segundaVia.cliente}</span>}
          </div>
          <table>
            <thead>
              <tr>
                <th>Serviço</th>
                <th className="dir">Valor</th>
              </tr>
            </thead>
            <tbody>
              {segundaVia.itens.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.servico}</td>
                  <td className="dir">{moeda(i.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="total dia">
            <span>Total</span>
            <strong>{moeda(segundaVia.total)}</strong>
          </div>
          
          <div className="so-impressao assinatura">
            <span>Recebido:</span>
            <span className="linha-assinatura"></span>
          </div>
        </section>
      )}

      {/* Só aparece na impressão: resumo de todos os recibos do dia */}
      {imprimirDia && (
        <section className="so-impressao">
          <h1>{import.meta.env.VITE_NOME_NEGOCIO || "Recibo"}</h1>
          <p>Resumo do dia - {formatarData(data)}</p>
          {lista.map((a) => (
            <article key={a.id} className="item-hist">
              <header>
                <strong>
                  {a.cliente || "Sem nome"} <small>{horaDe(a)}</small>
              </strong>
                <span>{moeda(a.total)}</span>
              </header>
              <ul>
                {a.itens.map((i, idx) => (
                  <li key={idx}>
                    {i.servico} <span>{moeda(i.valor)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <div className="total dia">
            <span>Total do dia</span>
            <strong>{moeda(totalDia)}</strong>
          </div>
        </section>
      )}
    </>
  );
}