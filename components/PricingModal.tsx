
import React from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { PRICING_PLANS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const { user, refreshUser } = useAuth();

    const handlePayment = async (plan: typeof PRICING_PLANS[0]) => {
        if (!user) {
            alert('You must be logged in to make a purchase.');
            return;
        }

        const options = {
            key: process.env.VITE_RAZORPAY_KEY_ID,
            amount: plan.price * 100, // amount in the smallest currency unit
            currency: 'INR',
            name: 'AI Photo Editor Pro',
            description: `Purchase ${plan.credits} Credits`,
            image: 'https://picsum.photos/128', // Replace with your logo URL
            handler: async (response: any) => {
                console.log('Payment successful:', response);
                // WARNING: In a production app, you should verify the payment on your backend
                // before updating the user's credits to prevent fraud.
                // For this project, we'll update the database directly on client-side success callback.
                
                const currentCredits = user.credits || 0;
                const newCredits = currentCredits + plan.credits;

                const { error } = await supabase
                  .from('users')
                  .update({ credits: newCredits })
                  .eq('googleid', user.googleid);

                if (error) {
                    alert('Payment successful, but failed to update credits. Please contact support.');
                    console.error('Error updating credits:', error);
                } else {
                    alert(`Payment successful! ${plan.credits} credits have been added to your account.`);
                    await refreshUser();
                    onClose();
                }
            },
            prefill: {
                name: user.name ?? 'Valued Customer',
                email: user.email,
            },
            theme: {
                color: '#4f46e5',
            },
        };
        
        // This is a browser environment, window will be available.
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Purchase Credits">
            <div className="space-y-6">
                <p className="text-gray-400">
                    Choose a package that suits your needs. Each credit allows you for one AI-powered photo edit.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRICING_PLANS.map((plan, index) => (
                        <div key={plan.id} className={`p-6 rounded-lg border flex flex-col ${index === 1 ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 bg-gray-800'}`}>
                           <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                           <p className="mt-2">
                               <span className="text-4xl font-extrabold text-white">{plan.credits}</span>
                               <span className="text-base font-medium text-gray-400"> Credits</span>
                           </p>
                           <p className="mt-4 text-gray-300">
                               <span className="text-3xl font-bold">₹{plan.price}</span>
                           </p>
                           <ul className="mt-6 space-y-2 text-sm text-gray-400 flex-grow">
                               {plan.features.map(feature => (
                                   <li key={feature} className="flex space-x-3">
                                       <svg className="flex-shrink-0 h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                       <span>{feature}</span>
                                   </li>
                               ))}
                           </ul>
                           <Button onClick={() => handlePayment(plan)} className="mt-8 w-full justify-center" variant={index === 1 ? 'primary' : 'secondary'}>
                               Buy Now
                           </Button>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default PricingModal;