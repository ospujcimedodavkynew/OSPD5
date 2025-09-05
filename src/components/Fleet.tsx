import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Vehicle, ServiceRecord } from '../types';
import { Button, Card, Modal, Input, Textarea } from './ui';
import { PlusIcon, EditIcon, Trash2Icon } from './Icons';

// --- Vehicle Form ---
const VehicleForm: React.FC<{ vehicle?: Vehicle; onSave: (vehicle: Omit<Vehicle, 'id'> | Vehicle) => void; onCancel: () => void; }> = ({ vehicle, onSave, onCancel }) => {
    // FIX: Changed `pricing` in the default state object to make `perHour` optional, matching the `Vehicle` type.
    const [formData, setFormData] = useState(vehicle || {
        brand: '', license_plate: '', vin: '', year: new Date().getFullYear(),
        stk_date: '', insurance_info: '', vignette_until: '',
        // FIX: Added perHour to the initial state to resolve TypeScript error on access.
        // FIX: Cast initial state to Omit<Vehicle, 'id'> to fix type inference issue.
        pricing: { perDay: 0, perHour: undefined }, serviceHistory: []
    } as Omit<Vehicle, 'id'>);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (name === 'perDay' || name === 'perHour') {
            setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, [name]: type === 'number' ? parseFloat(value) || 0 : value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Značka a model" name="brand" value={formData.brand} onChange={handleChange} required />
                <Input label="SPZ" name="license_plate" value={formData.license_plate} onChange={handleChange} required />
                <Input label="VIN" name="vin" value={formData.vin} onChange={handleChange} required />
                <Input label="Rok výroby" name="year" type="number" value={formData.year} onChange={handleChange} required />
                <Input label="Cena / den (Kč)" name="perDay" type="number" value={formData.pricing.perDay} onChange={handleChange} required />
                {/* FIX: Use `??` instead of `||` to correctly display a value of 0. */}
                <Input label="Cena / hodina (Kč)" name="perHour" type="number" value={formData.pricing.perHour ?? ''} onChange={handleChange} />
                <Input label="STK platná do" name="stk_date" type="date" value={formData.stk_date} onChange={handleChange} />
                <Input label="Info o pojištění" name="insurance_info" value={formData.insurance_info} onChange={handleChange} />
                <Input label="Dálniční známka do" name="vignette_until" type="date" value={formData.vignette_until} onChange={handleChange} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Zrušit</Button>
                <Button type="submit">{vehicle ? 'Uložit změny' : 'Přidat vozidlo'}</Button>
            </div>
        </form>
    );
};

// --- Service History Manager ---
const ServiceHistoryManager: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
    const { addServiceRecord, updateServiceRecord, deleteServiceRecord } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);

    const handleSave = (record: Omit<ServiceRecord, 'id'> | ServiceRecord) => {
        if ('id' in record) {
            updateServiceRecord(vehicle.id, record);
        } else {
            addServiceRecord(vehicle.id, record);
        }
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Servisní historie</h4>
                <Button size="sm" onClick={() => { setEditingRecord(null); setIsModalOpen(true); }}><PlusIcon className="w-4 h-4 mr-1" /> Přidat záznam</Button>
            </div>
            <div className="space-y-2">
                {vehicle.serviceHistory.length > 0 ? vehicle.serviceHistory.map(rec => (
                    <div key={rec.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                        <div>
                            <p>{new Date(rec.date).toLocaleDateString('cs-CZ')} - {rec.description}</p>
                            <p className="text-sm text-text-secondary">{rec.cost.toLocaleString('cs-CZ')} Kč</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingRecord(rec); setIsModalOpen(true); }} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4"/></button>
                            <button onClick={() => deleteServiceRecord(vehicle.id, rec.id)} className="text-gray-400 hover:text-red-500"><Trash2Icon className="w-4 h-4"/></button>
                        </div>
                    </div>
                )) : <p className="text-text-secondary text-sm">Žádné servisní záznamy.</p>}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRecord ? 'Upravit záznam' : 'Nový servisní záznam'}>
                <ServiceRecordForm record={editingRecord || undefined} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

const ServiceRecordForm: React.FC<{record?: ServiceRecord; onSave: (record: Omit<ServiceRecord, 'id'> | ServiceRecord) => void; onCancel: () => void}> = ({ record, onSave, onCancel }) => {
    const [formData, setFormData] = useState(record || { date: new Date().toISOString().split('T')[0], description: '', cost: 0 });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Datum" name="date" type="date" value={formData.date} onChange={handleChange} required />
            <Textarea label="Popis" name="description" value={formData.description} onChange={handleChange} required />
            <Input label="Cena (Kč)" name="cost" type="number" value={formData.cost} onChange={handleChange} required />
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Zrušit</Button>
                <Button type="submit">Uložit</Button>
            </div>
        </form>
    );
};


// --- Main Fleet Component ---
const Fleet: React.FC = () => {
    const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null);

    const handleSave = (vehicle: Omit<Vehicle, 'id'> | Vehicle) => {
        if ('id' in vehicle) {
            updateVehicle(vehicle);
        } else {
            addVehicle(vehicle);
        }
        setIsModalOpen(false);
        setEditingVehicle(null);
    };
    
    const openEditModal = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setIsModalOpen(true);
    };
    
    const openNewModal = () => {
        setEditingVehicle(null);
        setIsModalOpen(true);
    };

    const toggleExpand = (vehicleId: string) => {
        setExpandedVehicleId(prev => prev === vehicleId ? null : vehicleId);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Vozový park</h1>
                <Button onClick={openNewModal}><PlusIcon className="w-5 h-5 mr-2" /> Přidat vozidlo</Button>
            </div>
            
            <div className="space-y-4">
                {vehicles.map(v => (
                    <Card key={v.id}>
                        <div className="flex justify-between items-start">
                           <div>
                                <h2 className="text-xl font-bold cursor-pointer" onClick={() => toggleExpand(v.id)}>{v.brand}</h2>
                                <p className="text-text-secondary">{v.license_plate} | {v.vin}</p>
                           </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={() => openEditModal(v)}><EditIcon className="w-4 h-4" /></Button>
                                <Button size="sm" variant="danger" onClick={() => deleteVehicle(v.id)}><Trash2Icon className="w-4 h-4" /></Button>
                            </div>
                        </div>

                        {expandedVehicleId === v.id && (
                             <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <p><strong>Cena/den:</strong> {v.pricing.perDay.toLocaleString('cs-CZ')} Kč</p>
                                    <p><strong>Cena/hod:</strong> {v.pricing.perHour?.toLocaleString('cs-CZ')} Kč</p>
                                    <p><strong>Rok:</strong> {v.year}</p>
                                    <p><strong>STK do:</strong> {new Date(v.stk_date).toLocaleDateString('cs-CZ')}</p>
                                    <p><strong>Pojištění:</strong> {v.insurance_info}</p>
                                    <p><strong>Známka do:</strong> {new Date(v.vignette_until).toLocaleDateString('cs-CZ')}</p>
                                </div>
                                <ServiceHistoryManager vehicle={v} />
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVehicle ? 'Upravit vozidlo' : 'Nové vozidlo'}>
                <VehicleForm vehicle={editingVehicle || undefined} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Fleet;