export interface Item {
  id: string;
  nome: string;
  un: string;
  qtd: number;
  preco: number;
  categoria: string;
}

export interface Fin {
  regime: 'SN' | 'LP' | 'LR';
  tipoOperacao: 'MERCADORIA' | 'SERVICO';
  cfop?: string;
  naturezaOperacao?: string;
  ncm?: string;
  cest?: string;
  nbs?: string;
  precoVenda?: number;
  descontoPct: number;
  descontoValor: number;
  frete: number;
  seguro: number;
  outrosCustos: number;
  compoeBaseICMS: boolean;
  compoeBasePisCofins: boolean;
  compoeBaseIPI: boolean;
  cst?: string;
  csosn?: string;
  origemMercadoria?: string;
  icmsAliq?: number;
  icmsRedBasePct?: number;
  icmsStMva?: number;
  icmsStAliq?: number;
  fcpAliq?: number;
  fcpStAliq?: number;
  difalAliqInter?: number;
  difalAliqInterna?: number;
  difalPartilhaDestinoPct?: number;
  ipiCst?: string;
  ipiAliq?: number;
  pisCst?: string;
  pisAliq?: number;
  cofinsCst?: string;
  cofinsAliq?: number;
  municipioIncidencia?: string;
  issAliq?: number;
  issRetido?: boolean;
  irrfAliq?: number;
  inssAliq?: number;
  csllAliq?: number;
  pisRetAliq?: number;
  cofinsRetAliq?: number;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function aliq(...vals: Array<number | undefined>): number {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return 0;
}

export class CalculadoraOrcamento {
  static computeTotals({ items, ...fin }: { items: Item[] } & Partial<Fin>) {
    const subtotal = items.reduce((s, i) => s + num(i.qtd) * num(i.preco), 0);
    const descontoPct = num(fin.descontoPct);
    const descontoValor = num(fin.descontoValor);
    const desconto1 = subtotal * (descontoPct / 100);
    const desconto2 = descontoValor;
    const descontoTotal = Math.min(subtotal, desconto1 + desconto2);
    const baseProduto = Math.max(0, subtotal - descontoTotal);

    const frete = num(fin.frete);
    const seguro = num(fin.seguro);
    const outros = num(fin.outrosCustos);
    const adicionais = frete + seguro + outros;

    const compBaseICMS = !!fin.compoeBaseICMS;
    const compBasePISCOF = !!fin.compoeBasePisCofins;
    const compBaseIPI = !!fin.compoeBaseIPI;

    const baseICMS = baseProduto + (compBaseICMS ? adicionais : 0);
    const baseIPIRaw = baseProduto + (compBaseIPI ? adicionais : 0);
    const basePISCOF = baseProduto + (compBasePISCOF ? adicionais : 0);

    const icmsAliq = aliq(fin.icmsAliq, (fin as { icmsPct?: number }).icmsPct);
    const icmsRedBasePct = aliq(fin.icmsRedBasePct);
    const icmsStMva = aliq(fin.icmsStMva);
    const icmsStAliq = aliq(fin.icmsStAliq);
    const fcpAliq = aliq(fin.fcpAliq);
    const fcpStAliq = aliq(fin.fcpStAliq);
    const ipiAliq = aliq(fin.ipiAliq);
    const pisAliq = aliq(fin.pisAliq, (fin as { pisPct?: number }).pisPct);
    const cofinsAliq = aliq(fin.cofinsAliq, (fin as { cofinsPct?: number }).cofinsPct);
    const issAliq = aliq(fin.issAliq, (fin as { issPct?: number }).issPct);
    const difalAliqInter = aliq(fin.difalAliqInter);
    const difalAliqInterna = aliq(fin.difalAliqInterna);
    const difalPartilhaDestinoPct = Math.min(100, Math.max(0, aliq(fin.difalPartilhaDestinoPct)));

    const baseICMSProp = Math.max(0, baseICMS * (1 - icmsRedBasePct / 100));

    const icmsProprio = baseICMSProp * (icmsAliq / 100);

    const baseST = baseICMSProp * (1 + icmsStMva / 100);
    const icmsSTBruto = baseST * (icmsStAliq / 100);
    const icmsST = Math.max(0, icmsSTBruto - icmsProprio);

    const fcp = baseICMSProp * (fcpAliq / 100);
    const fcpST = baseST * (fcpStAliq / 100);

    const baseIPI = baseIPIRaw;
    const ipi = baseIPI * (ipiAliq / 100);

    const pis = basePISCOF * (pisAliq / 100);
    const cofins = basePISCOF * (cofinsAliq / 100);

    const iss = fin.tipoOperacao === 'SERVICO' ? baseProduto * (issAliq / 100) : 0;

    let difal = 0,
      difalDestino = 0,
      difalOrigem = 0;
    if (difalAliqInterna > 0 && difalAliqInter > 0) {
      const difalAliqEfetiva = Math.max(0, difalAliqInterna - difalAliqInter);
      difal = baseICMSProp * (difalAliqEfetiva / 100);
      difalDestino = difal * (difalPartilhaDestinoPct / 100);
      difalOrigem = difal - difalDestino;
    }

    const totalImpostos = iss + icmsProprio + icmsST + fcp + fcpST + ipi + pis + cofins + difal;
    const total = baseProduto + adicionais + totalImpostos;

    return {
      subtotal,
      desconto1,
      desconto2,
      descontoTotal,
      base: baseProduto,
      adicionais,
      baseICMS,
      baseICMSProp,
      basePISCOF,
      baseIPI,
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
      total,
    };
  }

