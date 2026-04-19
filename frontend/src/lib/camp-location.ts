export function formatCampLocation(address: string, city: string, state?: string) {
  const normalizedAddress = address.trim();
  const normalizedCity = city.trim();
  const normalizedState = state?.trim();

  const addressLower = normalizedAddress.toLowerCase();
  const cityLower = normalizedCity.toLowerCase();

  if (normalizedAddress && normalizedCity) {
    if (addressLower === cityLower) {
      return normalizedState && normalizedState.toLowerCase() !== cityLower
        ? `${normalizedAddress}, ${normalizedState}`
        : normalizedAddress;
    }

    return normalizedState && normalizedState.toLowerCase() !== cityLower
      ? `${normalizedAddress}, ${normalizedCity}, ${normalizedState}`
      : `${normalizedAddress}, ${normalizedCity}`;
  }

  return normalizedAddress || normalizedCity || "Location unavailable";
}