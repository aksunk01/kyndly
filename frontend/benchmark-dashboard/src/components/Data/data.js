"use client"
import React from "react"
import { CSVLink } from "react-csv"

export default function FeeBenchmarkTable({ filteredData }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Fee Benchmark Data</h2>
        <CSVLink
          data={filteredData}
          filename="fee_benchmarks.csv"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export to CSV
        </CSVLink>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Geography</th>
              <th className="py-2 px-4 border-b text-left">Business Type</th>
              <th className="py-2 px-4 border-b text-left">Company Size</th>
              <th className="py-2 px-4 border-b text-left">Quarter</th>
              <th className="py-2 px-4 border-b text-right">25th Percentile</th>
              <th className="py-2 px-4 border-b text-right">Median</th>
              <th className="py-2 px-4 border-b text-right">75th Percentile</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{item.geography}</td>
                <td className="py-2 px-4 border-b">{item.businessType}</td>
                <td className="py-2 px-4 border-b">{item.companySize} employees</td>
                <td className="py-2 px-4 border-b">{item.quarter}</td>
                <td className="py-2 px-4 border-b text-right">${item.percentile25}</td>
                <td className="py-2 px-4 border-b text-right">${item.median}</td>
                <td className="py-2 px-4 border-b text-right">${item.percentile75}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  No data available with the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
