import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Droplets, Save } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import api from '../../lib/api';

export default function CreateTank() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    tank_name: '',
    tank_type: 'Hatching',
    location: '',
    capacity_liters: '',
    notes: ''
  });

  const tankTypes = ['Hatching', 'IBC', 'Elevated', 'Ground', 'Tarpaulin'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity_liters' ? (value ? parseInt(value) : '') : value
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
      setLoading(true);
      await api.post('/production/tanks', formData);
      navigate('/tanks');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create tank';
      setError(message);
      console.error('Error creating tank:', err);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Droplets size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Tank</h1>
            <p className="text-gray-500 text-sm">Define a new production environment for your batches.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-in fade-in slide-in-from-top-1">
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
                placeholder="e.g., Nursery Tank A1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                required
                autoFocus
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                  placeholder="e.g., 5000"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
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
                placeholder="e.g., Section A, Unit 1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
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
                placeholder="Additional details about this tank setup..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow active:scale-[0.98] disabled:bg-gray-400 disabled:scale-100 flex items-center justify-center gap-2 font-bold"
            >
              <Save size={18} />
              {loading ? 'Creating Tank...' : 'Create Tank'}
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
