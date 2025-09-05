import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import type { Customer, Vehicle } from '../types';
import { Input, Select, Button } from './ui';
import CustomerDetailsForm from './CustomerDetailsForm';

const NewRentalForm: React.FC<{ onFinished: () => void; }> = ({ onFinished }) => {
    const { vehicles, customers, addRental, addCustomer, addToast } = useData();
    const [step, setStep] = useState(1); // 1: Select, 2: New Customer Form
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    useEffect(() => {
        const vehicle = vehicles.find(v => v.id === selectedVehicleId);
        setSelectedVehicle(vehicle || null);
    }, [selectedVehicleId, vehicles]);

    useEffect(() => {
        if (selectedVehicle && startDate && endDate) {
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();
            if (end > start) {
                const durationHours = (end - start) / (1000 * 60 * 60);
                const durationDays = Math.ceil(durationHours / 24);
                
                // Simple pricing logic: use daily rate
                const calculatedPrice = durationDays * (selectedVehicle.pricing.perDay || 0);
                setTotalPrice(calculatedPrice);
            } else {
                setTotalPrice(0);
            }
        }
    }, [selectedVehicle, startDate, endDate]);

    const handleNewCustomerSave = (newCustomerData: Omit<Customer, 'id'>) => {
        const newCustomer = addCustomer(newCustomerData);
        setSelectedCustomerId(newCustomer.id);
        setStep(1); // Go back to main form
        addToast('Nový zákazník byl úspěšně přidán.', 'success');
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId || !selectedVehicleId || !startDate || !endDate || totalPrice <= 0) {
            addToast('Prosím, vyplňte všechna pole správně.', 'error');
            return;
        }

        addRental({
            vehicleId: selectedVehicleId,
            customerId: selectedCustomerId,
            startDate,
            endDate,
            totalPrice,
            status: 'active',
        });
        addToast('Pronájem byl úspěšně vytvořen.', 'success');
        onFinished();
    };

    if (step === 2) {
        const blankCustomer: Customer = { id: '', first_name: '', last_name: '', email: '', phone: '', id_card_number: '', drivers_license_number: ''};
        return (
            <div>
                 <h3 className="text-lg font-bold mb-4">Nový zákazník</h3>
                 <CustomerDetailsForm customer={blankCustomer} onSave={(c) => handleNewCustomerSave(c)} onCancel={() => setStep(1)} />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 items-end">
                <Select label="Zákazník" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} required>
                    <option value="">-- Vyberte zákazníka --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </Select>
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>Nový</Button>
            </div>
            
            <Select label="Vozidlo" value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)} required>
                <option value="">-- Vyberte vozidlo --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} - {v.license_plate}</option>)}
            </Select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Začátek pronájmu" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                <Input label="Konec pronájmu" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
            
            <div>
                <h3 className="font-bold text-lg">Celková cena: {totalPrice.toLocaleString('cs-CZ')} Kč</h3>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onFinished}>Zrušit</Button>
                <Button type="submit">Vytvořit pronájem</Button>
            </div>
        </form>
    );
};

export default NewRentalForm;
