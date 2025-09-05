import React from 'react';
import { XIcon } from './Icons';

// Card
export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-surface rounded-xl shadow-lg p-6 ${className}`}>{children}</div>
);

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}
export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
    const baseClasses = 'font-bold rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-primary hover:bg-primary-focus text-white focus:ring-2 focus:ring-primary-focus focus:ring-opacity-50',
        secondary: 'bg-gray-600 hover:bg-gray-500 text-white focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-700 focus:ring-opacity-50',
    };
    const sizeClasses = { sm: 'py-1 px-3 text-sm', md: 'py-2 px-4', lg: 'py-3 px-6 text-lg' };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

// Input & Textarea & Select
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; }
export const Input: React.FC<InputProps> = ({ label, ...props }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" {...props} />
    </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label: string; }
export const Textarea: React.FC<TextareaProps> = ({ label, ...props }) => (
     <div className="w-full">
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <textarea className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" {...props}></textarea>
    </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label: string; }
export const Select: React.FC<SelectProps> = ({ label, children, ...props }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary appearance-none" {...props}>
            {children}
        </select>
    </div>
);


// Modal
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                </header>
                <main className="p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

// Toast
interface ToastProps { message: string; type: 'success' | 'error' | 'info'; }
export const Toast: React.FC<ToastProps> = ({ message, type }) => {
    const baseClasses = 'p-4 rounded-lg shadow-md text-white font-semibold';
    const typeClasses = {
        success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500'
    };
    return <div className={`${baseClasses} ${typeClasses[type]}`}>{message}</div>;
};

interface ToastMessage { id: number; message: string; type: 'success' | 'error' | 'info'; }
interface ToastContainerProps { toasts: ToastMessage[]; }
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => (
    <div className="fixed bottom-5 right-5 z-50 space-y-3">
        {toasts.map(toast => <Toast key={toast.id} {...toast} />)}
    </div>
);

// TermsModal
export const TermsModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose} title="Všeobecné obchodní podmínky">
            <div className="prose prose-invert prose-sm max-w-none">
                <h4>1. Úvodní ustanovení</h4>
                <p>Tyto všeobecné obchodní podmínky upravují vztahy mezi pronajímatelem a nájemcem při pronájmu vozidel.</p>
                <h4>2. Práva a povinnosti</h4>
                <p>Nájemce je povinen užívat vozidlo řádně a v souladu s technickými předpisy. Je zakázáno provádět jakékoliv úpravy na vozidle.</p>
                <h4>3. Platební podmínky</h4>
                <p>Cena za pronájem je splatná předem, pokud není dohodnuto jinak. V ceně je zahrnuto zákonné pojištění.</p>
                {/* Add more sections as needed */}
            </div>
        </Modal>
    );
};
