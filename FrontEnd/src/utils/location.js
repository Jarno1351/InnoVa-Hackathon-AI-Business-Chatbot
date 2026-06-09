export function getGoogleMapsUrl(address = '') {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function shortenAddress(address = 'Address unavailable', maxLength = 54) {
  if (!address || address.length <= maxLength) return address || 'Address unavailable';
  return `${address.slice(0, maxLength).trim()}...`;
}
