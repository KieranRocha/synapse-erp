import { useUIStore } from "../../../shared/stores/uiStore";
import NovoOrcamentoWizard from "../components/forms/NovoOrcamentoWizard";

export default function NovoOrcamentoPage() {
  return (
    <div className="text-fg bg-bg ">
      <main className="  w-full ">
        <NovoOrcamentoWizard />

      </main>
    </div>
  );
}
