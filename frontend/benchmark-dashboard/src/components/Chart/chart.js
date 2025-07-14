"use client"
import React from "react"
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts"

export default function BenchmarkCharts({ chartData, trendData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Fee Benchmarks</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: "Fee ($)", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value) => ["$" + value, "Fee"]} />
              <Bar dataKey="value" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Fee Trends Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis label={{ value: "Fee ($)", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value) => ["$" + value, "Fee"]} />
              <Legend />
              <Line type="monotone" dataKey="25th Percentile" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Median" stroke="#82ca9d" />
              <Line type="monotone" dataKey="75th Percentile" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
