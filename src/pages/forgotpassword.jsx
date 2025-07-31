import { useState } from "react";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // In a real app, this would navigate to /login
    window.location.href = "/login";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded transform rotate-45"></div>
          </div>
        </div>

        <h2 className="text-xl font-normal text-center text-gray-800 mb-2">Forgot Password?</h2>
        <p className="text-sm text-gray-600 text-center mb-8">
          No worries, we'll send you reset instructions.
        </p>

        {!success ? (
          <div className="space-y-6">
            {/* Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            {/* Back to Login */}
            <button
              onClick={handleBackToLogin}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back to login</span>
            </button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 text-green-600 p-4 rounded-lg">
              <p className="font-medium mb-2">Check your email</p>
              <p className="text-sm">
                We've sent a password reset link to your email address.
              </p>
            </div>

            {/* Back to Login Button */}
            <button
              onClick={handleBackToLogin}
              className="w-full py-3 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              Back to Login
            </button>

            {/* Resend Link */}
            <p className="text-sm text-gray-600">
              Didn't receive the email?{' '}
              <button
                onClick={() => {
                  setSuccess(false);
                  setError("");
                }}
                className="text-blue-500 hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-8">
          Anura® is not intended for individuals under 18 years old
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;