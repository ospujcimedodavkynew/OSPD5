import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { Rental } from '../types';
import { Button, Card, Modal } from './ui';
import { PlusIcon, EyeIcon, Trash2Icon } from './Icons';
import NewRentalForm from './NewRentalForm';
import ContractView from './ContractView';

const Rentals: React.FC = () => {
    const { rentals, deleteRental, vehicles, customers } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingContract, setViewingContract] = useState<Rental | null>(null);
    const [filter, setFilter] = useState<'active' | 'completed' | 'pending' | 'all'>('all');

    const filteredRentals = useMemo(() => {
        const sortedRentals = [...rentals].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        if (filter === 'all') return sortedRentals;
        return sortedRentals.filter(r => r.status === filter);
    }, [rentals, filter]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Pronájmy</h1>
                <Button onClick={() => setIsModalOpen(true)}><PlusIcon className="w-5 h-5 mr-2" /> Nový pronájem</Button>
            </div>
            
            <div className="flex space-x-2">
                {(['all', 'active', 'completed', 'pending'] as const).map(f => (
                    <Button 
                        key={f}
                        variant={filter === f ? 'primary' : 'secondary'}
                        onClick={() => setFilter(f)}
                    >
                        { {all: 'Všechny', active: 'Aktivní', completed: 'Ukončené', pending: 'Čekající'}[f] }
                    </Button>
                ))}
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-4">Vozidlo</th>
                                <th className="p-4">Zákazník</th>
                                <th className="p-4">Od</th>
                                <th className="p-4">Do</th>
                                <th className="p-4">Cena</th>
                                <th className="p-4">Stav</th>
                                <th className="p-4">Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRentals.map(rental => {
                                const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                                const customer = customers.find(c => c.id === rental.customerId);
                                return (
                                    <tr key={rental.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="p-4 font-medium">{vehicle?.brand || 'N/A'}</td>
                                        <td className="p-4">{customer ? `${customer.first_name} ${customer.last_name}` : 'N/A'}</td>
                                        <td className="p-4">{new Date(rental.startDate).toLocaleString('cs-CZ')}</td>
                                        <td className="p-4">{new Date(rental.endDate).toLocaleString('cs-CZ')}</td>
                                        <td className="p-4">{rental.totalPrice.toLocaleString('cs-CZ')} Kč</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                rental.status === 'active' ? 'bg-green-500/20 text-green-300' :
                                                rental.status === 'completed' ? 'bg-gray-500/20 text-gray-300' :
                                                'bg-yellow-500/20 text-yellow-300'
                                            }`}>
                                                {rental.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => setViewingContract(rental)}><EyeIcon className="w-4 h-4" /></Button>
                                                <Button size="sm" variant="danger" onClick={() => deleteRental(rental.id)}><Trash2Icon className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Vytvořit nový pronájem">
                <NewRentalForm onFinished={() => setIsModalOpen(false)} />
            </Modal>
            
            {viewingContract && <ContractView rental={viewingContract} onClose={() => setViewingContract(null)} />}
        </div>
    );
};

export default Rentals;
