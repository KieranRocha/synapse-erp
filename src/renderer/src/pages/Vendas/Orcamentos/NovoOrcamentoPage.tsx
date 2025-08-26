import { useUIStore } from "../../../store/uiStore";
import ToastViewport from "../../../components/Ui/ToastViewport";
import NovoOrcamentoWizard from "../../../features/orcamentos/NovoOrcamentoWizard";

export default function NovoOrcamentoPage() {
  const { isDark } = useUIStore();
  return (
    <div className="text-fg bg-bg ">
      <main className="  w-full ">
        <NovoOrcamentoWizard />

      </main>
      <ToastViewport />
    </div>
  );
}