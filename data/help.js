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

// API URL - change this to match your Flask server
const API_URL = "http://localhost:5000/api"

export default function Home() {
  // State for filters
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [companySize, setCompanySize] = useState("")
  const [filteredData, setFilteredData] = useState([])
  const [chartData, setChartData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState({
    state: false,
    city: false,
    businessType: false,
    companySize: false,
  })
  const [alerts, setAlerts] = useState([])
  const [currentFee, setCurrentFee] = useState("")

  // State for filter options from API
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [businessTypes, setBusinessTypes] = useState([])
  const [companySizes, setCompanySizes] = useState([])
  
  // State for insights
  const [insights, setInsights] = useState({
    averageMedian: 0,
    feeRange: { min: 0, max: 0 },
    trendAnalysis: "Insufficient data to determine trend.",
    feeAnalysis: "No data available for comparison.",
    alerts: []
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(`${API_URL}/filters`)
        if (response.ok) {
          const data = await response.json()
          setStates(data.states)
          setCities(data.cities)
          setBusinessTypes(data.businessTypes)
          setCompanySizes(data.companySizes)
        } else {
          console.error("Failed to fetch filters:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching filters:", error)
      }
    }

    fetchFilters()
  }, [])

  // Fetch cities based on selected state
  useEffect(() => {
    const fetchCities = async () => {
      if (state) {
        try {
          const response = await fetch(`${API_URL}/filters?state=${state}`)
          if (response.ok) {
            const data = await response.json()
            setCities(data.cities)
          } else {
            console.error("Failed to fetch cities:", response.statusText)
          }
        } catch (error) {
          console.error("Error fetching cities:", error)
        }
      }
    }

    fetchCities()
    setCity("") // Reset city when state changes
  }, [state])

  // Toggle dropdown
  const toggle = (dropdown) => {
    // Close all other dropdowns when opening a new one
    const newState = {
      state: false,
      city: false,
      businessType: false,
      companySize: false,
    }

    newState[dropdown] = !dropdownOpen[dropdown]
    setDropdownOpen(newState)
  }

  // Fetch data based on filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Build query params
        const params = new URLSearchParams()
        if (state) params.append("state", state)
        if (city) params.append("city", city)
        if (businessType) params.append("businessType", businessType)
        if (companySize) params.append("companySize", companySize)
        
        const response = await fetch(`${API_URL}/data?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setFilteredData(data)
          setCurrentPage(1) // Reset to first page when filters change
        } else {
          console.error("Failed to fetch data:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [state, city, businessType, companySize])

  // Fetch chart data and insights
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Build query params
        const params = new URLSearchParams()
        if (state) params.append("state", state)
        if (city) params.append("city", city)
        if (businessType) params.append("businessType", businessType)
        if (companySize) params.append("companySize", companySize)
        
        const response = await fetch(`${API_URL}/chart-data?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setChartData(data.barChart)
          setTrendData(data.lineChart)
        } else {
          console.error("Failed to fetch chart data:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
      }
    }

    const fetchInsights = async () => {
      try {
        // Build query params
        const params = new URLSearchParams()
        if (state) params.append("state", state)
        if (city) params.append("city", city)
        if (businessType) params.append("businessType", businessType)
        if (companySize) params.append("companySize", companySize)
        if (currentFee) params.append("currentFee", currentFee)
        
        const response = await fetch(`${API_URL}/insights?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setInsights(data)
          setAlerts(data.alerts)
        } else {
          console.error("Failed to fetch insights:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching insights:", error)
      }
    }

    fetchChartData()
    fetchInsights()
  }, [state, city, businessType, companySize, currentFee])

  // Reset all filters
  const resetFilters = () => {
    setState("")
    setCity("")
    setBusinessType("")
    setCompanySize("")
    setCurrentFee("")
    setCurrentPage(1)
  }

  // Handle option selection
  const handleSelect = (type, value) => {
    if (type === "state") {
      setState(value)
    } else if (type === "city") {
      setCity(value)
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
  
  // Pagination handlers
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow)
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* State Filter */}
            <div>
              <label className="block mb-2 font-semibold">State</label>
              <div className="relative">
                <button
                  onClick={() => toggle("state")}
                  className="w-full text-left bg-white border rounded p-2 flex justify-between items-center"
                >
                  <span>{state || "Select State"}</span>
                  <span className="ml-2">▼</span>
                </button>
                {dropdownOpen.state && (
                  <div style={dropdownStyles.menu} className="mt-1 border">
                    <table className="w-full">
                      <tbody>
                        {states.map((st) => (
                          <tr
                            key={st}
                            onClick={() => handleSelect("state", st)}
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            <td className="p-2 border-b">{st}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* City Filter */}
            <div>
              <label className="block mb-2 font-semibold">City</label>
              <div className="relative">
                <button
                  onClick={() => toggle("city")}
                  className="w-full text-left bg-white border rounded p-2 flex justify-between items-center"
                  disabled={!state}
                >
                  <span>{city || "Select City"}</span>
                  <span className="ml-2">▼</span>
                </button>
                {dropdownOpen.city && (
                  <div style={dropdownStyles.menu} className="mt-1 border">
                    <table className="w-full">
                      <tbody>
                        {cities.map((cty) => (
                          <tr
                            key={cty}
                            onClick={() => handleSelect("city", cty)}
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            <td className="p-2 border-b">{cty}</td>
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
            {/* Table container with fixed height for scrolling */}
            <div className="h-80 overflow-y-auto border rounded">
              <table className="min-w-full bg-white">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">State</th>
                    <th className="py-2 px-4 border-b text-left">City</th>
                    <th className="py-2 px-4 border-b text-left">Business Type</th>
                    <th className="py-2 px-4 border-b text-left">Company Size</th>
                    <th className="py-2 px-4 border-b text-left">Quarter</th>
                    <th className="py-2 px-4 border-b text-right">25th Percentile</th>
                    <th className="py-2 px-4 border-b text-right">Median</th>
                    <th className="py-2 px-4 border-b text-right">75th Percentile</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{item.state}</td>
                      <td className="py-2 px-4 border-b">{item.city}</td>
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
                      <td colSpan="8" className="py-4 text-center text-gray-500">
                        No data available with the selected filters. Please adjust your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {filteredData.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredData.length)} of {filteredData.length} entries
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={prevPage} 
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-gray-100 border rounded">
                    {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-4 py-2 border rounded ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {currentFee && Number.parseFloat(currentFee) > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Data Insights</h2>
            {filteredData.length > 0 ? (
              <div>
                <p className="mb-2">
                  <strong>Average Median Fee:</strong> ${insights.averageMedian}
                </p>
                <p className="mb-2">
                  <strong>Fee Range:</strong> ${insights.feeRange.min} - ${insights.feeRange.max}
                </p>
                <p className="mb-2">
                  <strong>Trend Analysis:</strong> {insights.trendAnalysis}
                </p>

                {currentFee && (
                  <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="font-bold mb-2">Your Fee Analysis</h3>
                    <p className="mb-2">{insights.feeAnalysis}</p>
                  </div>
                )}
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
