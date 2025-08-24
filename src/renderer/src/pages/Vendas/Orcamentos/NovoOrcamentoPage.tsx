import { useUIStore } from "../../../store/uiStore";
import ToastViewport from "../../../components/Ui/ToastViewport";
import NovoOrcamentoWizard from "../../../features/orcamentos/NovoOrcamentoWizard";

export default function NovoOrcamentoPage() {
  const { isDark } = useUIStore();
  return (
    <div className={isDark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}>
      <main className="  w-full ">
        <NovoOrcamentoWizard />
        <div className="text-xs opacity-70 mt-6">
          *Mock — Validações adicionais sugeridas: numeração única, regras de status, integração com Estoque/Compras, upload de documentos.
        </div>
      </main>
      <ToastViewport />
    </div>
  );
}