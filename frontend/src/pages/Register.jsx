import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Shield, Sparkles, ArrowRight, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Main Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Creative workspace"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
            }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-accent-900/60 to-secondary-900/80"></div>

        {/* Floating Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-28 h-28 bg-gradient-to-r from-primary-500/30 to-accent-500/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 left-16 w-20 h-20 bg-gradient-to-r from-accent-500/40 to-fashion-500/40 rounded-full animate-bounce-gentle"></div>
          <div className="absolute bottom-40 right-1/4 w-24 h-24 bg-gradient-to-r from-secondary-400/30 to-primary-500/30 rounded-full animate-pulse"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <div className="max-w-lg">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                Join Fashion
                <span className="block bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">
                  Fiesta
                </span>
              </h1>
              <p className="text-xl text-gray-200 leading-relaxed">
                Create your account and unlock access to premium fashion collections, personalized style recommendations, and exclusive member benefits.
              </p>
            </div>

            {/* Feature Points */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                <span className="text-gray-200">Personalized Style Dashboard</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
                <span className="text-gray-200">24/7 Fashion Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-fashion-400 rounded-full"></div>
                <span className="text-gray-200">Exclusive Fashion Deals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-md w-full">
          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600">
                Join our community and get started today
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-medium">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-medium">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Account Type - Hidden input, always customer */}
              <input
                type="hidden"
                name="role"
                value="customer"
              />

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-medium">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                      placeholder="Create password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700 text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-1 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <div className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <Link to="#" className="text-blue-600 hover:text-blue-800 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="#" className="text-blue-600 hover:text-blue-800 font-medium">
                    Privacy Policy
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-primary-500/50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Social Register */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-300 group">
                <div className="w-5 h-5 mr-2 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span className="text-gray-700 text-sm font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-300 group">
                <div className="w-5 h-5 mr-2 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <span className="text-gray-700 text-sm font-medium">Facebook</span>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Mobile Image Preview */}
          <div className="lg:hidden mt-8 text-center">
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              alt="Preview"
              className="w-32 h-20 object-cover rounded-lg mx-auto opacity-60"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
