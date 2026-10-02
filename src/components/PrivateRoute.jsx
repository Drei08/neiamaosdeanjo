import { Navigate, Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function PrivateRoute() {
  const { user, carregando, logout } = useAuth();

  if (carregando) return <p className="centro">Carregando...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <header className="topo no-print">
        <strong>{import.meta.env.VITE_NOME_NEGOCIO || "Recibos"}</strong>
        <nav>
          <NavLink to="/home" end>Novo Recibo</NavLink>
          <NavLink to="/historico">Histórico</NavLink>
          <button className="link" onClick={logout}>Sair</button>
        </nav>
      </header>
      <main className="pagina">
        <Outlet />
      </main>
    </>
  );
}
