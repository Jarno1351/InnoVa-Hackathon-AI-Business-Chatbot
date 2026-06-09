import { getGoogleMapsUrl } from '../utils/location.js';

export default function AddressLink({ address, label, className = 'address-link' }) {
  const safeAddress = address || 'Address unavailable';
  return (
    <a className={className} href={getGoogleMapsUrl(safeAddress)} target="_blank" rel="noopener noreferrer" title={`Open in Google Maps: ${safeAddress}`}>
      <span aria-hidden="true">⌖</span>
      <span>{label || safeAddress}</span>
    </a>
  );
}
