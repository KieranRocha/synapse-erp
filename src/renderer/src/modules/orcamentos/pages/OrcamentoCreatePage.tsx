import { useUIStore } from "../../../shared/stores/uiStore";
import ToastViewport from "../../../shared/components/feedback/ToastViewport";
import NovoOrcamentoWizard from "../components/forms/NovoOrcamentoWizard";

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
