import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from './ui';
import { Car, DollarSign, FileText } from './Icons';
import type { RentalRequest } from '../types';
import RequestApprovalModal from './RequestApprovalModal';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 mr-4 text-primary bg-primary/10 rounded-full">{icon}</div>
        <div>
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </Card>
);

const Dashboard: React.FC = () => {
    const { vehicles, rentals, rentalRequests } = useData();
    const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);

    const activeRentals = rentals.filter(r => r.status === 'active');
    const totalRevenue = rentals.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.totalPrice, 0);

    const pendingRequests = rentalRequests.filter(r => r.status === 'pending');

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Přehled</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Vozidel k dispozici" value={vehicles.length} icon={<Car className="w-6 h-6" />} />
                <StatCard title="Aktivních pronájmů" value={activeRentals.length} icon={<FileText className="w-6 h-6" />} />
                <StatCard title="Celkové tržby" value={`${totalRevenue.toLocaleString('cs-CZ')} Kč`} icon={<DollarSign className="w-6 h-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-bold mb-4">Nové žádosti o pronájem</h2>
                    {pendingRequests.length > 0 ? (
                        <div className="space-y-3">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{req.customer_details.first_name} {req.customer_details.last_name}</p>
                                        <p className="text-sm text-text-secondary">{req.customer_details.email}</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedRequest(req)}
                                        className="text-primary hover:text-primary-focus font-semibold"
                                    >
                                        Zobrazit
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-secondary">Žádné nové žádosti.</p>
                    )}
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-4">Aktivní pronájmy</h2>
                    {activeRentals.length > 0 ? (
                        <div className="space-y-3">
                            {activeRentals.map(rental => {
                                const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                                return (
                                    <div key={rental.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{vehicle?.brand}</p>
                                            <p className="text-sm text-text-secondary">Do: {new Date(rental.endDate).toLocaleDateString('cs-CZ')}</p>
                                        </div>
                                        <p className="font-bold text-lg">{rental.totalPrice.toLocaleString('cs-CZ')} Kč</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-text-secondary">Žádné aktivní pronájmy.</p>
                    )}
                </Card>
            </div>

            {selectedRequest && (
                <RequestApprovalModal 
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
