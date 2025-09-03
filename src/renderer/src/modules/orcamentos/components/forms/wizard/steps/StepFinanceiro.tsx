// src/features/orcamentos/wizard/steps/StepFinanceiro.tsx
import React from "react";
import type { Fin, Regime, TipoOperacao } from "../../../../utils/types";
import { num } from "../../../../utils/utils";

const REGIMES: { value: Regime; label: string }[] = [
    { value: "SN", label: "Simples Nacional (CSOSN)" },
    { value: "LP", label: "Lucro Presumido (CST)" },
    { value: "LR", label: "Lucro Real (CST)" },
];

const TIPOS: { value: TipoOperacao; label: string }[] = [
    { value: "MERCADORIA", label: "Mercadoria (NF-e)" },
    { value: "SERVICO", label: "Serviço (NFS-e)" },
];

// exemplos de listas (pode substituir por suas tabelas)
const CSOSN = ["101", "102", "103", "201", "202", "203", "300", "400", "500", "900"];
const CST_ICMS = ["00", "10", "20", "30", "40", "41", "50", "51", "60", "70", "90"];
const ORIGENS = [
    { value: "0", label: "0 - Nacional" },
    { value: "1", label: "1 - Estrangeira - Importação direta" },
    { value: "2", label: "2 - Estrangeira - Adquirida no mercado interno" },
    { value: "3", label: "3 - Nacional, c/ +40% importado" },
    { value: "4", label: "4 - Nacional, produção conforme PPB" },
    { value: "5", label: "5 - Nacional, c/ <=40% importado" },
    { value: "6", label: "6 - Estrangeira - Importação direta, sem similar" },
    { value: "7", label: "7 - Estrangeira - Mercado interno, sem similar" },
    { value: "8", label: "8 - Nacional - Conteúdo importado >70%" },
];
const CST_IPI = ["00", "49", "50", "99"];
const CST_PIS_COF = ["01", "02", "03", "04", "06", "07", "08", "09", "49", "50", "51", "52", "53", "54", "55", "56", "60", "61", "62", "63", "64", "65", "66", "67", "70", "71", "72", "73", "74", "75", "98", "99"];

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-xs opacity-70">{children}</label>;
}

