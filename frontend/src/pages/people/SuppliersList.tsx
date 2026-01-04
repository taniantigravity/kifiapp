import { useEffect, useState, useCallback } from 'react';
import { Plus, Phone, Mail, Building, Pencil, Trash2, Search, Package } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import api from '../../lib/api';
import type { Supplier } from '../../types';

export default function SuppliersList() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone_number: '',
        email: '',
        category: 'Feed',
        notes: ''
    });

    const fetchSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/people/suppliers');
            if (response.data.success) {
                setSuppliers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await api.put(`/people/suppliers/${editingSupplier.supplier_id}`, formData);
            } else {
                await api.post('/people/suppliers', formData);
            }
            setShowModal(false);
            setEditingSupplier(null);
            setFormData({ name: '', contact_person: '', phone_number: '', email: '', category: 'Feed', notes: '' });
            fetchSuppliers();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to save supplier';
            alert(message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await api.delete(`/people/suppliers/${id}`);
            fetchSuppliers();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete supplier';
            alert(message);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Suppliers</h2>
                        <p className="text-gray-500">Manage vendors for feed, equipment, and farm supplies.</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setFormData({ name: '', contact_person: '', phone_number: '', email: '', category: 'Feed', notes: '' });
                            setShowModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Supplier
                    </button>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by company or category..."
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
                    ) : filteredSuppliers.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border border-gray-200 border-dashed">
                            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No suppliers found</h3>
                            <p className="text-gray-500">Add your first supplier to track inventory sources.</p>
                        </div>
                    ) : (
                        filteredSuppliers.map((s) => (
                            <div key={s.supplier_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                                        <Building className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider bg-indigo-100 text-indigo-700">
                                            {s.category || 'Vendor'}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingSupplier(s);
                                                    setFormData({
                                                        name: s.name || '',
                                                        contact_person: s.contact_person || '',
                                                        phone_number: s.phone_number || '',
                                                        email: s.email || '',
                                                        category: s.category || 'Feed',
                                                        notes: s.notes || ''
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                title="Edit Supplier"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.supplier_id)}
                                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Delete Supplier"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{s.name}</h3>
                                <p className="text-sm font-medium text-gray-500 mb-4">{s.contact_person || 'No contact person'}</p>

                                <div className="space-y-3 pt-4 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-700">{s.phone_number || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-700 truncate">{s.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Acme Feeds"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Feed">Feed</option>
                                        <option value="Medication">Medication</option>
                                        <option value="Equipment">Equipment</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                    <input
                                        type="text"
                                        value={formData.contact_person}
                                        onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone_number}
                                        onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Save Supplier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
