import { useUIStore } from "../../../store/uiStore";
import ToastViewport from "../../../components/Ui/ToastViewport";
import NovoOrcamentoWizard from "../../../features/orcamentos/NovoOrcamentoWizard";

export default function NovoOrcamentoPage() {
  const { isDark } = useUIStore();
  return (
    <div className={isDark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}>
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
        <NovoOrcamentoWizard />
        <div className="text-xs opacity-70 mt-6">
          *Mock — Validações adicionais sugeridas: numeração única, regras de status, integração com Estoque/Compras, upload de documentos.
        </div>
      </main>
      <ToastViewport />
    </div>
  );
}