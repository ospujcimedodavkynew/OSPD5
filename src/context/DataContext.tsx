import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Vehicle, Customer, Rental, ServiceRecord, ToastMessage, RentalRequest } from '../types';
import { initialVehicles, initialCustomers, initialRentals, initialRentalRequests } from '../data/mockData';
import { supabase } from '../supabaseClient';
// FIX: Import ToastContainer to resolve 'Cannot find name' error.
import { ToastContainer } from '../components/ui';

// Helper to decode Base64
const base64ToBlob = (base64: string, contentType: string) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
};

// Data Context Type
interface DataContextType {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  rentals: Rental[];
  setRentals: React.Dispatch<React.SetStateAction<Rental[]>>;
  rentalRequests: RentalRequest[];
  addRentalRequest: (request: Omit<RentalRequest, 'id' | 'status'>) => void;
  approveRentalRequest: (requestId: string, vehicleId: string, startDate: string, endDate: string, totalPrice: number) => Promise<void>;
  bankAccount: string;
  setBankAccount: (account: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (vehicleId: string) => void;
  addServiceRecord: (vehicleId: string, record: Omit<ServiceRecord, 'id'>) => void;
  updateServiceRecord: (vehicleId: string, record: ServiceRecord) => void;
  deleteServiceRecord: (vehicleId: string, recordId: string) => void;
  addRental: (rental: Omit<Rental, 'id'>) => void;
  deleteRental: (rentalId: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  getLicenseImageUrl: (path: string) => Promise<string | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [rentals, setRentals] = useState<Rental[]>(initialRentals);
    const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>(initialRentalRequests);
    const [bankAccount, setBankAccountState] = useState<string>('123456789/0800');
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!sessionStorage.getItem('isAuthenticated'));

    // --- Local Storage Persistence (Example, can be replaced with Supabase fetch) ---
    useEffect(() => {
        // This is a placeholder for fetching data from Supabase on initial load.
        // For now, it sticks with mock data.
    }, []);

    // --- Auth ---
    const login = (password: string) => {
        const correctPassword = import.meta.env.VITE_APP_PASSWORD || 'password';
        if (password === correctPassword) {
            sessionStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
            addToast('Přihlášení úspěšné!', 'success');
            return true;
        }
        addToast('Nesprávné heslo.', 'error');
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
        addToast('Byli jste odhlášeni.', 'info');
    };

    // --- Toasts ---
    const addToast = (message: string, type: 'success' | 'error' | 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // --- Vehicles ---
    const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => setVehicles(prev => [...prev, { ...vehicle, id: uuidv4() }]);
    const updateVehicle = (updatedVehicle: Vehicle) => setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    const deleteVehicle = (vehicleId: string) => setVehicles(prev => prev.filter(v => v.id !== vehicleId));

    // --- Service History ---
    const addServiceRecord = (vehicleId: string, record: Omit<ServiceRecord, 'id'>) => {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, serviceHistory: [...v.serviceHistory, { ...record, id: uuidv4() }] } : v));
    };
    const updateServiceRecord = (vehicleId: string, updatedRecord: ServiceRecord) => {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, serviceHistory: v.serviceHistory.map(r => r.id === updatedRecord.id ? updatedRecord : r) } : v));
    };
    const deleteServiceRecord = (vehicleId: string, recordId: string) => {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, serviceHistory: v.serviceHistory.filter(r => r.id !== recordId) } : v));
    };

    // --- Rentals ---
    const addRental = (rental: Omit<Rental, 'id'>) => setRentals(prev => [...prev, { ...rental, id: uuidv4() }]);
    const deleteRental = (rentalId: string) => setRentals(prev => prev.filter(r => r.id !== rentalId));
    
    // --- Customers ---
    const addCustomer = (customer: Omit<Customer, 'id'>): Customer => {
        const newCustomer = { ...customer, id: uuidv4() };
        setCustomers(prev => [...prev, newCustomer]);
        return newCustomer;
    };

    // --- Rental Requests (Samoobslužný proces) ---
    const addRentalRequest = (request: Omit<RentalRequest, 'id'|'status'>) => {
        const newRequest: RentalRequest = {
            ...request,
            id: uuidv4(),
            status: 'pending',
        };
        setRentalRequests(prev => [newRequest, ...prev]);
        // Here you would typically also save to Supabase
    };

    const approveRentalRequest = async (requestId: string, vehicleId: string, startDate: string, endDate: string, totalPrice: number) => {
        const request = rentalRequests.find(r => r.id === requestId);
        if (!request) {
            addToast('Žádost nenalezena.', 'error');
            return;
        }

        let imagePath = null;
        // Upload image to Supabase Storage if it exists
        if (request.drivers_license_image_base64) {
            try {
                const contentType = request.drivers_license_image_base64.match(/data:(.*);base64/)?.[1] || 'image/png';
                const fileBlob = base64ToBlob(request.drivers_license_image_base64, contentType);
                const fileExt = contentType.split('/')[1];
                const fileName = `${uuidv4()}.${fileExt}`;
                
                const { data, error } = await supabase.storage
                    .from('drivers_licenses')
                    .upload(fileName, fileBlob);

                if (error) throw error;
                imagePath = data.path;

            } catch (error) {
                console.error("Error uploading image:", error);
                addToast('Chyba při nahrávání řidičského průkazu.', 'error');
                return;
            }
        }
        
        // Create new customer
        const newCustomer: Customer = {
            id: uuidv4(),
            ...request.customer_details,
            drivers_license_image_path: imagePath
        };
        setCustomers(prev => [...prev, newCustomer]);

        // Create new rental
        const newRental: Rental = {
            id: uuidv4(),
            vehicleId,
            customerId: newCustomer.id,
            startDate,
            endDate,
            totalPrice,
            status: 'active',
            digital_consent_at: request.digital_consent_at
        };
        setRentals(prev => [...prev, newRental]);

        // Update request status
        setRentalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));

        addToast('Žádost byla schválena a smlouva vytvořena!', 'success');
    };
    
    const getLicenseImageUrl = async (path: string): Promise<string | null> => {
        try {
            const { data, error } = await supabase.storage.from('drivers_licenses').createSignedUrl(path, 60); // URL valid for 60 seconds
            if (error) throw error;
            return data.signedUrl;
        } catch (error) {
            console.error("Error getting signed URL:", error);
            addToast('Nepodařilo se načíst obrázek řidičského průkazu.', 'error');
            return null;
        }
    };


    const setBankAccount = (account: string) => {
        setBankAccountState(account);
    }
    
    return (
        <DataContext.Provider value={{ 
            vehicles, setVehicles, 
            customers, setCustomers,
            rentals, setRentals,
            rentalRequests, addRentalRequest, approveRentalRequest,
            bankAccount, setBankAccount,
            addToast,
            isAuthenticated, login, logout,
            addVehicle, updateVehicle, deleteVehicle,
            addServiceRecord, updateServiceRecord, deleteServiceRecord,
            addRental, deleteRental,
            addCustomer, getLicenseImageUrl
        }}>
            {children}
            <ToastContainer toasts={toasts} />
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};