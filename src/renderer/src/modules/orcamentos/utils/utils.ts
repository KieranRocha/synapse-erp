// utils.ts
import type { Item, Fin } from './types'

/* ===== Helpers ===== */
export const currency = (v: number = 0) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const pct = (v: number = 0) => `${v.toFixed(2)}%`

export const num = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/* Pequeno helper para ler alíquotas com retrocompat (ex.: issAliq || issPct) */
function aliq(...vals: Array<number | undefined>): number {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return 0
}

/**
 * computeTotals
 * - Recebe: { items, ...fin }
 * - Calcula: subtotal, descontos, bases (produto/ICMS/PIS-COFINS/IPI), impostos (ICMS, ST, FCP, FCP-ST, IPI, PIS, COFINS, ISS, DIFAL),
 *   adicionais (frete+seguro+outros) e total final.
 *
 * Observações:
 * - ICMS próprio: baseICMS após redução de base (icmsRedBasePct)
 * - ST: baseST = baseICMSProp * (1 + MVA); ICMS-ST = max(0, (baseST * aliqST) - ICMS próprio)
 * - DIFAL: (aliqInterna - aliqInterestadual) sobre baseICMSProp, com partilha destino
 * - PIS/COFINS e IPI usam suas respectivas bases conforme as flags de composição
 * - ISS só aplica quando tipoOperacao === "SERVICO"
 */
export function computeTotals({ items, ...fin }: { items: Item[] } & Partial<Fin>) {
  /* Subtotal e descontos */
  const subtotal = items.reduce((s, i) => s + num(i.qtd) * num(i.preco), 0)
  const descontoPct = num(fin.descontoPct)
  const descontoValor = num(fin.descontoValor)
  const desconto1 = subtotal * (descontoPct / 100)
  const desconto2 = descontoValor
  const descontoTotal = Math.min(subtotal, desconto1 + desconto2)
  const baseProduto = Math.max(0, subtotal - descontoTotal)

  /* Acréscimos */
  const frete = num(fin.frete)
  const seguro = num(fin.seguro)
  const outros = num(fin.outrosCustos)
  const adicionais = frete + seguro + outros

  /* Flags de composição de base */
  const compBaseICMS = !!fin.compoeBaseICMS
  const compBasePISCOF = !!fin.compoeBasePisCofins
  const compBaseIPI = !!fin.compoeBaseIPI

  /* Bases */
  const baseICMS = baseProduto + (compBaseICMS ? adicionais : 0)
  const baseIPIRaw = baseProduto + (compBaseIPI ? adicionais : 0)
  const basePISCOF = baseProduto + (compBasePISCOF ? adicionais : 0)

  /* Alíquotas (com retrocompat) */
  const icmsAliq = aliq(fin.icmsAliq, (fin as { icmsPct?: number }).icmsPct)
  const icmsRedBasePct = aliq(fin.icmsRedBasePct)
  const icmsStMva = aliq(fin.icmsStMva)
  const icmsStAliq = aliq(fin.icmsStAliq)
  const fcpAliq = aliq(fin.fcpAliq)
  const fcpStAliq = aliq(fin.fcpStAliq)
  const ipiAliq = aliq(fin.ipiAliq)
  const pisAliq = aliq(fin.pisAliq, (fin as { pisPct?: number }).pisPct)
  const cofinsAliq = aliq(fin.cofinsAliq, (fin as { cofinsPct?: number }).cofinsPct)
  const issAliq = aliq(fin.issAliq, (fin as { issPct?: number }).issPct)
  const difalAliqInter = aliq(fin.difalAliqInter)
  const difalAliqInterna = aliq(fin.difalAliqInterna)
  const difalPartilhaDestinoPct = Math.min(100, Math.max(0, aliq(fin.difalPartilhaDestinoPct)))

  /* Redução de base do ICMS (aplica no próprio e na ST) */
  const baseICMSProp = Math.max(0, baseICMS * (1 - icmsRedBasePct / 100))

  /* ICMS próprio */
  const icmsProprio = baseICMSProp * (icmsAliq / 100)

  /* ICMS-ST */
  const baseST = baseICMSProp * (1 + icmsStMva / 100)
  const icmsSTBruto = baseST * (icmsStAliq / 100)
  const icmsST = Math.max(0, icmsSTBruto - icmsProprio)

  /* FCP e FCP-ST */
  const fcp = baseICMSProp * (fcpAliq / 100)
  const fcpST = baseST * (fcpStAliq / 100)

  /* IPI */
  const baseIPI = baseIPIRaw // (no Brasil, a regra pode variar; aqui seguimos a flag compoeBaseIPI)
  const ipi = baseIPI * (ipiAliq / 100)

  /* PIS / COFINS */
  const pis = basePISCOF * (pisAliq / 100)
  const cofins = basePISCOF * (cofinsAliq / 100)

  /* ISS (somente para serviço) */
  const iss = fin.tipoOperacao === 'SERVICO' ? baseProduto * (issAliq / 100) : 0

  /* DIFAL */
  let difal = 0,
    difalDestino = 0,
    difalOrigem = 0
  if (difalAliqInterna > 0 && difalAliqInter > 0) {
    const difalAliqEfetiva = Math.max(0, difalAliqInterna - difalAliqInter)
    difal = baseICMSProp * (difalAliqEfetiva / 100)
    difalDestino = difal * (difalPartilhaDestinoPct / 100)
    difalOrigem = difal - difalDestino
  }

  /* Total de impostos e total final (visão orçamentária) */
  const totalImpostos = iss + icmsProprio + icmsST + fcp + fcpST + ipi + pis + cofins + difal
  const total = baseProduto + adicionais + totalImpostos

  return {
    /* bases e descontos */
    subtotal,
    desconto1,
    desconto2,
    descontoTotal,
    base: baseProduto,
    adicionais,

    /* bases por tributo (úteis para debug/relatórios) */
    baseICMS,
    baseICMSProp,
    basePISCOF,
    baseIPI,

    /* impostos */
    icmsProprio,
    icmsST,
    fcp,
    fcpST,
    ipi,
    pis,
    cofins,
    iss,
    difal,
    difalDestino,
    difalOrigem,

    /* total final */
    total
  }
}

