// routes.tsx
import { RouteObject } from "react-router-dom";
import AuthLogin from "../../pages/Auth/Login";
import App from "../layout/App";
import BeautifulPage from "../../pages/BeautifulPage/BeautifulPage"; // placeholder estiloso
import { AuthGuard, GuestGuard } from "../../shared/components/auth/AuthGuard";

// Import from new module structure
import { 
  OrcamentosListPage, 
  OrcamentoCreatePage,
  OrcamentoDetailPage,
  OrcamentoEditPage 
} from '../../modules/orcamentos/pages'

import { 
  ClientesListPage, 
  ClienteCreatePage 
} from '../../modules/clientes/pages'

import DatabaseTestPage from "../../pages/Debug/DatabaseTestPage";
export const routes: RouteObject[] = [
    // Rotas fora do layout (ex.: auth) - apenas para usuários não logados
    { 
        path: "/auth/login", 
        element: (
            <GuestGuard>
                <AuthLogin />
            </GuestGuard>
        ) 
    },

    // Rotas com layout persistente (Sidebar + Header ficam em <App />) - protegidas por autenticação
    {
        path: "/",
        element: (
            <AuthGuard>
                <App />
            </AuthGuard>
        ), // <App /> precisa ter <Outlet />
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
            { path: "vendas/orcamentos", element: <OrcamentosListPage /> },
            { path: "vendas/orcamentos/novo", element: <OrcamentoCreatePage /> },
            { path: "vendas/orcamentos/:id", element: <OrcamentoDetailPage /> },
            { path: "vendas/orcamentos/:id/editar", element: <OrcamentoEditPage /> },
            { path: "clientes", element: <ClientesListPage /> },
            { path: "clientes/novo", element: <ClienteCreatePage /> },
            { path: "projetos", element: <BeautifulPage title="Projetos" subtitle="Planejamento, produção, instalação e entrega." /> },
            { path: "estoque", element: <BeautifulPage title="BOM & Estoque" subtitle="Materiais, itens e estrutura de produto." /> },
            { path: "compras", element: <BeautifulPage title="Compras" subtitle="Requisições, cotações e pedidos de compra." /> },
            { path: "configuracoes", element: <BeautifulPage title="Configurações" subtitle="Preferências, integrações e segurança." /> },
            { path: "debug", element: <DatabaseTestPage /> },
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
