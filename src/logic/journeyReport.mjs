/**
 * AnswerForU mobile 3.7.1 (tester item 8 — "Word at minimum, Excel preferred"): the journey
 * progress report, shared from the Journey screen as an Excel workbook or a Word document.
 * Same sheets and sections as the website report (v6.4.2); the model reads the app's own
 * journey state (progress, checklist keys `${stepId}::${itemId}`, personal items).
 */
import { formatDisplayDate, todayISO } from './dates.mjs';
import { stateLabel } from './usStates.mjs';

const tr = (lang, ar, en, es) => (lang === 'ar' ? ar : lang === 'es' ? es : en);
const pick = (v, lang) => (typeof v === 'string' ? v : v && typeof v === 'object' ? String(v[lang] || v.en || v.ar || '') : '');
const statusOf = (progress, id) => { const v = progress?.[id]; return (typeof v === 'object' ? v?.status : v) || 'todo'; };
export const STATUS_LABELS = {
  done: ['مكتملة', 'Done', 'Completado'],
  doing: ['قيد التنفيذ', 'In progress', 'En curso'],
  todo: ['لم تبدأ', 'Not started', 'Sin empezar'],
};
const checklistId = (x, i) => String(x?.id ?? x?.key ?? i);
const checklistLabel = (x, lang) => (typeof x === 'string' ? x : pick(x?.title || x?.label || x, lang));

export function journeyReportModel({ stages = [], progress = {}, checklist = {}, customItems = [], profile = {}, lang = 'ar', date = new Date() } = {}) {
  let stepsDone = 0; let stepsTotal = 0; let itemsDoneAll = 0; let itemsTotalAll = 0;
  const stageModels = (stages || []).map((stage, si) => {
    let stageDone = 0; let stageTotal = 0;
    const steps = (stage?.steps || []).map((step, i) => {
      const items = (step.checklist || []).map((x, k) => {
        const key = `${step.id}::${checklistId(x, k)}`;
        return { group: '', text: checklistLabel(x, lang), done: Boolean(checklist?.[key]?.done ?? checklist?.[key]?.is_done), personal: false };
      });
      for (const x of (customItems || []).filter((c) => String(c.step_id ?? c.stepId) === String(step.id))) {
        items.push({ group: '', text: String(x.title || ''), done: Boolean(x.is_done ?? x.done), personal: true });
      }
      const itemsDone = items.filter((x) => x.done).length;
      const raw = statusOf(progress, step.id);
      const status = raw === 'done' ? 'done' : raw === 'doing' || itemsDone > 0 ? 'doing' : 'todo';
      stepsTotal += 1; if (status === 'done') stepsDone += 1;
      stageDone += itemsDone; stageTotal += items.length;
      return {
        number: `${si + 1}.${i + 1}`,
        title: pick(step.title, lang),
        status,
        statusLabel: tr(lang, ...STATUS_LABELS[status]),
        important: step.priority === 'critical' || step.priority === 'high',
        itemsDone,
        itemsTotal: items.length,
        percent: items.length ? Math.round((itemsDone / items.length) * 100) : status === 'done' ? 100 : 0,
        items,
      };
    });
    itemsDoneAll += stageDone; itemsTotalAll += stageTotal;
    return {
      number: si + 1,
      title: pick(stage?.title, lang),
      stepsDone: steps.filter((s) => s.status === 'done').length,
      stepsTotal: steps.length,
      itemsDone: stageDone,
      itemsTotal: stageTotal,
      percent: stageTotal ? Math.round((stageDone / stageTotal) * 100) : 0,
      steps,
    };
  });
  const iso = date instanceof Date && !Number.isNaN(date.getTime()) ? todayISO(date) : todayISO();
  const code = String(profile?.state_code || '').toUpperCase();
  return {
    lang,
    date: iso,
    dateLabel: formatDisplayDate(iso, lang),
    stateLabel: code ? `${stateLabel(code, lang)} (${code})` : tr(lang, 'لم تحدد ولاية بعد', 'No state chosen yet', 'Aún sin estado'),
    overall: { itemsDone: itemsDoneAll, itemsTotal: itemsTotalAll, percent: itemsTotalAll ? Math.round((itemsDoneAll / itemsTotalAll) * 100) : 0, stepsDone, stepsTotal },
    stages: stageModels,
  };
}

