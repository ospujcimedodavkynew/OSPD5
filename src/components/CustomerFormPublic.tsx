import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Input, Button, TermsModal } from './ui';
import { CameraIcon, CheckIcon } from './Icons';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const CustomerFormPublic: React.FC = () => {
    const { addRentalRequest } = useData();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_card_number: '',
        drivers_license_number: '',
    });
    const [licenseImage, setLicenseImage] = useState<File | null>(null);
    const [licenseImagePreview, setLicenseImagePreview] = useState<string | null>(null);
    const [consent, setConsent] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLicenseImage(file);
            setLicenseImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!consent) {
            alert("Musíte souhlasit s obchodními podmínkami.");
            return;
        }

        let imageBase64: string | null = null;
        if (licenseImage) {
            imageBase64 = await fileToBase64(licenseImage);
        }

        addRentalRequest({
            customer_details: formData,
            drivers_license_image_base64: imageBase64,
            digital_consent_at: new Date().toISOString(),
        });
        
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="max-w-lg text-center p-8">
                    <CheckIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Děkujeme za vaši žádost!</h1>
                    <p className="text-text-secondary">Vaše žádost o pronájem byla odeslána. Brzy se vám ozveme s dalšími informacemi. Zpracování může trvat až 24 hodin.</p>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Žádost o pronájem vozidla</h1>
                        <p className="text-text-secondary">Vyplňte prosím své údaje pro odeslání nezávazné poptávky.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Křestní jméno" name="first_name" value={formData.first_name} onChange={handleChange} required />
                        <Input label="Příjmení" name="last_name" value={formData.last_name} onChange={handleChange} required />
                        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        <Input label="Telefon" name="phone" value={formData.phone} onChange={handleChange} required />
                        <Input label="Číslo občanského průkazu" name="id_card_number" value={formData.id_card_number} onChange={handleChange} required />
                        <Input label="Číslo řidičského průkazu" name="drivers_license_number" value={formData.drivers_license_number} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Snímek řidičského průkazu (nepovinné)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {licenseImagePreview ? (
                                    <img src={licenseImagePreview} alt="Náhled ŘP" className="mx-auto h-24 w-auto rounded" />
                                ) : (
                                    <CameraIcon className="mx-auto h-12 w-12 text-gray-500" />
                                )}
                                <div className="flex text-sm text-gray-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-surface rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-focus">
                                        <span>Nahrát soubor</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                    <p className="pl-1">nebo přetáhněte</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF až 10MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start">
                         <div className="flex items-center h-5">
                            <input id="consent" name="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="focus:ring-primary h-4 w-4 text-primary border-gray-600 rounded bg-gray-900" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="consent" className="font-medium text-text-primary">Souhlasím s <button type="button" onClick={() => setShowTerms(true)} className="text-primary hover:underline">obchodními podmínkami</button></label>
                            <p className="text-text-secondary">Váš souhlas je vyžadován pro odeslání žádosti.</p>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={!consent}>Odeslat žádost</Button>
                </form>
            </Card>
            {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
        </div>
    );
};

export default CustomerFormPublic;
