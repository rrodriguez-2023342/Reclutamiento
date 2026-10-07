import { FileText } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";

function Informes() {
  return (
    <DashboardLayout title="Informes y docs">
      <section className="rounded-[26px] bg-white p-10 text-center shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0f4fa] text-[#3162e9]">
          <FileText className="h-8 w-8" strokeWidth={2} />
        </div>
        <h2 className="mt-5 text-xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-2xl">
          Informes y docs
        </h2>
        <p className="mt-3 text-base text-[#5b6e8b]">
          Esta vista estará disponible próximamente.
        </p>
      </section>
    </DashboardLayout>
  );
}

export default Informes;
