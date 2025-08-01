import { useState } from "react";
import { useNavigate } from "react-router-dom";

const steps = ["Vitals", "Medical Info", "Review"];

const HealthForm = ({ email }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [vitals, setVitals] = useState({
    height: "",
    weight: "",
    bloodGroup: "",
    allergies: "",
    medicalConditions: ""
  });

  const handleChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...vitals })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      alert("Registration complete!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Height (cm)</label>
              <input type="number" name="height" value={vitals.height} onChange={handleChange} className="w-full border border-blue-200 px-4 py-2 rounded-lg text-sm outline-blue-500 bg-white/70 shadow-sm" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Weight (kg)</label>
              <input type="number" name="weight" value={vitals.weight} onChange={handleChange} className="w-full border border-blue-200 px-4 py-2 rounded-lg text-sm outline-blue-500 bg-white/70 shadow-sm" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Blood Group</label>
              <select name="bloodGroup" value={vitals.bloodGroup} onChange={handleChange} className="w-full border border-blue-200 px-4 py-2 rounded-lg text-sm outline-blue-500 bg-white/70 shadow-sm">
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid gap-6 animate-fade-in">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Allergies</label>
              <input type="text" name="allergies" value={vitals.allergies} onChange={handleChange} className="w-full border border-blue-200 px-4 py-2 rounded-lg text-sm outline-blue-500 bg-white/70 shadow-sm" placeholder="e.g. Pollen, Dust" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Medical Conditions</label>
              <textarea name="medicalConditions" value={vitals.medicalConditions} onChange={handleChange} className="w-full border border-blue-200 px-4 py-2 rounded-lg text-sm outline-blue-500 bg-white/70 shadow-sm" rows="4" placeholder="e.g. Diabetes, Asthma"></textarea>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Review Your Information</h3>
            <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-md">
              <ul className="text-gray-700 text-sm space-y-3">
                {Object.entries(vitals).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="capitalize font-medium text-blue-700">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="text-right">{value || "N/A"}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4 font-inter">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-lg shadow-xl rounded-3xl p-10">
        <div className="mb-10">
          <div className="flex justify-between mb-4">
            {steps.map((label, index) => (
              <div key={index} className="flex-1 text-center">
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-semibold shadow transition-colors duration-300 ${step >= index ? "bg-blue-600" : "bg-slate-300"}`}>{index + 1}</div>
                <span className={`text-xs ${step === index ? "text-blue-600 font-semibold" : "text-slate-500"}`}>{label}</span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${(step / (steps.length - 1)) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          <div className="flex justify-between pt-6">
            {step > 0 && <button type="button" onClick={prevStep} className="px-6 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 text-sm font-medium transition">Back</button>}
            {step < steps.length - 1 ? (
              <button type="button" onClick={nextStep} className="ml-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg text-sm font-medium shadow transition-all">Next</button>
            ) : (
              <button type="submit" className="ml-auto px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-lg text-sm font-medium shadow transition-all">Submit</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthForm;
