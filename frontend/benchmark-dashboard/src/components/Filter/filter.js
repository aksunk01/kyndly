"use client"
import React from "react"

export default function FilterSection({
  geography,
  businessType,
  companySize,
  currentFee,
  geographies,
  businessTypes,
  companySizes,
  dropdownOpen,
  toggle,
  handleSelect,
  setCurrentFee,
  resetFilters,
  dropdownStyles,
}) {
  return (
    <div className="bg-gray-100 p-6 rounded-lg mb-8">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Filters</h2>
        <button onClick={resetFilters} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Geography Filter */}
        {["geography", "businessType", "companySize"].map((type) => {
          const options = type === "geography" ? geographies : type === "businessType" ? businessTypes : companySizes
          const value = type === "geography" ? geography : type === "businessType" ? businessType : companySize
          const label = type === "companySize" ? "Company Size" : type.charAt(0).toUpperCase() + type.slice(1)

          return (
            <div key={type}>
              <label className="block mb-2 font-semibold">{label}</label>
              <div className="relative">
                <button
                  onClick={() => toggle(type)}
                  className="w-full text-left bg-white border rounded p-2 flex justify-between items-center"
                >
                  <span>
                    {value ||
                      `Select ${label}`}
                  </span>
                  <span className="ml-2">▼</span>
                </button>
                {dropdownOpen[type] && (
                  <div style={dropdownStyles.menu} className="mt-1 border">
                    <table className="w-full">
                      <tbody>
                        {options.map((option) => (
                          <tr
                            key={option}
                            onClick={() => handleSelect(type, option)}
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            <td className="p-2 border-b">
                              {type === "companySize" ? `${option} employees` : option}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Current Fee Input */}
      <div className="mt-4">
        <label className="block mb-2 font-semibold">Your Current Fee ($)</label>
        <input
          type="number"
          value={currentFee}
          onChange={(e) => setCurrentFee(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded"
          placeholder="Enter your current fee"
        />
      </div>
    </div>
  )
}