function labels(lang) {
  return {
    title: tr(lang, "تقرير رحلتي في أمريكا", "My U.S. journey — progress report", "Mi ruta en EE. UU. — informe de progreso"),
    date: tr(lang, "تاريخ التقرير", "Report date", "Fecha del informe"),
    state: tr(lang, "الولاية", "State", "Estado"),
    items: tr(lang, "المهام المكتملة", "Checklist items done", "Tareas completadas"),
    steps: tr(lang, "الخطوات المكتملة", "Steps completed", "Pasos completados"),
    of: tr(lang, "من", "of", "de"),
    summary: tr(lang, "ملخص", "Summary", "Resumen"),
    stagesSummary: tr(lang, "ملخص المراحل", "Stages at a glance", "Resumen de etapas"),
    stepsSheet: tr(lang, "الخطوات", "Steps", "Pasos"),
    checklistSheet: tr(lang, "قائمة المهام", "Checklist", "Lista de tareas"),
    stage: tr(lang, "المرحلة", "Stage", "Etapa"),
    step: tr(lang, "الخطوة", "Step", "Paso"),
    status: tr(lang, "الحالة", "Status", "Estado"),
    importance: tr(lang, "الأهمية", "Priority", "Prioridad"),
    important: tr(lang, "مهمة", "High impact", "Importante"),
    stepCount: tr(lang, "عدد الخطوات", "Steps", "Pasos"),
    stepsDone: tr(lang, "خطوات مكتملة", "Steps done", "Pasos listos"),
    itemsDone: tr(lang, "مهام مكتملة", "Items done", "Tareas listas"),
    itemsTotal: tr(lang, "إجمالي المهام", "Total items", "Total de tareas"),
    percent: tr(lang, "النسبة", "Progress", "Progreso"),
    total: tr(lang, "الإجمالي", "Total", "Total"),
    group: tr(lang, "المجموعة", "Group", "Grupo"),
    item: tr(lang, "المهمة", "Item", "Tarea"),
    doneCol: tr(lang, "تمت؟", "Done?", "¿Hecha?"),
    yes: tr(lang, "✓ تمت", "✓ Done", "✓ Hecha"),
    no: tr(lang, "لم تتم", "Not yet", "Pendiente"),
    source: tr(lang, "المصدر", "Source", "Origen"),
    guide: tr(lang, "من الدليل", "Guide", "Guía"),
    personal: tr(lang, "مهمة شخصية", "Personal", "Personal"),
    personalTag: tr(lang, "(شخصية)", "(personal)", "(personal)"),
    checklist: tr(lang, "قائمة المهام", "Checklist", "Lista de tareas"),
    none: tr(lang, "لا توجد مهام لهذه الخطوة", "No checklist for this step", "Este paso no tiene tareas"),
    note: tr(lang,
      "هذا التقرير للمتابعة الشخصية. راجع الجهة الرسمية قبل أي إجراء أو دفع رسوم.",
      "This report is for personal tracking. Confirm details with the official agency before you act or pay any fee.",
      "Este informe es para su seguimiento personal. Confirme con la agencia oficial antes de actuar o pagar."),
  };
}

