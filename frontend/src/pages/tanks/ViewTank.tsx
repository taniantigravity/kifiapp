import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Edit2, Layers } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import api from '../../lib/api';
import type { Tank, Batch } from '../../types';

export default function ViewTank() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tank, setTank] = useState<(Tank & { batches: Batch[] }) | null>(null);

  const fetchTank = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/production/tanks/${id}`);
      setTank(response.data.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load tank');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTank();
  }, [fetchTank]);

  if (loading) return <AppLayout><div className="p-6">Loading tank...</div></AppLayout>;
  if (!tank) return <AppLayout><div className="p-6 text-red-600">Tank not found</div></AppLayout>;

  const formattedDate = tank.created_at ? new Date(tank.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/tanks')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={20} />
          Back to Tanks
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{tank.tank_name}</h1>
            <p className="text-gray-500">Tank Code: {tank.tank_code || 'N/A'}</p>
          </div>
          <button
            onClick={() => navigate(`/tanks/${tank.tank_id}/edit`)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Edit2 size={20} />
            Edit Tank
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Tank Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{tank.tank_type}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Location</p>
                  <p className="font-semibold text-gray-900">{tank.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Capacity</p>
                  <p className="font-semibold text-gray-900">{tank.capacity_liters.toLocaleString()} L</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${tank.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {tank.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {tank.notes && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-gray-500 text-sm mb-2">Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{tank.notes}</p>
                </div>
              )}
            </div>

            {/* Active Batches Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Active Batches</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                  {tank.batches?.length || 0}
                </span>
              </div>

              {!tank.batches || tank.batches.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <Layers className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p>No active batches in this tank.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tank.batches.map((batch) => (
                    <Link
                      key={batch.batch_id}
                      to={`/batches/${batch.batch_id}`}
                      className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors -mx-2 px-2 rounded-lg"
                    >
                      <div>
                        <p className="font-bold text-blue-600">{batch.batch_code}</p>
                        <p className="text-sm text-gray-500">Stage: {batch.current_stage}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{batch.current_count?.toLocaleString()} fish</p>
                        <p className="text-xs text-gray-500">Started {new Date(batch.start_date).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">System Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-xs">Created On</p>
                  <p className="text-sm font-medium">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