  static perItemImpact(items: Item[], fin: Partial<Fin>) {
    const t = CalculadoraOrcamento.computeTotals({ items, ...fin });

    const icmsAliq = aliq(fin.icmsAliq, (fin as { icmsPct?: number }).icmsPct);
    const icmsRedBasePct = aliq(fin.icmsRedBasePct);
    const icmsStMva = aliq(fin.icmsStMva);
    const icmsStAliq = aliq(fin.icmsStAliq);
    const fcpAliq = aliq(fin.fcpAliq);
    const fcpStAliq = aliq(fin.fcpStAliq);
    const ipiAliq = aliq(fin.ipiAliq);
    const pisAliq = aliq(fin.pisAliq, (fin as { pisPct?: number }).pisPct);
    const cofinsAliq = aliq(fin.cofinsAliq, (fin as { cofinsPct?: number }).cofinsPct);
    const issAliq = aliq(fin.issAliq, (fin as { issPct?: number }).issPct);

    const isServico = fin.tipoOperacao === 'SERVICO';

    const parts = items.map((it) => {
      const bruto = num(it.qtd) * num(it.preco);
      const share = t.subtotal > 0 ? bruto / t.subtotal : 0;

      const desconto = share * t.descontoTotal;
      const baseItem = Math.max(0, bruto - desconto);

      const baseICMSItem = baseItem * (1 - icmsRedBasePct / 100);
      const icmsItem = baseICMSItem * (icmsAliq / 100);

      const baseSTItem = baseICMSItem * (1 + icmsStMva / 100);
      const icmsSTBrutoItem = baseSTItem * (icmsStAliq / 100);
      const icmsSTItem = Math.max(0, icmsSTBrutoItem - icmsItem);
      const fcpItem = baseICMSItem * (fcpAliq / 100);
      const fcpSTItem = baseSTItem * (fcpStAliq / 100);

      const ipiItem = baseItem * (ipiAliq / 100);
      const pisItem = baseItem * (pisAliq / 100);
      const cofinsItem = baseItem * (cofinsAliq / 100);
      const issItem = isServico ? baseItem * (issAliq / 100) : 0;

      const totalItem =
        baseItem +
        icmsItem +
        icmsSTItem +
        fcpItem +
        fcpSTItem +
        ipiItem +
        pisItem +
        cofinsItem +
        issItem;

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
        total: totalItem,
      };
    });

    return { list: parts, totals: t };
  }
}

export const computeTotals = CalculadoraOrcamento.computeTotals;
export const perItemImpact = CalculadoraOrcamento.perItemImpact;
