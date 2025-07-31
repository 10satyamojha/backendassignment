import { useState } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

const Register = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    maxLength: true,
    uppercase: false,
    lowercase: false,
    digit: false,
    symbol: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({ ...formData, [name]: newValue });

    // Validate password in real-time
    if (name === 'password') {
      setPasswordValidation({
        minLength: value.length >= 10,
        maxLength: value.length <= 64,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        digit: /\d/.test(value),
        symbol: /[@#$%^&*+\-_=;:<>?|~]/.test(value)
      });
    }
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSignUp = async () => {
    const { email, password, confirmPassword, agreeTerms } = formData;
    
    if (!email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (!isPasswordValid) {
      alert("Please meet all password requirements");
      return;
    }
    
    if (!agreeTerms) {
      alert("Please agree to terms and conditions");
      return;
    }

    try {
      // Simulate API call - replace with your actual endpoint
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        setStep(2); // Move to confirmation page
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      // For demo purposes, just move to next step
      setStep(2);
    }
  };

  const handleLogin = () => {
    // Navigate to login page
    alert("Redirecting to login...");
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-normal text-gray-800 mb-2">Thanks!</h2>
          <p className="text-gray-600 mb-8">Now check your email</p>
          
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            We sent an email to {formData.email} to verify your account.
          </p>
          
          <p className="text-gray-500 text-sm mb-8">
            If you don't see it, you may need to check your spam folder.
          </p>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded transform rotate-45"></div>
          </div>
        </div>

        <h2 className="text-xl font-normal text-center text-gray-800 mb-8">Sign Up</h2>

        <div className="space-y-6">
          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-medium">Password must:</p>
            <div className="space-y-1">
              <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.minLength ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                Be at least 10 characters
              </div>
              <div className={`flex items-center ${passwordValidation.maxLength ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.maxLength ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                Be at most 64 characters
              </div>
              <div className={`flex items-center ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.uppercase ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                Contain an uppercase letter
              </div>
              <div className={`flex items-center ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.lowercase ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                Contain a lowercase letter
              </div>
              <div className={`flex items-center ${passwordValidation.digit ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.digit ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                Contain a digit
              </div>
              <div className={`flex items-center ${passwordValidation.symbol ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.symbol ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                Contain a symbol: @#$%^&*+-_=;:&lt;&gt;?|~
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              type="checkbox"
              name="agreeTerms"
              id="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-1 mr-3 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="agreeTerms" className="text-sm text-gray-600">
              I have read and agree with FaceScan's{" "}
              <a href="#" className="text-blue-500 underline">Terms of Use</a> and{" "}
              <a href="#" className="text-blue-500 underline">Privacy Policy</a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSignUp}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isPasswordValid && formData.agreeTerms 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!isPasswordValid || !formData.agreeTerms}
          >
            Sign Up
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-8">
          facescan® is not intended for individuals under 18 years old
        </p>
      </div>
    </div>
  );
};

export default Register;