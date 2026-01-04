import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

interface HealthModalProps {
    batchId: number;
    tankId?: number;
    onClose: () => void;
    onSuccess: () => void;
}

interface HealthFormData {
    log_date: string;
    log_time: string;
    issue_type: string;
    issue_description: string;
    severity: string;
    fish_affected: number;
    mortality_count: number;
    water_temperature_c?: number;
    water_ph?: number;
    oxygen_level_ppm?: number;
    action_taken?: string;
    notes?: string;
}

export const HealthModal: React.FC<HealthModalProps> = ({ batchId, tankId, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<HealthFormData>({
        defaultValues: {
            log_date: new Date().toISOString().split('T')[0],
            log_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            severity: 'Low',
            issue_type: 'Disease'
        }
    });

    const onSubmit = async (data: HealthFormData) => {
        try {
            await api.post('/health/logs', {
                ...data,
                batch_id: batchId,
                tank_id: tankId
            });
            onSuccess();
        } catch (error: unknown) {
            console.error('Failed to log health issue', error);
            const message = error instanceof Error ? error.message : 'Failed to save health log';
            alert(message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden border border-gray-100">
                {/* Fixed Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Log Health Issue</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    {...register('log_date', { required: 'Date is required' })}
                                />
                                {errors.log_date && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.log_date.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    {...register('log_time', { required: 'Time is required' })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Issue Type</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none transition-all"
                                    {...register('issue_type')}
                                >
                                    <option value="Disease">Disease</option>
                                    <option value="Water Quality">Water Quality</option>
                                    <option value="Injury">Injury</option>
                                    <option value="Parasite">Parasite</option>
                                    <option value="Stress">Stress</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Severity Level</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none transition-all"
                                    {...register('severity')}
                                >
                                    <option value="Low">Low (Active Monitoring)</option>
                                    <option value="Medium">Medium (Treatment Required)</option>
                                    <option value="High">High (Immediate Action)</option>
                                    <option value="Critical">Critical (High Mortality Risk)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                                placeholder="Describe symptoms, behavior changes, or unusual water conditions..."
                                {...register('issue_description', { required: 'Description is required' })}
                            />
                            {errors.issue_description && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.issue_description.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-red-50/50 p-6 rounded-2xl border border-red-100">
                            <div>
                                <label className="block text-sm font-bold text-red-900 mb-2 uppercase tracking-wide">Mortality Count</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2.5 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white"
                                    {...register('mortality_count', { valueAsNumber: true })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-red-900 mb-2 uppercase tracking-wide">Estimated Affected</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2.5 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white"
                                    {...register('fish_affected', { valueAsNumber: true })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">Water Parameters (Optional)</h4>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 text-center">Temp (°C)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                        {...register('water_temperature_c', { valueAsNumber: true })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 text-center">pH Level</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                        {...register('water_ph', { valueAsNumber: true })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 text-center">Oxygen (ppm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                        {...register('oxygen_level_ppm', { valueAsNumber: true })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Immediate Action Taken</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 50% Water change, salt treatment initiated..."
                                {...register('action_taken')}
                            />
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-bold transition-all active:scale-95 shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-md shadow-red-200 transition-all active:scale-95 flex items-center disabled:bg-gray-400 disabled:shadow-none"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Saving...' : 'Save Health Log'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
