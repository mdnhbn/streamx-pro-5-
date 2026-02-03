import React, { useState } from 'react';
import { X, CreditCard, Bitcoin, Wallet, Check } from 'lucide-react';
import { translations } from '../translations';
import { Language } from '../types';

interface ProModalProps {
  onClose: () => void;
  onSubscribe: () => void;
  language: Language;
}

export const ProModal: React.FC<ProModalProps> = ({ onClose, onSubscribe, language }) => {
  const [activeTab, setActiveTab] = useState<'card' | 'crypto' | 'local'>('card');
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'special'>('special');
  const t = translations[language];

  const handlePayment = () => {
    // Mock payment processing
    setTimeout(() => {
        // Set Expiration in LocalStorage (5 months from now)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 5);
        localStorage.setItem('streamx_pro_expiry', expiryDate.toISOString());
        
        onSubscribe();
        onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="bg-primary p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full">
            <X size={20} />
          </button>
          <h2 className="text-2xl font-black italic tracking-tighter">{t.proTitle}</h2>
          <p className="text-sm opacity-90 mt-1">{t.proDesc}</p>
        </div>

        <div className="p-6">
          {/* Plans */}
          <div className="flex gap-4 mb-6">
            <div 
              onClick={() => setSelectedPlan('standard')}
              className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === 'standard' ? 'border-primary bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Monthly</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">$1.99</div>
              <div className="text-[10px] text-gray-500">per month</div>
            </div>

            <div 
              onClick={() => setSelectedPlan('special')}
              className={`flex-1 p-3 rounded-xl border-2 cursor-pointer relative overflow-hidden transition-all ${selectedPlan === 'special' ? 'border-primary bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-bl">{t.bestValue}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">5 Months</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">$5.99</div>
              <div className="text-[10px] text-primary font-bold">{t.buy3get2}</div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check size={16} className="text-green-500" /> <span>Ad-free experience</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check size={16} className="text-green-500" /> <span>4K & 60fps Downloads</span>
            </div>
             <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check size={16} className="text-green-500" /> <span>Background Play & PiP</span>
            </div>
          </div>

          {/* Payment Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button 
              className={`flex-1 pb-2 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'card' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('card')}
            >
              <CreditCard size={16} /> Card
            </button>
            <button 
              className={`flex-1 pb-2 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'crypto' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('crypto')}
            >
              <Bitcoin size={16} /> Crypto
            </button>
            <button 
              className={`flex-1 pb-2 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'local' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('local')}
            >
              <Wallet size={16} /> Local
            </button>
          </div>

          {/* Payment Form Content */}
          <div className="min-h-[120px]">
            {activeTab === 'card' && (
              <div className="space-y-3 animate-fade-in">
                <input type="text" placeholder="Card Number" className="w-full p-3 bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:border-primary" />
                <div className="flex gap-3">
                    <input type="text" placeholder="MM/YY" className="flex-1 p-3 bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:border-primary" />
                    <input type="text" placeholder="CVC" className="flex-1 p-3 bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:border-primary" />
                </div>
              </div>
            )}
            {activeTab === 'crypto' && (
              <div className="text-center animate-fade-in space-y-3">
                 <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Send USDT (TRC20) to:</div>
                 <div className="bg-gray-100 dark:bg-black p-3 rounded-lg text-xs font-mono break-all dark:text-primary">
                    TX9Qz5..2Lp7M
                 </div>
                 <div className="text-xs text-yellow-600">Awaiting transaction...</div>
              </div>
            )}
            {activeTab === 'local' && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                 <button className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <span className="font-bold text-pink-600">bKash</span>
                 </button>
                 <button className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <span className="font-bold text-orange-600">Nagad</span>
                 </button>
              </div>
            )}
          </div>

          <button 
            onClick={handlePayment}
            className="w-full mt-6 bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg transform transition-transform active:scale-95"
          >
            {t.upgrade}
          </button>
        </div>
      </div>
    </div>
  );
};