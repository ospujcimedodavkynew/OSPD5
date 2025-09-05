import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Input, Button } from './ui';

const Settings: React.FC = () => {
    const { bankAccount, setBankAccount, addToast } = useData();
    const [tempBankAccount, setTempBankAccount] = useState(bankAccount);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setBankAccount(tempBankAccount);
        addToast('Nastavení bylo uloženo.', 'success');
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">Nastavení</h1>
            <Card>
                <form onSubmit={handleSave} className="space-y-4">
                    <h2 className="text-xl font-bold">Platební údaje</h2>
                    <p className="text-sm text-text-secondary">Tento bankovní účet se bude zobrazovat na QR kódech pro platbu.</p>
                    <Input 
                        label="Číslo bankovního účtu"
                        value={tempBankAccount}
                        onChange={(e) => setTempBankAccount(e.target.value)}
                        placeholder="např. 123456789/0800"
                        required
                    />
                    <div className="flex justify-end pt-4">
                        <Button type="submit">Uložit nastavení</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Settings;
