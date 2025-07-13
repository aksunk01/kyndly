"use client"
// pages/index.js
import { useState, useEffect } from "react"
import Head from "next/head"
import {
  Bar,
  BarChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { CSVLink } from "react-csv"

// Sample data
const sampleData = [
  {
    id: 1,
    geography: "Dallas-Plano-Irving, TX",
    businessType: "Educational Services",
    companySize: "150-200",
    percentile25: 2500,
    median: 3200,
    percentile75: 4100,
    quarter: "Q1 2024",
  },
  {
    id: 2,
    geography: "Dallas-Plano-Irving, TX",
    businessType: "Educational Services",
    companySize: "150-200",
    percentile25: 2600,
    median: 3300,
    percentile75: 4200,
    quarter: "Q2 2024",
  },
  {
    id: 3,
    geography: "Dallas-Plano-Irving, TX",
    businessType: "Educational Services",
    companySize: "150-200",
    percentile25: 2700,
    median: 3400,
    percentile75: 4300,
    quarter: "Q3 2024",
  },
  {
    id: 4,
    geography: "Dallas-Plano-Irving, TX",
    businessType: "Healthcare",
    companySize: "150-200",
    percentile25: 3100,
    median: 3900,
    percentile75: 4800,
    quarter: "Q1 2024",
  },
  {
    id: 5,
    geography: "Dallas-Plano-Irving, TX",
    businessType: "Healthcare",
    companySize: "150-200",
    percentile25: 3200,
    median: 4000,
    percentile75: 4900,
    quarter: "Q2 2024",
  },
  {
    id: 6,
    geography: "Dallas-Plano-Irving, TX",
    businessType: "Healthcare",
    companySize: "150-200",
    percentile25: 3300,
    median: 4100,
    percentile75: 5000,
    quarter: "Q3 2024",
  },
  {
    id: 7,
    geography: "Dallas-Plano-Irving, TX",
    businessType: "Educational Services",
    companySize: "200-250",
    percentile25: 3200,
    median: 4100,
    percentile75: 5200,
    quarter: "Q1 2024",
  },
  {
    id: 8,
    geography: "Dallas-Plano-Irving, TX",
    businessType: "Educational Services",
    companySize: "200-250",
    percentile25: 3300,
    median: 4200,
    percentile75: 5300,
    quarter: "Q2 2024",
  },
  {
    id: 9,
    geography: "Dallas-Plano-Irving, TX",
    businessType: "Educational Services",
    companySize: "200-250",
    percentile25: 3400,
    median: 4300,
    percentile75: 5400,
    quarter: "Q3 2024",
  },
  {
    id: 10,
    geography: "Houston-The Woodlands-Sugar Land, TX",
    businessType: "Educational Services",
    companySize: "150-200",
    percentile25: 2300,
    median: 3000,
    percentile75: 3800,
    quarter: "Q1 2024",
  },
  {
    id: 11,
    geography: "Houston-The Woodlands-Sugar Land, TX",
    businessType: "Educational Services",
    companySize: "150-200",
    percentile25: 2400,
    median: 3100,
    percentile75: 3900,
    quarter: "Q2 2024",
  },
  {
    id: 12,
    geography: "Houston-The Woodlands-Sugar Land, TX",
    businessType: "Educational Services",
    companySize: "150-200",
    percentile25: 2500,
    median: 3200,
    percentile75: 4000,
    quarter: "Q3 2024",
  },
]

// Generate unique values for filters
const getUniqueValues = (data, key) => {
  return [...new Set(data.map((item) => item[key]))]
}

export default function Home() {
  // State for filters
  const [geography, setGeography] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [companySize, setCompanySize] = useState("")
  const [filteredData, setFilteredData] = useState(sampleData)
  const [chartData, setChartData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState({
    geography: false,
    businessType: false,
    companySize: false,
  })
  const [alerts, setAlerts] = useState([])
  const [currentFee, setCurrentFee] = useState("")

  // Toggle dropdown
  const toggle = (dropdown) => {
    // Close all other dropdowns when opening a new one
    const newState = {
      geography: false,
      businessType: false,
      companySize: false,
    }

    newState[dropdown] = !dropdownOpen[dropdown]
    setDropdownOpen(newState)
  }

  // Filter data based on selected filters
  useEffect(() => {
    let filtered = sampleData

    if (geography) {
      filtered = filtered.filter((item) => item.geography === geography)
    }

    if (businessType) {
      filtered = filtered.filter((item) => item.businessType === businessType)
    }

    if (companySize) {
      filtered = filtered.filter((item) => item.companySize === companySize)
    }

    setFilteredData(filtered)

    // Prepare data for bar chart
    if (filtered.length > 0) {
      const latest = filtered.reduce((max, item) => {
        return max.quarter > item.quarter ? max : item
      })

      setChartData([
        { name: "25th Percentile", value: latest.percentile25 },
        { name: "Median", value: latest.median },
        { name: "75th Percentile", value: latest.percentile75 },
      ])

      // Prepare trend data for line chart
      const quarters = [...new Set(filtered.map((item) => item.quarter))].sort()
      const trends = quarters.map((quarter) => {
        const quarterData = filtered.filter((item) => item.quarter === quarter)[0] || {}
        return {
          quarter,
          "25th Percentile": quarterData.percentile25 || 0,
          Median: quarterData.median || 0,
          "75th Percentile": quarterData.percentile75 || 0,
        }
      })

      setTrendData(trends)

      // Check for alerts (if current fee is above 75th percentile)
      const currentFeeNumber = Number.parseFloat(currentFee) || 0
      if (currentFeeNumber > latest.percentile75) {
        setAlerts([
          `Warning: Your current fee of $${currentFeeNumber} is above the 75th percentile ($${latest.percentile75})`,
        ])
      } else {
        setAlerts([])
      }
    }
  }, [geography, businessType, companySize, currentFee])

  // Get unique values for dropdown filters
  const geographies = getUniqueValues(sampleData, "geography")
  const businessTypes = getUniqueValues(sampleData, "businessType")
  const companySizes = getUniqueValues(sampleData, "companySize")

  // Reset all filters
  const resetFilters = () => {
    setGeography("")
    setBusinessType("")
    setCompanySize("")
    setCurrentFee("")
  }

  // Handle option selection
  const handleSelect = (type, value) => {
    if (type === "geography") {
      setGeography(value)
    } else if (type === "businessType") {
      setBusinessType(value)
    } else if (type === "companySize") {
      setCompanySize(value)
    }

    // Close the dropdown
    setDropdownOpen({
      ...dropdownOpen,
      [type]: false,
    })
  }

  // Custom dropdown styles
  const dropdownStyles = {
    menu: {
      maxHeight: "200px",
      overflowY: "auto",
      width: "100%",
      padding: "0",
      margin: "0",
      borderRadius: "4px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      zIndex: 1000,
      position: "absolute",
      backgroundColor: "white",
    },
    item: {
      padding: "8px 12px",
      cursor: "pointer",
      borderBottom: "1px solid #f0f0f0",
      transition: "background-color 0.2s",
    },
    itemHover: {
      backgroundColor: "#f9fafb",
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Fee Benchmark Dashboard</title>
        <meta name="description" content="Interactive fee benchmark dashboard" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" />
      </Head>

      <main>
        <h1 className="text-3xl font-bold mb-8 text-center">Fee Benchmark Dashboard</h1>

        {/* Filters Section */}
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={resetFilters} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Geography Filter */}
            <div>
              <label className="block mb-2 font-semibold">Geography</label>
              <div className="relative">
                <button
                  onClick={() => toggle("geography")}
                  className="w-full text-left bg-white border rounded p-2 flex justify-between items-center"
                >
                  <span>{geography || "Select Geography"}</span>
                  <span className="ml-2">▼</span>
                </button>
                {dropdownOpen.geography && (
                  <div style={dropdownStyles.menu} className="mt-1 border">
                    <table className="w-full">
                      <tbody>
                        {geographies.map((geo) => (
                          <tr
                            key={geo}
                            onClick={() => handleSelect("geography", geo)}
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            <td className="p-2 border-b">{geo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Business Type Filter */}
            <div>
              <label className="block mb-2 font-semibold">Business Type</label>
              <div className="relative">
                <button
                  onClick={() => toggle("businessType")}
                  className="w-full text-left bg-white border rounded p-2 flex justify-between items-center"
                >
                  <span>{businessType || "Select Business Type"}</span>
                  <span className="ml-2">▼</span>
                </button>
                {dropdownOpen.businessType && (
                  <div style={dropdownStyles.menu} className="mt-1 border">
                    <table className="w-full">
                      <tbody>
                        {businessTypes.map((type) => (
                          <tr
                            key={type}
                            onClick={() => handleSelect("businessType", type)}
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            <td className="p-2 border-b">{type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Company Size Filter */}
            <div>
              <label className="block mb-2 font-semibold">Company Size</label>
              <div className="relative">
                <button
                  onClick={() => toggle("companySize")}
                  className="w-full text-left bg-white border rounded p-2 flex justify-between items-center"
                >
                  <span>{companySize || "Select Company Size"}</span>
                  <span className="ml-2">▼</span>
                </button>
                {dropdownOpen.companySize && (
                  <div style={dropdownStyles.menu} className="mt-1 border">
                    <table className="w-full">
                      <tbody>
                        {companySizes.map((size) => (
                          <tr
                            key={size}
                            onClick={() => handleSelect("companySize", size)}
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            <td className="p-2 border-b">{size} employees</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
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

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
            <p className="font-bold">Alert</p>
            {alerts.map((alert, index) => (
              <p key={index}>{alert}</p>
            ))}
          </div>
        )}

        {/* Benchmark Visualization */}
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

          {/* Line Chart for Trends */}
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

        {/* Data Table */}
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
                      No data available with the selected filters. Please adjust your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {currentFee && Number.parseFloat(currentFee) > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Data Insights</h2>
            {filteredData.length > 0 ? (
              <div>
                <p className="mb-2">
                  <strong>Average Median Fee:</strong> $
                  {Math.round(filteredData.reduce((sum, item) => sum + item.median, 0) / filteredData.length)}
                </p>
                <p className="mb-2">
                  <strong>Fee Range:</strong> ${Math.min(...filteredData.map((item) => item.percentile25))} - $
                  {Math.max(...filteredData.map((item) => item.percentile75))}
                </p>
                <p className="mb-2">
                  <strong>Trend Analysis:</strong>{" "}
                  {trendData.length > 1 && trendData[trendData.length - 1].Median > trendData[0].Median
                    ? `Fees have increased by ${Math.round(((trendData[trendData.length - 1].Median - trendData[0].Median) / trendData[0].Median) * 100)}% over the displayed period.`
                    : trendData.length > 1
                      ? `Fees have decreased by ${Math.round(((trendData[0].Median - trendData[trendData.length - 1].Median) / trendData[0].Median) * 100)}% over the displayed period.`
                      : "Insufficient data to determine trend."}
                </p>

                {
                  <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="font-bold mb-2">Your Fee Analysis</h3>
                    <p className="mb-2">
                      Your current fee (${Number.parseFloat(currentFee)}) is{" "}
                      {filteredData.length > 0 && (
                        <>
                          {Number.parseFloat(currentFee) < filteredData[0].percentile25
                            ? "below the 25th percentile"
                            : Number.parseFloat(currentFee) < filteredData[0].median
                              ? "between the 25th percentile and median"
                              : Number.parseFloat(currentFee) < filteredData[0].percentile75
                                ? "between the median and 75th percentile"
                                : "above the 75th percentile"}
                        </>
                      )}{" "}
                      for your selected criteria.
                    </p>
                    {Number.parseFloat(currentFee) > filteredData[0]?.percentile75 && (
                      <p className="text-red-600">You may be overpaying compared to the market rate.</p>
                    )}
                    {Number.parseFloat(currentFee) < filteredData[0]?.percentile25 && (
                      <p className="text-green-600">Your fee is competitive compared to the market rate.</p>
                    )}
                  </div>
                }
              </div>
            ) : (
              <p className="text-gray-500">Select filters to view insights.</p>
            )}
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-gray-500">
        <p>© 2025 Fee Benchmark Dashboard</p>
      </footer>
    </div>
  )
}
