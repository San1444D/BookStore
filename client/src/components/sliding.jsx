// SlidingRoleTabs.jsx
import React, { useState } from "react";

const roles = ["User", "Admin", "Seller"];

const Sliding = ({ value, onChange }) => {
  // allow parent control; fall back to internal state
  const [internalRole, setInternalRole] = useState(roles[0]);
  const activeRole = value ?? internalRole;

  const handleSelect = (role) => {
    setInternalRole(role);
    onChange?.(role);
  };

  const activeIndex = roles.indexOf(activeRole);

  return (
    <div className="relative w-full bg-primary-home rounded-full px-6! py-3! mt-4! flex justify-between items-center text-sm font-medium text-gray-600">
      {/* sliding pill */}
      <div
        className="absolute top-1 bottom-1 w-[30%] rounded-full bg-primary-btn shadow-[0_10px_25px_rgba(255,138,116,0.6)] transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${activeIndex * 90}%)` }}
      />

      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => handleSelect(role)}
          className={`relative z-10 flex-1 text-center cursor-pointer transition-colors duration-200 ${
            activeRole === role ? "text-white" : "text-gray-600"
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
};

export default Sliding;