function FieldWrap({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-1">{children}</div>;
}

function Input({
    value, onChange, placeholder,
    type = "text", right,
}: {
    value: string | number; onChange: (v: string) => void; placeholder?: string;
    type?: "text" | "number"; right?: boolean;
}) {
    const cls = `px-3 py-2 rounded-xl border border-border bg-input text-fg text-sm outline-none transition focus:ring-2 focus:ring-ring/40 ${right ? "text-right" : ""}`;
    return (
        <input
            className={cls}
            value={String(value ?? "")}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            inputMode={type === "number" ? "decimal" : undefined}
            type={type}
            step={type === "number" ? "0.01" : undefined}
        />
    );
}

function Select({
    value, onChange, options, placeholder,
}: {
    value?: string; onChange: (v: string) => void;
    options: { value: string; label: string }[] | string[];
    placeholder?: string;
}) {
    const cls = "px-3 py-2 rounded-xl border border-border bg-input text-fg text-sm outline-none transition focus:ring-2 focus:ring-ring/40";
    const opts = Array.isArray(options) && typeof options[0] === "string"
        ? (options as string[]).map(v => ({ value: v, label: v }))
        : (options as { value: string; label: string }[]);
    return (
        <select className={cls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
            <option value="">{placeholder ?? "Selecione..."}</option>
            {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

function Checkbox({
    checked, onChange, label,
}: {
    checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
    return (
        <label className="inline-flex items-center gap-2 text-sm text-fg">
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            {label}
        </label>
    );
}

function Group({
    title, children, hint,
}: { title: string; children: React.ReactNode; hint?: string }) {
    return (
        <div className="bg-card border-border rounded-2xl border p-4">
            <div className="mb-3">
                <h3 className="font-semibold">{title}</h3>
                {hint && <p className="text-xs opacity-70 mt-0.5">{hint}</p>}
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

export default function StepFinanceiro({
    fin, setFin,
}: { fin: Fin; setFin: (v: Fin) => void }) {

    const set = <K extends keyof Fin>(k: K, v: Fin[K]) => setFin({ ...fin, [k]: v });

    const showMerc = fin.tipoOperacao === "MERCADORIA";
    const showServ = fin.tipoOperacao === "SERVICO";
    const isSN = fin.regime === "SN";
    const isLP_LR = fin.regime === "LP" || fin.regime === "LR";

    return (
        <section className="space-y-4">
            {/* Núcleo */}
            <Group title="Parâmetros Fiscais" hint="Defina regime, tipo de operação e classificação. Campos seguintes se adaptam a esta seleção.">
                <div className="flex flex-col md:flex-row gap-3">
                    <FieldWrap>
                        <Label>Regime tributário</Label>
                        <Select
                            value={fin.regime}
                            onChange={(v) => set("regime", v as typeof fin.regime)}
                            options={REGIMES}
                        />
                    </FieldWrap>

                    <FieldWrap>
                        <Label>Tipo de operação</Label>
                        <Select
                            value={fin.tipoOperacao}
                            onChange={(v) => set("tipoOperacao", v as typeof fin.tipoOperacao)}
                            options={TIPOS}
                        />
                    </FieldWrap>

                    <FieldWrap>
                        <Label>CFOP</Label>
                        <Input
                            value={fin.cfop ?? ""}
                            onChange={(v) => set("cfop", v)}
                            placeholder="ex.: 5102, 6108..."
                        />
                    </FieldWrap>

                    <FieldWrap>
                        <Label>Natureza da Operação</Label>
                        <Input
                            value={fin.naturezaOperacao ?? ""}
                            onChange={(v) => set("naturezaOperacao", v)}
                            placeholder="ex.: Venda dentro do estado"
                        />
                    </FieldWrap>
                </div>

                {showMerc && (
                    <div className="flex flex-col md:flex-row gap-3">
                        <FieldWrap>
                            <Label>NCM</Label>
                            <Input value={fin.ncm ?? ""} onChange={(v) => set("ncm", v)} placeholder="ex.: 8501.20.00" />
                        </FieldWrap>
                        <FieldWrap>
                            <Label>CEST</Label>
                            <Input value={fin.cest ?? ""} onChange={(v) => set("cest", v)} placeholder="opcional" />
                        </FieldWrap>
                    </div>
                )}

                {showServ && (
                    <div className="flex flex-col md:flex-row gap-3">
                        <FieldWrap>
                            <Label>NBS / Código de serviço</Label>
                            <Input value={fin.nbs ?? ""} onChange={(v) => set("nbs", v)} placeholder="ex.: 1.07 (lista municipal)" />
                        </FieldWrap>
                        <FieldWrap>
                            <Label>Município de incidência (ISS)</Label>
                            <Input value={fin.municipioIncidencia ?? ""} onChange={(v) => set("municipioIncidencia", v)} placeholder="Cidade/UF" />
                        </FieldWrap>
                    </div>
                )}
            </Group>

            {/* Valores comuns */}
            <Group title="Descontos & Acréscimos">
                <div className="grid grid-cols-3  gap-3">
                    <FieldWrap>
                        <Label>Desconto (%)</Label>
                        <Input type="number" right value={fin.descontoPct} onChange={(v) => set("descontoPct", num(v))} placeholder="0,00" />
                    </FieldWrap>
                    <FieldWrap>
                        <Label>Desconto (R$)</Label>
                        <Input type="number" right value={fin.descontoValor} onChange={(v) => set("descontoValor", num(v))} placeholder="0,00" />
                    </FieldWrap>
                    <FieldWrap>
                        <Label>Frete (R$)</Label>
                        <Input type="number" right value={fin.frete} onChange={(v) => set("frete", num(v))} placeholder="0,00" />
                    </FieldWrap>
                    <FieldWrap>
                        <Label>Seguro (R$)</Label>
                        <Input type="number" right value={fin.seguro} onChange={(v) => set("seguro", num(v))} placeholder="0,00" />
                    </FieldWrap>
                    <FieldWrap>
                        <Label>Outros (R$)</Label>
                        <Input type="number" right value={fin.outrosCustos} onChange={(v) => set("outrosCustos", num(v))} placeholder="0,00" />
                    </FieldWrap>
                </div>

                <div className="flex flex-wrap gap-4 pt-1">
                    <Checkbox checked={fin.compoeBaseICMS} onChange={(v) => set("compoeBaseICMS", v)} label="Frete/Seguro/Outros compõem base do ICMS" />
                    <Checkbox checked={fin.compoeBasePisCofins} onChange={(v) => set("compoeBasePisCofins", v)} label="Compõem base de PIS/COFINS" />
                    <Checkbox checked={fin.compoeBaseIPI} onChange={(v) => set("compoeBaseIPI", v)} label="Compõem base de IPI" />
                </div>
            </Group>

            {/* Mercadorias */}
            {showMerc && (
                <>
                    <Group title={isSN ? "ICMS (Simples Nacional)" : "ICMS / ICMS-ST"}
                        hint={isSN ? "Use CSOSN; ST/FCP quando aplicável por UF/CFOP." : "Para LP/LR use CST. Configure ST/MVA/FCP se a operação exigir."}>
                        <div className="flex flex-col md:flex-row gap-3">
                            {isSN ? (
                                <FieldWrap>
                                    <Label>CSOSN</Label>
                                    <Select value={fin.csosn} onChange={(v) => set("csosn", v)} options={CSOSN} />
                                </FieldWrap>
                            ) : (
                                <FieldWrap>
                                    <Label>CST (ICMS)</Label>
                                    <Select value={fin.cst} onChange={(v) => set("cst", v)} options={CST_ICMS} />
                                </FieldWrap>
                            )}
                            <FieldWrap>
                                <Label>Origem da mercadoria</Label>
                                <Select
                                    value={fin.origemMercadoria ?? ""}
                                    onChange={(v) => set("origemMercadoria", v)}
                                    options={ORIGENS}
                                />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>ICMS (%)</Label>
                                <Input type="number" right value={fin.icmsAliq ?? 0} onChange={(v) => set("icmsAliq", num(v))} placeholder="ex.: 18,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>Redução de base (%)</Label>
                                <Input type="number" right value={fin.icmsRedBasePct ?? 0} onChange={(v) => set("icmsRedBasePct", num(v))} placeholder="0,00" />
                            </FieldWrap>
                        </div>

                        {/* ST / FCP / DIFAL */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <FieldWrap>
                                <Label>MVA ST (%)</Label>
                                <Input type="number" right value={fin.icmsStMva ?? 0} onChange={(v) => set("icmsStMva", num(v))} placeholder="0,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>ICMS ST (%)</Label>
                                <Input type="number" right value={fin.icmsStAliq ?? 0} onChange={(v) => set("icmsStAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>FCP (%)</Label>
                                <Input type="number" right value={fin.fcpAliq ?? 0} onChange={(v) => set("fcpAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>FCP ST (%)</Label>
                                <Input type="number" right value={fin.fcpStAliq ?? 0} onChange={(v) => set("fcpStAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            <FieldWrap>
                                <Label>DIFAL — Alíquota interestadual (%)</Label>
                                <Input type="number" right value={fin.difalAliqInter ?? 0} onChange={(v) => set("difalAliqInter", num(v))} placeholder="ex.: 12,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>DIFAL — Alíquota interna destino (%)</Label>
                                <Input type="number" right value={fin.difalAliqInterna ?? 0} onChange={(v) => set("difalAliqInterna", num(v))} placeholder="ex.: 18,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>DIFAL — Partilha destino (%)</Label>
                                <Input type="number" right value={fin.difalPartilhaDestinoPct ?? 0} onChange={(v) => set("difalPartilhaDestinoPct", num(v))} placeholder="ex.: 100,00" />
                            </FieldWrap>
                        </div>
                    </Group>

                    <Group title="IPI">
                        <div className="flex flex-col md:flex-row gap-3">
                            <FieldWrap>
                                <Label>CST (IPI)</Label>
                                <Select value={fin.ipiCst} onChange={(v) => set("ipiCst", v)} options={CST_IPI} />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>IPI (%)</Label>
                                <Input type="number" right value={fin.ipiAliq ?? 0} onChange={(v) => set("ipiAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                        </div>
                    </Group>

                    <Group title="PIS / COFINS">
                        <div className="flex flex-col md:flex-row gap-3">
                            <FieldWrap>
                                <Label>CST (PIS)</Label>
                                <Select value={fin.pisCst} onChange={(v) => set("pisCst", v)} options={CST_PIS_COF} />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>Alíquota PIS (%)</Label>
                                <Input type="number" right value={fin.pisAliq ?? 0} onChange={(v) => set("pisAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>CST (COFINS)</Label>
                                <Select value={fin.cofinsCst} onChange={(v) => set("cofinsCst", v)} options={CST_PIS_COF} />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>Alíquota COFINS (%)</Label>
                                <Input type="number" right value={fin.cofinsAliq ?? 0} onChange={(v) => set("cofinsAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                        </div>
                    </Group>
                </>
            )}

            {/* Serviços */}
            {showServ && (
                <>
                    <Group title="ISS (Serviços)"
                        hint="Defina a alíquota, município de incidência e se há retenção pelo tomador.">
                        <div className="flex flex-col md:flex-row gap-3">
                            <FieldWrap>
                                <Label>Alíquota ISS (%)</Label>
                                <Input type="number" right value={fin.issAliq ?? 0} onChange={(v) => set("issAliq", num(v))} placeholder="ex.: 5,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>ISS retido pelo tomador?</Label>
                                <Select
                                    value={fin.issRetido ? "S" : "N"}
                                    onChange={(v) => set("issRetido", v === "S")}
                                    options={[
                                        { value: "N", label: "Não" },
                                        { value: "S", label: "Sim" },
                                    ]}
                                />
                            </FieldWrap>
                        </div>
                    </Group>

                    <Group title="Retenções Federais (quando aplicável)"
                        hint="Normalmente para LP/LR. MEI e parte do SN costumam ser isentos.">
                        <div className="flex flex-col md:flex-row gap-3">
                            <FieldWrap>
                                <Label>IRRF (%)</Label>
                                <Input type="number" right value={fin.irrfAliq ?? 0} onChange={(v) => set("irrfAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>INSS (%)</Label>
                                <Input type="number" right value={fin.inssAliq ?? 0} onChange={(v) => set("inssAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>CSLL (%)</Label>
                                <Input type="number" right value={fin.csllAliq ?? 0} onChange={(v) => set("csllAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            <FieldWrap>
                                <Label>PIS retido (%)</Label>
                                <Input type="number" right value={fin.pisRetAliq ?? 0} onChange={(v) => set("pisRetAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                            <FieldWrap>
                                <Label>COFINS retido (%)</Label>
                                <Input type="number" right value={fin.cofinsRetAliq ?? 0} onChange={(v) => set("cofinsRetAliq", num(v))} placeholder="0,00" />
                            </FieldWrap>
                        </div>
                    </Group>
                </>
            )}
        </section>
    );
}
