import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { volunteerService } from '../services/volunteerService';

const VolunteerForm: React.FC = () => {
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validation functions
  const validateName = (value: string) => {
    if (!value.trim()) return 'Full name is required';
    if (value.trim().length < 3) return 'Name must be at least 3 characters';
    return '';
  };

  const validateAge = (value: string) => {
    if (!value) return 'Age is required';
    const ageNum = parseInt(value, 10);
    if (isNaN(ageNum)) return 'Age must be a number';
    if (ageNum < 18) return 'You must be at least 18 years old to volunteer';
    if (ageNum > 100) return 'Please enter a valid age';
    return '';
  };

  const validatePhone = (value: string) => {
    if (!value) return 'Phone number is required';
    // Indian phone number validation (10 digits, optionally with +91 prefix)
    if (!/^(\+91)?[6-9]\d{9}$/.test(value)) {
      return 'Please enter a valid Indian phone number';
    }
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateLocation = (value: string) => {
    if (!value.trim()) return 'Location is required';
    return '';
  };

  const validateAadhaar = (value: string) => {
    if (!value) return 'Aadhaar number is required';
    if (!/^\d{12}$/.test(value)) {
      return 'Please enter a valid 12-digit Aadhaar number';
    }
    return '';
  };

  // Handle input changes with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    // Update state based on input name
    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'age':
        // Only allow numbers
        if (value === '' || /^\d+$/.test(value)) {
          setAge(value);
        }
        break;
      case 'phone':
        // Only allow numbers and + symbol
        if (value === '' || /^[\d+]+$/.test(value)) {
          setPhone(value);
        }
        break;
      case 'email':
        setEmail(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'aadhaarNumber':
        // Only allow numbers
        if (value === '' || /^\d+$/.test(value)) {
          setAadhaarNumber(value);
        }
        break;
      case 'disclaimerAccepted':
        if (checked !== undefined) {
          setDisclaimerAccepted(checked);
        }
        break;
      default:
        break;
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;
    
    const ageError = validateAge(age);
    if (ageError) newErrors.age = ageError;
    
    const phoneError = validatePhone(phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    const locationError = validateLocation(location);
    if (locationError) newErrors.location = locationError;
    
    const aadhaarError = validateAadhaar(aadhaarNumber);
    if (aadhaarError) newErrors.aadhaarNumber = aadhaarError;
    
    if (!disclaimerAccepted) {
      newErrors.disclaimerAccepted = 'You must accept the disclaimer to proceed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset submission states
    setSubmitSuccess(false);
    setSubmitError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await volunteerService.submitApplication({
        name,
        age: parseInt(age, 10),
        phone,
        email,
        location,
        aadhaarNumber,
        disclaimerAccepted,
      });
      
      // Reset form on success
      setName('');
      setAge('');
      setPhone('');
      setEmail('');
      setLocation('');
      setAadhaarNumber('');
      setDisclaimerAccepted(false);
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      setSubmitError('Failed to submit your application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-16 px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Volunteer Registration</h1>
          <p className="text-lg text-gray-600">
            Join our community of change makers and help us make a difference in the lives of those in need.
          </p>
        </motion.div>

        {submitSuccess ? (
          <motion.div
            className="bg-green-50 border border-green-200 rounded-lg p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted!</h2>
            <p className="text-green-700 mb-6">Thank you for your interest in volunteering with us. We'll contact you soon!</p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Submit Another Application
            </button>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg shadow-md"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {submitError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                {submitError}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="age" className="block text-gray-700 font-medium mb-2">Age *</label>
              <input
                type="text"
                id="age"
                name="age"
                value={age}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.age ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                placeholder="Enter your age (must be 18+)"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number *</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              <p className="text-gray-500 text-xs mt-1">Format: 10 digits, optionally with +91 prefix</p>
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="location" className="block text-gray-700 font-medium mb-2">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={location}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                placeholder="Enter your city/town"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="aadhaarNumber" className="block text-gray-700 font-medium mb-2">Aadhaar Number *</label>
              <input
                type="text"
                id="aadhaarNumber"
                name="aadhaarNumber"
                value={aadhaarNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.aadhaarNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                placeholder="Enter your 12-digit Aadhaar number"
                maxLength={12}
              />
              {errors.aadhaarNumber && <p className="text-red-500 text-sm mt-1">{errors.aadhaarNumber}</p>}
            </div>

            <div className="mb-8">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="disclaimerAccepted"
                    name="disclaimerAccepted"
                    type="checkbox"
                    checked={disclaimerAccepted}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="disclaimerAccepted" className="font-medium text-gray-700">I agree to the volunteer terms and conditions *</label>
                  <p className="text-gray-500">I understand that my personal information will be stored securely and used only for volunteer coordination purposes.</p>
                  {errors.disclaimerAccepted && <p className="text-red-500 text-sm mt-1">{errors.disclaimerAccepted}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </motion.button>
            </div>
          </motion.form>
        )}
      </div>
    </motion.div>
  );
};

export default VolunteerForm;
