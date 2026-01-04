import { useEffect, useState, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2, Droplets, MapPin, Layers } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import api from '../../lib/api';
import type { Tank } from '../../types';

export default function TankList() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchTanks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/production/tanks');
      setTanks(response.data.data || []);
      setError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch tanks');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tank? This cannot be undone.')) return;

    try {
      await api.delete(`/production/tanks/${id}`);
      setTanks(tanks.filter(t => t.tank_id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete tank';
      alert(message);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tank Management</h1>
            <p className="text-gray-500">Monitor and manage your farm tanks and their capacity.</p>
          </div>
          <button
            onClick={() => navigate('/tanks/new')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Tank
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-48 animate-pulse border border-gray-100" />
            ))
          ) : tanks.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-gray-200 border-dashed">
              <Droplets className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No tanks found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first production tank.</p>
              <button
                onClick={() => navigate('/tanks/new')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tank
              </button>
            </div>
          ) : (
            tanks.map((tank) => (
              <div key={tank.tank_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Droplets size={24} />
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/tanks/${tank.tank_id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => navigate(`/tanks/${tank.tank_id}/edit`)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Tank"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(tank.tank_id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Tank"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">{tank.tank_name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin size={14} className="mr-1" />
                    {tank.location || 'No location set'}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Capacity</p>
                      <p className="text-sm font-bold text-gray-900">{tank.capacity_liters?.toLocaleString()} L</p>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${tank.active_batches_count && tank.active_batches_count > 0
                      ? 'bg-blue-50 border-blue-100'
                      : 'bg-green-50 border-green-100'}`}>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Occupancy</p>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${tank.active_batches_count && tank.active_batches_count > 0 ? 'bg-blue-500' : 'bg-green-500'}`} />
                        <p className={`text-sm font-bold ${tank.active_batches_count && tank.active_batches_count > 0 ? 'text-blue-700' : 'text-green-700'}`}>
                          {tank.active_batches_count && tank.active_batches_count > 0 ? `${tank.active_batches_count} Batches` : 'Empty'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                    <span className="text-xs text-gray-400 capitalize">{tank.tank_type} Tank</span>
                    {tank.active_batches_count && tank.active_batches_count > 0 && (
                      <div className="flex items-center text-xs text-blue-600 font-medium">
                        <Layers size={14} className="mr-1" />
                        Active Production
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
