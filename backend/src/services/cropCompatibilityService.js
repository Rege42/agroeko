import CropRotationGroup from "../models/CropRotationGroup.js";
import CropCompatibilityRule from "../models/CropCompatibilityRule.js";

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
    (a, b) => a.displayOrder - b.displayOrder || a.groupName.localeCompare(b.groupName)
  );

  const columns = [...colMap.values()].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.groupName.localeCompare(b.groupName)
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