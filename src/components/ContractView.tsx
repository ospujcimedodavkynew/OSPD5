import React from 'react';
import type { Rental } from '../types';
import { useData } from '../context/DataContext';
import { Modal, Button } from './ui';
import SignaturePad, { SignaturePadRef } from './SignaturePad';

interface ContractViewProps {
    rental: Rental;
    onClose: () => void;
}

const ContractView: React.FC<ContractViewProps> = ({ rental, onClose }) => {
    const { vehicles, customers, bankAccount } = useData();

    const vehicle = vehicles.find(v => v.id === rental.vehicleId);
    const customer = customers.find(c => c.id === rental.customerId);

    const customerSignatureRef = React.useRef<SignaturePadRef>(null);
    const companySignatureRef = React.useRef<SignaturePadRef>(null);

    const handleSaveSignatures = () => {
        // This is a mock implementation. In a real app, you would
        // likely call a context function to update the rental record.
        const customerSig = customerSignatureRef.current?.getSignature();
        const companySig = companySignatureRef.current?.getSignature();
        console.log("Customer Signature:", customerSig);
        console.log("Company Signature:", companySig);
        alert("Podpisy uloženy (viz konzole). Pro demonstrační účely nejsou perzistentní.");
    };
    
    const handlePrint = () => {
        const printableContent = document.getElementById('printable-contract');
        if (printableContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            printWindow?.document.write('<html><head><title>Smlouva o pronájmu</title>');
            printWindow?.document.write(`
                <style>
                    body { font-family: sans-serif; margin: 2rem; color: #000; }
                    h1, h2, h3 { color: #111; }
                    .contract-section { margin-bottom: 1.5rem; border-bottom: 1px solid #ccc; padding-bottom: 1rem; page-break-inside: avoid; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                    p { margin: 0.25rem 0; }
                    .signature-box { margin-top: 2rem; border-top: 1px solid #000; padding-top: 0.5rem; text-align: center; page-break-inside: avoid; }
                    img { max-width: 100%; height: auto; }
                </style>
            `);
            printWindow?.document.write('</head><body>');
            printWindow?.document.write(printableContent.innerHTML);
            printWindow?.document.write('</body></html>');
            printWindow?.document.close();
            printWindow?.focus();
            printWindow?.print();
        }
    };

    if (!vehicle || !customer) {
        return (
            <Modal isOpen={true} onClose={onClose} title="Chyba">
                <p>Nepodařilo se načíst údaje o vozidle nebo zákazníkovi.</p>
            </Modal>
        );
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SPD*1.0*ACC:${bankAccount}*AM:${rental.totalPrice}*CC:CZK*MSG:Najem ${vehicle.brand} ${rental.id.substring(0,8)}`;

    return (
        <Modal isOpen={true} onClose={onClose} title={`Smlouva o pronájmu - ${vehicle.brand}`}>
            <div id="printable-contract" className="space-y-6 text-sm">
                <div className="flex justify-between items-start contract-section">
                    <div>
                        <h2 className="text-lg font-bold">Smlouva o pronájmu vozidla</h2>
                        <p className="text-text-secondary">Číslo smlouvy: {rental.id}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-base">RentalManager s.r.o.</h3>
                        <p className="text-text-secondary">Ukázková 123, 110 00 Praha 1</p>
                        <p className="text-text-secondary">IČO: 12345678</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 contract-section">
                    <div>
                        <h3 className="font-semibold mb-2">Pronajímatel</h3>
                        <p>RentalManager s.r.o.</p>
                        <p>Ukázková 123, 110 00 Praha 1</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Nájemce</h3>
                        <p>{customer.first_name} {customer.last_name}</p>
                        <p>{customer.email}, {customer.phone}</p>
                        <p>ČOP: {customer.id_card_number}, ČŘP: {customer.drivers_license_number}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 contract-section">
                    <div>
                        <h3 className="font-semibold mb-2">Předmět pronájmu</h3>
                        <p><strong>Vozidlo:</strong> {vehicle.brand}</p>
                        <p><strong>SPZ:</strong> {vehicle.license_plate}</p>
                        <p><strong>VIN:</strong> {vehicle.vin}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Doba pronájmu</h3>
                        <p><strong>Od:</strong> {new Date(rental.startDate).toLocaleString('cs-CZ')}</p>
                        <p><strong>Do:</strong> {new Date(rental.endDate).toLocaleString('cs-CZ')}</p>
                    </div>
                </div>

                <div className="contract-section">
                    <h3 className="font-semibold mb-2">Cena a platební podmínky</h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <p><strong>Celková cena:</strong> {rental.totalPrice.toLocaleString('cs-CZ')} Kč</p>
                             {rental.digital_consent_at && <p className="text-xs text-green-400 mt-2">Zákazník digitálně souhlasil s podmínkami.</p>}
                        </div>
                        <img src={qrCodeUrl} alt="QR platba" />
                    </div>
                </div>
                
                <div>
                     <h3 className="font-semibold mb-2">Podpisy</h3>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="signature-box">
                            {rental.customer_signature ? (
                                <img src={rental.customer_signature} alt="Podpis zákazníka" className="border border-gray-600 rounded-lg bg-gray-800 mx-auto max-h-24" />
                            ) : (
                                <SignaturePad ref={customerSignatureRef} />
                            )}
                            <p className="border-t border-gray-600 mt-2 pt-1 text-center">{customer.first_name} {customer.last_name}</p>
                        </div>
                         <div className="signature-box">
                             {rental.company_signature ? (
                                <img src={rental.company_signature} alt="Podpis firmy" className="border border-gray-600 rounded-lg bg-gray-800 mx-auto max-h-24" />
                            ) : (
                               <SignaturePad ref={companySignatureRef} />
                            )}
                            <p className="border-t border-gray-600 mt-2 pt-1 text-center">RentalManager s.r.o.</p>
                        </div>
                     </div>
                </div>
            </div>
            
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
                <div>
                    {(!rental.customer_signature && !rental.company_signature) && (
                        <Button variant="secondary" onClick={handleSaveSignatures}>Uložit podpisy</Button>
                    )}
                </div>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={handlePrint}>Tisk</Button>
                    <Button onClick={onClose}>Zavřít</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ContractView;