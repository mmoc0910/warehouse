import { useEffect, useState } from 'react';
import { defaultPageResponse, getErrorMessage } from '../utils/helpers';

export default function usePaginatedResource(service, initialFilters = {}) {
  const [filters, setFilters] = useState({ page: 1, per_page: 15, ...initialFilters });
  const [data, setData] = useState(defaultPageResponse());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (override) => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters, ...override };
      const response = await service.list(params);
      setData(response.data);
      if (override) setFilters(params);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { filters, setFilters, data, loading, error, fetchData };
}
