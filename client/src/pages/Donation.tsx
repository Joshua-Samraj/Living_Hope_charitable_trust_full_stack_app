import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, CheckCircle, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

const DonationForm: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    amount: 0,
    frequency: 'one-time',
    categories: [] as string[],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Predefined donation amounts
  const amountOptions = [500, 1000, 2500, 5000];
  const frequencyOptions = [
    { value: 'one-time', label: 'One Time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get<Category[]>('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
        setError('Failed to load donation categories.');
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountSelect = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
  };

  const handleFrequencySelect = (frequency: string) => {
    setFormData(prev => ({ ...prev, frequency }));
  };
const handleCategoryToggle = (categoryName: string) => {
  setFormData(prev => {
    const newCategories = prev.categories.includes(categoryName)
      ? prev.categories.filter(name => name !== categoryName)
      : [...prev.categories, categoryName];
    return { ...prev, categories: newCategories };
  });
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!formData.name || !formData.phone || !formData.amount) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('/api/donations', formData);
      setSuccess('Thank you for your donation!');
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        amount: 0,
        frequency: 'one-time',
        categories: [],
      });
    } catch (err) {
      setError('Donation failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Heart className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Make a Donation</h1>
          </div>
          <p className="text-blue-100">Support our cause with your contribution</p>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
              <div className="mr-2">⚠️</div>
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 mr-2" />
              <div>{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Donation Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {amountOptions.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleAmountSelect(amount)}
                    className={`py-2 px-3 rounded-lg border transition-colors ${
                      formData.amount === amount
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ₹{amount.toLocaleString()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleAmountSelect(0)}
                  className={`py-2 px-3 rounded-lg border transition-colors col-span-2 ${
                    formData.amount === 0
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Custom Amount
                </button>
              </div>
              {formData.amount === 0 && (
                <input
                  type="number"
                  min="1"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) || 0 }))}
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  required
                />
              )}
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Frequency
              </label>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {frequencyOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleFrequencySelect(option.value)}
                    className={`flex-1 py-2 px-3 rounded-lg border transition-colors whitespace-nowrap ${
                      formData.frequency === option.value
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where should we allocate your donation?
              </label>
              <div className="space-y-2">
                {categories.map(category => (
  <div
    key={category.id}  // Still use id for React key
    onClick={() => handleCategoryToggle(category.name)}
    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
      formData.categories.includes(category.name)
        ? 'bg-blue-100 border-blue-500 text-blue-700'
        : 'border-gray-300 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={formData.categories.includes(category.name)}
        onChange={() => {}}
        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
      />
      <span>{category.name}</span>
    </div>
  </div>
))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-5 w-5" />
                    Donate Now
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonationForm;