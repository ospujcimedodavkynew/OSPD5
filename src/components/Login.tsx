import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card, Input, Button } from './ui';

const Login: React.FC = () => {
    const [password, setPassword] = useState('');
    const { login } = useData();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            navigate('/');
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Rental<span className="text-accent">Manager</span></h1>
                        <p className="text-text-secondary">Prosím, zadejte heslo pro přístup</p>
                    </div>
                    <Input 
                        label="Heslo"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" className="w-full">Přihlásit se</Button>
                </form>
            </Card>
        </div>
    );
};

export default Login;
