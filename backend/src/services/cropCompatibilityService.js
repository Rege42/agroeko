import CropRotationGroup from "../models/CropRotationGroup.js";
import CropCompatibilityRule from "../models/CropCompatibilityRule.js";
import Field from "../models/Field.js";
import CropRotationEntry from "../models/CropRotationEntry.js";
import Crop from "../models/Crop.js";
import Cost from "../models/Cost.js";

export const getCompatibilityMatrix = async () => {
  const groups = await CropRotationGroup.find({ isActive: true })
    .sort({ displayOrderColumn: 1, name: 1 })
    .lean();

  const rules = await CropCompatibilityRule.find({ isActive: true })
    .populate("targetGroup", "name displayOrderRow")
    .populate("predecessorGroup", "name displayOrderColumn")
    .lean();

  const rowMap = new Map();
  const colMap = new Map();

  for (const group of groups) {
    rowMap.set(String(group._id), {
      groupId: String(group._id),
      groupName: group.name,
      displayOrder: group.displayOrderRow ?? 0,
    });

    colMap.set(String(group._id), {
      groupId: String(group._id),
      groupName: group.name,
      displayOrder: group.displayOrderColumn ?? 0,
    });
  }

  const rows = [...rowMap.values()].sort(
    (a, b) =>
      a.displayOrder - b.displayOrder || a.groupName.localeCompare(b.groupName),
  );

  const columns = [...colMap.values()].sort(
    (a, b) =>
      a.displayOrder - b.displayOrder || a.groupName.localeCompare(b.groupName),
  );

  const cells = rules.map((rule) => ({
    id: String(rule._id),
    targetGroupId: String(rule.targetGroup._id),
    predecessorGroupId: String(rule.predecessorGroup._id),
    compatibilityLevel: rule.compatibilityLevel,
    returnPeriodMinYears: rule.returnPeriodMinYears,
    returnPeriodMaxYears: rule.returnPeriodMaxYears,
    note: rule.note,
  }));

  return { rows, columns, cells };
};

const COMPATIBILITY_SCORES = {
  EXCELLENT: 100,
  GOOD: 80,
  ACCEPTABLE: 55,
  RISKY: 20,
  FORBIDDEN: 0,
};

