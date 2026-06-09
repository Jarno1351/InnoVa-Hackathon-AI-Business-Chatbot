import { fallbackShops } from '../data/mockData.js';

function parsePriceFromText(text = '') {
  const match = text.match(/Price:\s*([0-9,.]+)/i) || text.match(/₱\s*([0-9,.]+)/i);
  if (!match) return null;
  return `₱${Number(String(match[1]).replace(/,/g, '')).toLocaleString('en-PH')}`;
}

function parseNameFromContext(text = '') {
  const supply = text.match(/Supply Name:\s*([^|]+)/i);
  const service = text.match(/Service Name:\s*([^|]+)/i);
  return (supply?.[1] || service?.[1] || 'Recommended item').trim();
}

function parseCompanyFromContext(text = '') {
  const match = text.match(/Company Name:\s*([^|]+)/i);
  return (match?.[1] || 'Registered supplier').trim();
}

function parseBranchFromContext(text = '') {
  const match = text.match(/Operational Location:\s*([^|]+)/i);
  return (match?.[1] || '').trim();
}

export function getFallbackRecommendations(message = '') {
  const lower = message.toLowerCase();
  if (lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable')) return [fallbackShops[1], fallbackShops[3], fallbackShops[2]];
  if (lower.includes('mechanical') || lower.includes('gaming')) return [fallbackShops[0], fallbackShops[2], fallbackShops[1]];
  if (lower.includes('office') || lower.includes('school') || lower.includes('study')) return [fallbackShops[3], fallbackShops[1], fallbackShops[0]];
  return [fallbackShops[0], fallbackShops[1], fallbackShops[2]];
}

export function adaptChatMatchesToRecommendations(apiResult, originalMessage = '') {
  const branches = apiResult?.matchedBranches || [];
  const contexts = apiResult?.contextUsed || [];

  if (!apiResult?.hasRelationalData || branches.length === 0) {
    return [];
  }

  return branches.map((branch, index) => {
    const context = contexts[index]?.text || contexts[0]?.text || '';
    const productName = parseNameFromContext(context);
    const price = parsePriceFromText(context) || 'Price unavailable';
    const branchName = parseBranchFromContext(context);
    const companyName = parseCompanyFromContext(context);

    return {
      id: branch.branchId || `${index}`,
      businessId: branch.businessId,
      branchId: branch.branchId,
      chunkId: branch.chunkId,
      name: companyName,
      description: branchName ? `${branchName}. Backend matched this supplier from vector search.` : 'Backend matched this supplier from vector search.',
      category: 'Backend match',
      match: productName,
      rating: Number((4.6 + Math.min(index, 3) * 0.1).toFixed(1)),
      reviews: 0,
      address: branchName || 'Exact address not yet returned by backend',
      availability: 'Matched supplier',
      icon: '▤',
      confidenceScore: contexts[index]?.confidenceScore,
      product: {
        name: productName,
        description: context || `Matched from vector search for: ${originalMessage}`,
        price,
        oldPrice: '',
        rating: 4.8,
        reviews: 0,
        imageIcon: '▤',
        specs: [
          `Confidence: ${contexts[index]?.percentage || 'N/A'}`,
          `Branch ID: ${branch.branchId || 'N/A'}`,
          `Business ID: ${branch.businessId || 'N/A'}`
        ],
        supplierContact: 'Contact details endpoint not yet exposed by backend.'
      }
    };
  });
}
