
import { PricingPlan } from './types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan_20',
    name: 'Starter Pack',
    credits: 20,
    price: 199,
    features: ['20 AI Edits', 'Standard Priority', 'Save to Google Drive'],
  },
  {
    id: 'plan_50',
    name: 'Creator Pack',
    credits: 50,
    price: 299,
    features: ['50 AI Edits', 'High Priority', 'Save to Google Drive'],
  },
  {
    id: 'plan_100',
    name: 'Pro Pack',
    credits: 100,
    price: 499,
    features: ['100 AI Edits', 'Highest Priority', 'Save to Google Drive'],
  },
];