/**
 * perItemImpact
 * - Rateia o desconto proporcionalmente ao bruto do item
 * - Calcula tributos do item usando as MESMAS alíquotas (sem ratear frete/seguro/outros)
 * - Mantém coerência com computeTotals (sem ICMS de frete, etc., em nível de item)
 */
export function perItemImpact(items: Item[], fin: Partial<Fin>) {
  const t = computeTotals({ items, ...fin })

  const icmsAliq = aliq(fin.icmsAliq, (fin as { icmsPct?: number }).icmsPct)
  const icmsRedBasePct = aliq(fin.icmsRedBasePct)
  const icmsStMva = aliq(fin.icmsStMva)
  const icmsStAliq = aliq(fin.icmsStAliq)
  const fcpAliq = aliq(fin.fcpAliq)
  const fcpStAliq = aliq(fin.fcpStAliq)
  const ipiAliq = aliq(fin.ipiAliq)
  const pisAliq = aliq(fin.pisAliq, (fin as { pisPct?: number }).pisPct)
  const cofinsAliq = aliq(fin.cofinsAliq, (fin as { cofinsPct?: number }).cofinsPct)
  const issAliq = aliq(fin.issAliq, (fin as { issPct?: number }).issPct)

  const isServico = fin.tipoOperacao === 'SERVICO'

  const parts = items.map((it) => {
    const bruto = num(it.qtd) * num(it.preco)
    const share = t.subtotal > 0 ? bruto / t.subtotal : 0

    // desconto proporcional e base do item (sem ratear frete/seguro/outros)
    const desconto = share * t.descontoTotal
    const baseItem = Math.max(0, bruto - desconto)

    // ICMS próprio no item
    const baseICMSItem = baseItem * (1 - icmsRedBasePct / 100)
    const icmsItem = baseICMSItem * (icmsAliq / 100)

    // ST e FCP no item
    const baseSTItem = baseICMSItem * (1 + icmsStMva / 100)
    const icmsSTBrutoItem = baseSTItem * (icmsStAliq / 100)
    const icmsSTItem = Math.max(0, icmsSTBrutoItem - icmsItem)
    const fcpItem = baseICMSItem * (fcpAliq / 100)
    const fcpSTItem = baseSTItem * (fcpStAliq / 100)

    // IPI / PIS / COFINS / ISS no item (sem acréscimos rateados)
    const ipiItem = baseItem * (ipiAliq / 100)
    const pisItem = baseItem * (pisAliq / 100)
    const cofinsItem = baseItem * (cofinsAliq / 100)
    const issItem = isServico ? baseItem * (issAliq / 100) : 0

    const totalItem =
      baseItem +
      icmsItem +
      icmsSTItem +
      fcpItem +
      fcpSTItem +
      ipiItem +
      pisItem +
      cofinsItem +
      issItem

    return {
      id: it.id,
      nome: it.nome || 'Item',
      categoria: it.categoria,
      bruto,
      share,
      desconto,
      base: baseItem,
      icms: icmsItem,
      icmsST: icmsSTItem,
      fcp: fcpItem,
      fcpST: fcpSTItem,
      ipi: ipiItem,
      pis: pisItem,
      cofins: cofinsItem,
      iss: issItem,
      total: totalItem
    }
  })

  return { list: parts, totals: t }
}
