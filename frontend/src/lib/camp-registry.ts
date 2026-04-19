const CAMP_REGISTRY_KEY = "bdms_camp_registrations";
const CAMP_REGISTRY_EVENT = "bdms-camp-registration-change";

export interface CampRegistrationRecord {
  campId: string;
  donorName: string;
  bloodGroup: string;
  message: string;
  registeredAt: string;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readRecords() {
  if (!canUseStorage()) {
    return [] as CampRegistrationRecord[];
  }

  try {
    const raw = window.localStorage.getItem(CAMP_REGISTRY_KEY);
    if (!raw) {
      return [] as CampRegistrationRecord[];
    }

    const parsed = JSON.parse(raw) as CampRegistrationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as CampRegistrationRecord[];
  }
}

function writeRecords(records: CampRegistrationRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CAMP_REGISTRY_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(CAMP_REGISTRY_EVENT));
}

export function formatCampDisplayId(campId: string) {
  const normalized = String(campId).trim();
  return `CMP-${normalized.padStart(3, "0")}`;
}

export function getCampRegistrationCount(campId: string) {
  return readRecords().filter((record) => record.campId === campId).length;
}

export function getCampRegistrationRecord(campId: string) {
  return readRecords().find((record) => record.campId === campId) ?? null;
}

export function isCampRegistered(campId: string) {
  return Boolean(getCampRegistrationRecord(campId));
}

export function registerCampLocally(record: Omit<CampRegistrationRecord, "registeredAt">) {
  const nextRecord: CampRegistrationRecord = {
    ...record,
    registeredAt: new Date().toISOString(),
  };

  const records = readRecords().filter(
    (item) => !(item.campId === nextRecord.campId && item.donorName === nextRecord.donorName),
  );

  records.unshift(nextRecord);
  writeRecords(records);
  return nextRecord;
}

export function useCampRegistrySubscription(onChange: () => void) {
  const handler = () => onChange();

  window.addEventListener(CAMP_REGISTRY_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(CAMP_REGISTRY_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
