export function getErrorMessage(error) {
  const response = error?.response?.data;
  if (response?.message && response?.errors) {
    const firstKey = Object.keys(response.errors)[0];
    return response.errors[firstKey]?.[0] || response.message;
  }
  return response?.message || error.message || 'Có lỗi xảy ra.';
}

export function formatNumber(value, digits = 0) {
  const num = Number(value || 0);
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
}

export function isSystemAdmin(user) {
  return (user?.roles || []).some((role) => role.name === 'system_admin');
}

export function defaultPageResponse() {
  return {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  };
}
