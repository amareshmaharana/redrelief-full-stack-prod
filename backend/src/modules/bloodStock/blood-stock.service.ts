import { BloodStockModel } from "../../models/blood-stock";
import { getNextSequence } from "../../models/counter";
import { fromBloodGroupEnum, toBloodGroupEnum } from "../../utils/blood-group";
import { AppError } from "../../utils/app-error";

export async function listStock(hospitalId?: number) {
  const stocks = await BloodStockModel.find({
    ...(hospitalId ? { hospitalId } : {}),
  })
    .sort({ createdAt: -1 })
    .lean();

  return stocks.map((item) => ({
    id: item.id,
    blood_group: fromBloodGroupEnum(item.bloodGroup as never),
    units: item.unitsAvailable,
    expiry_date: item.expiryDate.toISOString().slice(0, 10),
    created_at: item.createdAt.toISOString(),
  }));
}

export async function addStock(input: {
  hospitalId: number;
  blood_group: string;
  units: number;
  expiry_date: string;
}) {
  const bloodGroup = toBloodGroupEnum(input.blood_group);
  if (!bloodGroup) {
    throw new AppError(400, "Invalid blood group.");
  }

  const created = await BloodStockModel.create({
    id: await getNextSequence("bloodStocks"),
    hospitalId: input.hospitalId,
    bloodGroup,
    unitsAvailable: input.units,
    expiryDate: new Date(input.expiry_date),
  });

  return {
    id: created.id,
    blood_group: fromBloodGroupEnum(created.bloodGroup as never),
    units: created.unitsAvailable,
    expiry_date: created.expiryDate.toISOString().slice(0, 10),
    created_at: created.createdAt.toISOString(),
  };
}

export async function updateStock(
  stockId: number,
  input: {
    hospitalId: number;
    blood_group?: string;
    units?: number;
    expiry_date?: string;
  },
) {
  const existing = await BloodStockModel.findOne({ id: stockId }).lean();
  if (!existing) {
    throw new AppError(404, "Stock item not found.");
  }
  if (existing.hospitalId !== input.hospitalId) {
    throw new AppError(403, "You cannot modify this stock item.");
  }

  const bloodGroup = input.blood_group ? toBloodGroupEnum(input.blood_group) : existing.bloodGroup;
  if (!bloodGroup) {
    throw new AppError(400, "Invalid blood group.");
  }

  const updated = await BloodStockModel.findOneAndUpdate(
    { id: stockId },
    {
      $set: {
        bloodGroup,
        unitsAvailable: input.units ?? existing.unitsAvailable,
        expiryDate: input.expiry_date ? new Date(input.expiry_date) : existing.expiryDate,
      },
    },
    { new: true },
  ).lean();

  if (!updated) {
    throw new AppError(404, "Stock item not found.");
  }

  return {
    id: updated.id,
    blood_group: fromBloodGroupEnum(updated.bloodGroup as never),
    units: updated.unitsAvailable,
    expiry_date: updated.expiryDate.toISOString().slice(0, 10),
    created_at: updated.createdAt.toISOString(),
  };
}

export async function deleteStock(stockId: number, hospitalId: number) {
  const existing = await BloodStockModel.findOne({ id: stockId }).lean();
  if (!existing) {
    throw new AppError(404, "Stock item not found.");
  }
  if (existing.hospitalId !== hospitalId) {
    throw new AppError(403, "You cannot delete this stock item.");
  }

  await BloodStockModel.deleteOne({ id: stockId });
}

export async function stockSummary() {
  const groups = await BloodStockModel.aggregate([
    {
      $group: {
        _id: "$bloodGroup",
        total_units: { $sum: "$unitsAvailable" },
      },
    },
  ]);

  return groups.map((item) => ({
    blood_group: fromBloodGroupEnum(item._id as never),
    total_units: item.total_units ?? 0,
  }));
}
