// App.tsx
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Ui/Sidebar";
import Header from "./components/Ui/Header";
import { useUIStore } from "./store/uiStore";
import { Toaster } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard Executivo", subtitle: "Visão geral dos indicadores operacionais" },
  "/vendas/orcamentos": { title: "Gestão de Orçamentos", subtitle: "Controle completo do processo de orçamentação comercial" },
  "/projetos": { title: "Gestão de Projetos", subtitle: "Acompanhe o andamento de todos os projetos em execução" },
  "/estoque": { title: "BOM & Estoque", subtitle: "Itens, materiais e estrutura de produto" },
  "/compras": { title: "Compras", subtitle: "Requisições, cotações e pedidos" },
  "/clientes": { title: "Clientes", subtitle: "Cadastro, histórico e contatos" },
  "/configuracoes": { title: "Configurações", subtitle: "Preferências e integrações" },
};

export default function App() {
  const { isDark, setIsDark, sidebarCollapsed, toggleSidebar } = useUIStore();
  const [searchTerm, setSearchTerm] = useState("");
  const { pathname } = useLocation();
  const meta = TITLES[pathname] || TITLES["/"];

  return (
    <>
      {/* Use h-screen e faça a coluna da direita rolar */}
      <div className={`flex h-screen ${isDark ? "bg-neutral-900" : "bg-white"}`}>
        {/* Sidebar fixa/estática (sticky e altura total) */}
        <div className="sticky top-0 h-screen">
          <Sidebar
            isDark={isDark}
            projetos={[]}
            orcamentos={[]}
            collapsed={sidebarCollapsed}         // 👈 novo
          />
          <button
            onClick={toggleSidebar}
            className={`absolute top-1/2 -right-5 transform -translate-y-1/2  cursor-pointer
                  p-2 rounded-full 
                  ${isDark ? "bg-neutral-900 hover:bg-neutral-800  text-neutral-100"
                : "bg-white border-neutral-300 text-neutral-700"}`}
            title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Coluna direita: header sticky + conteúdo rolável */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="sticky top-0 z-40">
            <Header
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isDark={isDark}
              setIsDark={setIsDark}
              title={meta.title}
              subtitle={meta.subtitle}
              currentPage={pathname === "/" ? "dashboard" : pathname.replace("/", "")}
            />
          </div>

          {/* Área rolável */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster
        theme={isDark ? "dark" : "light"}
        position="top-right"
        richColors
        closeButton
        swipeDirections={['left', 'right']}
      />
    </>
  );
}
