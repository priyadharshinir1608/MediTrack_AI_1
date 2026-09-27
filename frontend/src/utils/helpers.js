export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

export const getExpiryBadge = (expiryDateStr) => {
  if (!expiryDateStr) return { label: 'Unknown', class: 'badge-secondary' };

  try {
    const exp = new Date(expiryDateStr);
    const now = new Date();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { label: 'Expired', class: 'badge-danger' };
    } else if (diffDays <= 30) {
      return { label: `Expiring (${diffDays}d)`, class: 'badge-danger' };
    } else if (diffDays <= 90) {
      return { label: `Warning (${diffDays}d)`, class: 'badge-warning' };
    } else {
      return { label: 'Healthy', class: 'badge-success' };
    }
  } catch (e) {
    return { label: expiryDateStr, class: 'badge-secondary' };
  }
};

export const getStockBadge = (quantity, minThreshold = 10) => {
  if (quantity <= 0) {
    return { label: 'Out of Stock', class: 'badge-danger' };
  } else if (quantity <= minThreshold) {
    return { label: 'Low Stock', class: 'badge-warning' };
  } else {
    return { label: 'In Stock', class: 'badge-success' };
  }
};
