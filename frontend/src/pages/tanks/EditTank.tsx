import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Droplets, Save, Info } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import api from '../../lib/api';
import type { Tank } from '../../types';

export default function EditTank() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tank, setTank] = useState<Tank | null>(null);
  const [formData, setFormData] = useState({
    tank_name: '',
    tank_type: 'Hatching',
    location: '',
    capacity_liters: '',
    notes: '',
    is_active: true
  });

  const tankTypes = ['Hatching', 'IBC', 'Elevated', 'Ground', 'Tarpaulin'];

  const fetchTank = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/production/tanks/${id}`);
      const tankData = response.data.data;
      setTank(tankData);
      setFormData({
        tank_name: tankData.tank_name,
        tank_type: tankData.tank_type,
        location: tankData.location,
        capacity_liters: tankData.capacity_liters.toString(),
        notes: tankData.notes || '',
        is_active: tankData.is_active
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load tank';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTank();
  }, [fetchTank]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
        name === 'capacity_liters' ? (value ? parseInt(value) : '') : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.tank_name || !formData.tank_type || !formData.capacity_liters) {
      setError('Tank name, type, and capacity are required');
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/production/tanks/${id}`, formData);
      navigate('/tanks');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update tank';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading tank details...</p>
        </div>
      </div>
    </AppLayout>
  );

  if (!tank) return (
    <AppLayout>
      <div className="p-6 text-center py-20">
        <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-2xl mb-4">
          <Info size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tank Not Found</h2>
        <p className="text-gray-500 mb-8">The tank you are trying to edit doesn't exist or you don't have access.</p>
        <button
          onClick={() => navigate('/tanks')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to list
        </button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/tanks')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium text-sm"
        >
          <ChevronLeft size={18} />
          Back to Tanks
        </button>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Droplets size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit {tank.tank_name}</h1>
            <p className="text-gray-500 font-mono text-xs mt-1">ID: #{tank.tank_id}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tank Name *
              </label>
              <input
                type="text"
                name="tank_name"
                value={formData.tank_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tank Type *
                </label>
                <select
                  name="tank_type"
                  value={formData.tank_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                >
                  {tankTypes.map(type => (
                    <option key={type} value={type}>
                      {type} Tank
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Capacity (Liters) *
                </label>
                <input
                  type="number"
                  name="capacity_liters"
                  value={formData.capacity_liters}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer">
                Tank is Active
              </label>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow active:scale-[0.98] disabled:bg-gray-400 disabled:scale-100 flex items-center justify-center gap-2 font-bold"
            >
              <Save size={18} />
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tanks')}
              className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
