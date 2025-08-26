// routes.tsx
import { RouteObject } from "react-router-dom";
import AuthLogin from "./pages/Auth/Login";
import App from "./App";
import BeautifulPage from "./pages/BeautifulPage/BeautifulPage"; // placeholder estiloso
import OrcamentosPage from "./pages/Vendas/Orcamentos/OrcamentosPage";
import NovoOrcamentoPage from "./pages/Vendas/Orcamentos/NovoOrcamentoPage";
import OrcamentoDetalhePage from "./pages/Vendas/Orcamentos/OrcamentoDetalhePage";
import OrcamentoEdicaoPage from "./pages/Vendas/Orcamentos/OrcamentoEdicaoPage";
import NovoClientePage from "./pages/Clientes/NovoClientePage";
export const routes: RouteObject[] = [
    // Rotas fora do layout (ex.: auth)
    { path: "/auth/login", element: <AuthLogin /> },

    // Rotas com layout persistente (Sidebar + Header ficam em <App />)
    {
        path: "/",
        element: <App />, // <App /> precisa ter <Outlet />
        children: [
            {
                index: true,
                element: (
                    <BeautifulPage
                        title="Dashboard"
                        subtitle="Visão geral e atalhos rápidos do ERP."
                        showHome={false}
                    />
                ),
            },
            { path: "vendas/orcamentos", element: <OrcamentosPage /> },
            { path: "vendas/orcamentos/novo", element: <NovoOrcamentoPage /> },
            { path: "vendas/orcamentos/detalhe", element: <OrcamentoDetalhePage /> },
            { path: "vendas/orcamentos/editar", element: <OrcamentoEdicaoPage /> },
            { path: "clientes/novo", element: <NovoClientePage /> },
            { path: "projetos", element: <BeautifulPage title="Projetos" subtitle="Planejamento, produção, instalação e entrega." /> },
            { path: "estoque", element: <BeautifulPage title="BOM & Estoque" subtitle="Materiais, itens e estrutura de produto." /> },
            { path: "compras", element: <BeautifulPage title="Compras" subtitle="Requisições, cotações e pedidos de compra." /> },
            { path: "clientes", element: <BeautifulPage title="Clientes" subtitle="Cadastro, histórico e contatos." /> },
            { path: "configuracoes", element: <BeautifulPage title="Configurações" subtitle="Preferências, integrações e segurança." /> },
        ],
    },

    // 404 fora do layout (ou mova para dentro se quiser manter Header/Sidebar também no 404)
    {
        path: "*",
        element: (
            <BeautifulPage
                title="Página não encontrada"
                subtitle="O caminho que você tentou acessar não existe."
                backTo={-1}
                showHome
            />
        ),
    },
];
