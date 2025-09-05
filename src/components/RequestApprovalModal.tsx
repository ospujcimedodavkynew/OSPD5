import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import type { RentalRequest } from '../types'; // FIX: Removed unused 'Vehicle' import
import { Modal, Button, Select, Input } from './ui';

interface RequestApprovalModalProps {
    request: RentalRequest;
    onClose: () => void;
}

const RequestApprovalModal: React.FC<RequestApprovalModalProps> = ({ request, onClose }) => {
    const { vehicles, approveRentalRequest, addToast } = useData();
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (request.drivers_license_image_base64) {
             setImageUrl(request.drivers_license_image_base64);
        }
    }, [request]);

    useEffect(() => {
        const vehicle = vehicles.find(v => v.id === selectedVehicleId);
        if (vehicle && startDate && endDate) {
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();
            if (end > start) {
                const durationHours = (end - start) / (1000 * 60 * 60);
                const durationDays = Math.ceil(durationHours / 24);
                setTotalPrice(durationDays * (vehicle.pricing.perDay || 0));
            } else {
                setTotalPrice(0);
            }
        }
    }, [selectedVehicleId, startDate, endDate, vehicles]);

    const handleApprove = async () => {
        if (!selectedVehicleId || !startDate || !endDate || totalPrice <= 0) {
            addToast("Vyplňte prosím všechny údaje pro schválení.", 'error');
            return;
        }
        await approveRentalRequest(request.id, selectedVehicleId, startDate, endDate, totalPrice);
        onClose();
    };

    const handleReject = () => {
        console.log("Request rejected:", request.id);
        addToast("Žádost byla zamítnuta.", "info");
        onClose();
    };
    
    const { customer_details } = request;

    return (
        <Modal isOpen={true} onClose={onClose} title="Schválení žádosti o pronájem">
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg mb-2">Detaily zákazníka</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm bg-gray-800 p-4 rounded-lg">
                        <p><strong>Jméno:</strong> {customer_details.first_name} {customer_details.last_name}</p>
                        <p><strong>Email:</strong> {customer_details.email}</p>
                        <p><strong>Telefon:</strong> {customer_details.phone}</p>
                        <p><strong>Číslo OP:</strong> {customer_details.id_card_number}</p>
                        <p><strong>Číslo ŘP:</strong> {customer_details.drivers_license_number}</p>
                    </div>
                </div>

                {imageUrl && (
                     <div>
                        <h3 className="font-bold text-lg mb-2">Snímek řidičského průkazu</h3>
                        <img src={imageUrl} alt="Řidičský průkaz" className="max-w-sm rounded-lg border border-gray-600" />
                    </div>
                )}
                
                <div>
                    <h3 className="font-bold text-lg mb-2">Detaily pronájmu</h3>
                    <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
                        <Select label="Přiřadit vozidlo" value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)} required>
                            <option value="">-- Vyberte vozidlo --</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} - {v.license_plate}</option>)}
                        </Select>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Začátek pronájmu" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                            <Input label="Konec pronájmu" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </div>
                         <p className="font-bold text-lg text-right">Cena: {totalPrice.toLocaleString('cs-CZ')} Kč</p>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                    <Button variant="danger" onClick={handleReject}>Zamítnout</Button>
                    <Button onClick={handleApprove}>Schválit a vytvořit smlouvu</Button>
                </div>
            </div>
        </Modal>
    );
};
export default RequestApprovalModal;
