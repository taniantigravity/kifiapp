import { useEffect, useState, useCallback } from 'react';
import { Plus, Phone, User, DollarSign, Pencil, Trash2, Calendar, Search, ShieldCheck } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import api from '../../lib/api';
import type { Worker } from '../../types';

export default function WorkersList() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Worker | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        full_name: '',
        role: 'Attendant',
        phone: '',
        salary_ngn: '',
        status: 'Active' as 'Active' | 'Inactive',
        start_date: new Date().toISOString().split('T')[0]
    });

    const fetchWorkers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/people/workers');
            if (response.data.success) {
                setWorkers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch workers', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/people/workers/${editingItem.worker_id}`, formData);
            } else {
                await api.post('/people/workers', formData);
            }
            setShowModal(false);
            setEditingItem(null);
            setFormData({ full_name: '', role: 'Attendant', phone: '', salary_ngn: '', status: 'Active', start_date: new Date().toISOString().split('T')[0] });
            fetchWorkers();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to save worker';
            alert(message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this worker record?')) return;
        try {
            await api.delete(`/people/workers/${id}`);
            fetchWorkers();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete worker';
            alert(message);
        }
    };

    const filteredWorkers = workers.filter(w =>
        w.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Farm Workers</h2>
                        <p className="text-gray-500">Manage farm staff, roles, and payroll.</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ full_name: '', role: 'Attendant', phone: '', salary_ngn: '', status: 'Active', start_date: new Date().toISOString().split('T')[0] });
                            setShowModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Worker
                    </button>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-48 animate-pulse border border-gray-100" />
                        ))
                    ) : filteredWorkers.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border border-gray-200 border-dashed">
                            <ShieldCheck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No workers found</h3>
                            <p className="text-gray-500">Add your first farm worker to get started.</p>
                        </div>
                    ) : (
                        filteredWorkers.map((w) => (
                            <div key={w.worker_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${w.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${w.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {w.status}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingItem(w);
                                                    setFormData({
                                                        full_name: w.full_name,
                                                        role: w.role,
                                                        phone: w.phone_number || '',
                                                        salary_ngn: String(w.salary_ngn || ''),
                                                        status: w.status,
                                                        start_date: w.start_date ? new Date(w.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                title="Edit Worker"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(w.worker_id)}
                                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Delete Worker"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{w.full_name}</h3>
                                <p className="text-sm font-medium text-blue-600 mb-4">{w.role}</p>

                                <div className="space-y-3 pt-4 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Phone className="w-4 h-4" />
                                            <span>Contact</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{w.phone_number || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <DollarSign className="w-4 h-4" />
                                            <span>Salary</span>
                                        </div>
                                        <span className="font-bold text-gray-900">₦{Number(w.salary_ngn).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>Joined</span>
                                        </div>
                                        <span className="font-medium text-gray-600">{w.start_date ? new Date(w.start_date).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300 border border-gray-100">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">{editingItem ? 'Edit Worker' : 'Add New Worker'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. John Doe"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Manager"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="+234..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary (₦/mo)</label>
                                    <input
                                        type="number"
                                        value={formData.salary_ngn}
                                        onChange={e => setFormData({ ...formData, salary_ngn: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="50000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Save Worker</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
