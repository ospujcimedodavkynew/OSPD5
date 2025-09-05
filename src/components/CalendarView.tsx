import React from 'react';
import { useData } from '../context/DataContext';
import { Card } from './ui';

const CalendarView: React.FC = () => {
    const { rentals, vehicles, customers } = useData();

    // Sort rentals by start date for timeline view
    const sortedRentals = [...rentals].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Kalendář pronájmů</h1>

            <Card>
                <div className="space-y-4">
                    {sortedRentals.length > 0 ? sortedRentals.map(rental => {
                        const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                        const customer = customers.find(c => c.id === rental.customerId);
                        const isPast = new Date(rental.endDate) < new Date();
                        const isActive = new Date(rental.startDate) <= new Date() && new Date(rental.endDate) >= new Date();

                        return (
                            <div key={rental.id} className={`flex items-start p-4 rounded-lg border-l-4 ${
                                isActive ? 'border-green-500 bg-green-500/10' :
                                isPast ? 'border-gray-600 bg-gray-800/50' :
                                'border-blue-500 bg-blue-500/10'
                            }`}>
                                <div className="flex-1">
                                    <p className="font-bold text-lg">{vehicle?.brand}</p>
                                    <p className="text-sm text-text-secondary">Zákazník: {customer?.first_name} {customer?.last_name}</p>
                                </div>
                                <div className="text-right">
                                     <p className="font-semibold">{new Date(rental.startDate).toLocaleString('cs-CZ')}</p>
                                     <p className="text-sm text-text-secondary">až</p>
                                     <p className="font-semibold">{new Date(rental.endDate).toLocaleString('cs-CZ')}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-text-secondary p-4">Žádné pronájmy k zobrazení.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CalendarView;