export function journeyWorkbook(model) {
  const L = labels(model.lang);
  const rtl = model.lang === "ar";
  const o = model.overall;
  const progressLine = `${L.items}: ${o.itemsDone} ${L.of} ${o.itemsTotal} (${o.percent}%) · ${L.steps}: ${o.stepsDone} ${L.of} ${o.stepsTotal}`;
  const summaryRows = [
    [{ v: L.title, s: "title" }],
    [{ v: `${L.date}: ${model.dateLabel} · ${L.state}: ${model.stateLabel}`, s: "muted" }],
    [{ v: progressLine, s: "muted" }],
    [],
    ["#", L.stage, L.stepCount, L.stepsDone, L.itemsDone, L.itemsTotal, L.percent].map((v) => ({ v, s: "header" })),
    ...model.stages.map((stage) => [
      { v: stage.number, s: "int" },
      stage.title,
      { v: stage.stepsTotal, s: "int" },
      { v: stage.stepsDone, s: "int" },
      { v: stage.itemsDone, s: "int" },
      { v: stage.itemsTotal, s: "int" },
      { v: stage.itemsTotal ? stage.itemsDone / stage.itemsTotal : 0, s: "percent" },
    ]),
    [
      { v: "", s: "bold" },
      { v: L.total, s: "bold" },
      { v: o.stepsTotal, s: "int" },
      { v: o.stepsDone, s: "int" },
      { v: o.itemsDone, s: "int" },
      { v: o.itemsTotal, s: "int" },
      { v: o.itemsTotal ? o.itemsDone / o.itemsTotal : 0, s: "percent" },
    ],
    [],
    [{ v: L.note, s: "muted" }],
  ];
  const stepRows = [
    [L.stage, "#", L.step, L.status, L.importance, L.itemsDone, L.itemsTotal, L.percent].map((v) => ({ v, s: "header" })),
    ...model.stages.flatMap((stage) => stage.steps.map((step) => [
      stage.title,
      { v: step.number, s: "center" },
      step.title,
      { v: step.statusLabel, s: step.status === "done" ? "done" : step.status === "doing" ? "doing" : "text" },
      step.important ? L.important : "",
      { v: step.itemsDone, s: "int" },
      { v: step.itemsTotal, s: "int" },
      { v: step.itemsTotal ? step.itemsDone / step.itemsTotal : 0, s: "percent" },
    ])),
  ];
  const checklistRows = [
    [L.stage, L.step, L.group, L.item, L.doneCol, L.source].map((v) => ({ v, s: "header" })),
    ...model.stages.flatMap((stage) => stage.steps.flatMap((step) => step.items.map((item) => [
      stage.title,
      `${step.number} ${step.title}`,
      item.group,
      item.text,
      { v: item.done ? L.yes : L.no, s: item.done ? "done" : "center" },
      item.personal ? L.personal : L.guide,
    ]))),
  ];
  const lastSummaryCol = "G";
  return {
    title: L.title,
    sheets: [
      { name: L.summary, rtl, rows: summaryRows, freezeRows: 5, merges: [`A1:${lastSummaryCol}1`, `A2:${lastSummaryCol}2`, `A3:${lastSummaryCol}3`, `A${summaryRows.length}:${lastSummaryCol}${summaryRows.length}`], columns: [{ width: 6 }, { width: 46 }, { width: 13 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 11 }] },
      { name: L.stepsSheet, rtl, rows: stepRows, freezeRows: 1, autoFilterRow: 1, columns: [{ width: 34 }, { width: 7 }, { width: 44 }, { width: 14 }, { width: 13 }, { width: 12 }, { width: 13 }, { width: 10 }] },
      { name: L.checklistSheet, rtl, rows: checklistRows, freezeRows: 1, autoFilterRow: 1, columns: [{ width: 30 }, { width: 36 }, { width: 26 }, { width: 58 }, { width: 12 }, { width: 14 }] },
    ],
  };
}

export function journeyDocument(model) {
  const L = labels(model.lang);
  const o = model.overall;
  const blocks = [
    { type: "title", text: L.title },
    { type: "meta", text: `${L.date}: ${model.dateLabel} · ${L.state}: ${model.stateLabel}` },
    { type: "meta", text: `${L.items}: ${o.itemsDone} ${L.of} ${o.itemsTotal} (${o.percent}%) · ${L.steps}: ${o.stepsDone} ${L.of} ${o.stepsTotal}` },
    { type: "heading", text: L.stagesSummary },
    {
      type: "table",
      headers: ["#", L.stage, L.stepsDone, L.itemsDone, L.percent],
      widths: [0.6, 6, 1.8, 1.8, 1.4],
      rows: model.stages.map((stage) => [
        String(stage.number),
        stage.title,
        `${stage.stepsDone}/${stage.stepsTotal}`,
        `${stage.itemsDone}/${stage.itemsTotal}`,
        { text: `${stage.percent}%`, tone: stage.itemsTotal && stage.itemsDone === stage.itemsTotal ? "done" : undefined },
      ]),
    },
  ];
  for (const stage of model.stages) {
    blocks.push({ type: "heading", text: `${stage.number}. ${stage.title}` });
    blocks.push({ type: "paragraph", text: `${L.stepsDone}: ${stage.stepsDone} ${L.of} ${stage.stepsTotal} · ${L.itemsDone}: ${stage.itemsDone} ${L.of} ${stage.itemsTotal} (${stage.percent}%)` });
    blocks.push({
      type: "table",
      headers: [L.step, L.status, L.checklist],
      widths: [3.2, 1.5, 6],
      rows: stage.steps.map((step) => {
        const lines = [];
        let lastGroup = "";
        for (const item of step.items) {
          if (item.group && item.group !== lastGroup) lines.push(`▸ ${item.group}`);
          lastGroup = item.group;
          lines.push(`${item.group ? "◦ " : ""}${item.done ? "☑" : "☐"} ${item.text}${item.personal ? ` ${L.personalTag}` : ""}`);
        }
        return [
          { lines: [`${step.number} ${step.title}`, ...(step.important ? [L.important] : [])], bold: true },
          { lines: [step.statusLabel, `${step.itemsDone}/${step.itemsTotal}`], tone: step.status === "done" ? "done" : step.status === "doing" ? "doing" : undefined },
          { lines: lines.length ? lines : [L.none] },
        ];
      }),
    });
  }
  blocks.push({ type: "paragraph", text: L.note });
  return { title: L.title, lang: model.lang, blocks, footerText: "AnswerForU" };
}