export const getCropSelectionData = async (fieldId) => {
  const field = await Field.findById(fieldId).lean();
  if (!field) {
    throw new Error("Поле не найдено");
  }

  const history = await CropRotationEntry.find({ field: fieldId })
    .populate({
      path: "crop",
      select:
        "name cropRotationGroup suitableSoilTypes seedingRate seedingRateUnit",
      populate: {
        path: "cropRotationGroup",
        select: "name",
      },
    })
    .sort({ year: -1, date: -1 })
    .lean();

  const lastEntry = history[0];
  const predecessorGroupId = lastEntry?.crop?.cropRotationGroup?._id ?? null;

  const allCrops = await Crop.find({ isActive: true })
    .populate("cropRotationGroup", "name")
    .lean();

  const rules = predecessorGroupId
    ? await CropCompatibilityRule.find({
        predecessorGroup: predecessorGroupId,
        isActive: true,
      }).lean()
    : [];

  const ruleMap = new Map(
    rules.map((rule) => [String(rule.targetGroup), rule]),
  );

  const latestSeedCosts = await Cost.aggregate([
    {
      $match: {
        category: "семена",
        crop: { $ne: null },
      },
    },
    { $sort: { crop: 1, date: -1 } },
    {
      $group: {
        _id: "$crop",
        date: { $first: "$date" },
        item: { $first: "$item" },
        unit: { $first: "$unit" },
        pricePerUnit: { $first: "$pricePerUnit" },
        supplier: { $first: "$supplier" },
      },
    },
  ]);

  const seedCostMap = new Map(
    latestSeedCosts.map((item) => [String(item._id), item]),
  );

  const currentYear = new Date().getFullYear();

  const recommendations = allCrops
    .map((crop) => {
      const groupId = crop.cropRotationGroup?._id;
      if (!groupId) return null;

      const rule = predecessorGroupId ? ruleMap.get(String(groupId)) : null;

      const compatibilityLevel = rule?.compatibilityLevel ?? "ACCEPTABLE";

      if (compatibilityLevel === "FORBIDDEN") {
        return null;
      }

      const sameGroupHistoryEntry = history.find(
        (entry) =>
          String(entry.crop?.cropRotationGroup?._id) === String(groupId),
      );

      const yearsSinceLast = sameGroupHistoryEntry
        ? currentYear - sameGroupHistoryEntry.year
        : null;

      const returnPeriodOk =
        !rule?.returnPeriodMinYears ||
        yearsSinceLast == null ||
        yearsSinceLast >= rule.returnPeriodMinYears;

      const soilOk =
        !Array.isArray(crop.suitableSoilTypes) ||
        crop.suitableSoilTypes.length === 0 ||
        crop.suitableSoilTypes.includes(field.soilType);

      const seedCost = seedCostMap.get(String(crop._id)) ?? null;

      const estimatedSeedQuantity =
        field.area && crop.seedingRate ? field.area * crop.seedingRate : null;

      const estimatedSeedCost =
        estimatedSeedQuantity != null && seedCost?.pricePerUnit != null
          ? estimatedSeedQuantity * seedCost.pricePerUnit
          : null;

      let score = COMPATIBILITY_SCORES[compatibilityLevel] ?? 0;

      if (!returnPeriodOk) score -= 30;
      if (!soilOk) score -= 40;
      if (estimatedSeedCost != null) {
        score += Math.max(0, 20 - estimatedSeedCost / 100000);
      }

      score = Math.max(0, Math.round(score));

      return {
        cropId: String(crop._id),
        cropName: crop.name,
        groupId: String(groupId),
        groupName: crop.cropRotationGroup?.name ?? null,
        compatibilityLevel,
        returnPeriodOk,
        yearsSinceLast,
        soilOk,
        seedCostPerUnit: seedCost?.pricePerUnit ?? null,
        seedUnit: seedCost?.unit ?? null,
        estimatedSeedQuantity,
        estimatedSeedCost,
        score,
        reason: buildReason({ compatibilityLevel, returnPeriodOk, soilOk }),
      };
    })
    .filter(Boolean)
    .filter((item) => item.soilOk)
    .sort((a, b) => b.score - a.score);

  const totalScore = recommendations.reduce((sum, item) => sum + item.score, 0);

  const recommendedChart =
    totalScore > 0
      ? recommendations.slice(0, 5).map((item) => ({
          cropId: item.cropId,
          cropName: item.cropName,
          percent: Math.round((item.score / totalScore) * 100),
        }))
      : [];

  const previousChart = buildPreviousChart(history);

  return {
    field: {
      id: String(field._id),
      name: field.name,
      area: field.area,
      soilType: field.soilType,
    },
    history: history.map((entry) => ({
      year: entry.year,
      cropId: entry.crop?._id ? String(entry.crop._id) : null,
      cropName: entry.crop?.name ?? null,
      groupId: entry.crop?.cropRotationGroup?._id
        ? String(entry.crop.cropRotationGroup._id)
        : null,
      groupName: entry.crop?.cropRotationGroup?.name ?? null,
    })),
    previousChart,
    recommendations,
    recommendedChart,
    summary: {
      text: "Рекомендации сформированы на основе истории севооборота, совместимости групп культур, периода возврата и ориентировочной стоимости семян.",
      profitabilityPercent: null,
    },
  };
};

function buildReason({ compatibilityLevel, returnPeriodOk, soilOk }) {
  const parts = [];

  if (compatibilityLevel === "EXCELLENT") parts.push("отличный предшественник");
  else if (compatibilityLevel === "GOOD") parts.push("хороший предшественник");
  else if (compatibilityLevel === "ACCEPTABLE")
    parts.push("допустимый предшественник");
  else if (compatibilityLevel === "RISKY")
    parts.push("рискованный предшественник");

  if (returnPeriodOk) parts.push("соблюден период возврата");
  else parts.push("не соблюден период возврата");

  if (soilOk) parts.push("подходит по типу почвы");
  else parts.push("не подходит по типу почвы");

  return parts.join(", ");
}

function buildPreviousChart(history) {
  const map = new Map();

  for (const entry of history) {
    const cropId = entry.crop?._id ? String(entry.crop._id) : null;
    const cropName = entry.crop?.name ?? "Неизвестно";
    const key = cropId ?? cropName;

    if (!map.has(key)) {
      map.set(key, {
        cropId,
        cropName,
        count: 0,
      });
    }

    map.get(key).count += 1;
  }

  const items = [...map.values()];
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return items.map((item) => ({
    ...item,
    percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));
}
