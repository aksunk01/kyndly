"use client"
// pages/index.js
import { useState, useEffect } from "react"
import Head from "next/head"
import {  Bar,  BarChart,  LineChart,  Line,  XAxis,  YAxis,  CartesianGrid,  Tooltip,  Legend,  ResponsiveContainer,} from "recharts"
import { CSVLink } from "react-csv"

import FilterSection from "@/components/Filter/filter.js"
import BenchmarkCharts from "@/components/Chart/chart.js"
import FeeBenchmarkTable from "@/components/Data/data.js"


export default function Home() {
  const [geography, setGeography] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [companySize, setCompanySize] = useState("")
  const [currentFee, setCurrentFee] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState({ geography: false, businessType: false, companySize: false })

  const [geographies, setGeographies] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [companySizes, setCompanySizes] = useState([]);
  const [filteredData, setFilterData] = useState([]);

  const toggle = (type) => {
    setDropdownOpen(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const handleSelect = (type, value) => {
    if (type === "geography") setGeography(value)
    if (type === "businessType") setBusinessType(value)
    if (type === "companySize") setCompanySize(value)
    setDropdownOpen(prev => ({ ...prev, [type]: false }))
  }

  const resetFilters = () => {
    setGeography("")
    setBusinessType("")
    setCompanySize("")
    setCurrentFee("")
  }

  const dropdownStyles = {
    menu: {
      position: "absolute",
      zIndex: 50,
      backgroundColor: "white",
      border: "1px solid #ccc",
      width: "100%",
      maxHeight: "200px",
      overflowY: "auto"
    }
  }

  // Fetch filter options on mount

  useEffect(() =>{
    const fetchFilters = async() =>{
      try{
        const response = await fetch("https://kyndly.onrender.com/api/filters")
        const data = await response.json()

        setGeographies(data.states)
        setBusinessTypes(data.businessTypes)
        setCompanySizes(data.companySizes)
      }catch (error){
        console.error("Error fetching filters:", error)
      }
    }

    fetchFilters()
  }, [])


  //Fetch benchmark data when filters change
  useEffect(()=>{
    const fetchData = async () =>{
      try{
        const params = new URLSearchParams()
        if (geography) params.append("state", geography)
        if (businessType) params.append("businessType", businessType)
        if (companySize) params.append("companySize", companySize)
        
        const response = await fetch(`https://kyndly.onrender.com/api/data?${params.toString()}`)
        const data = await response.json()

        //Map api data to existing frontend shape
        const transformedData = data.map(item => ({
          id: item.id,
          geography: item.state,
          businessType: item.businessType,
          companySize: item.companySize.toString(),
          percentile25: item.percentile25,
          median: item.median,
          percentile75: item.percentile75,
          quarter: item.quarter
        }))

        setFilterData(transformedData)
      }catch (error){
        console.error("Error fetching benchmark data", error)
      }
    }

    fetchData()

  }, [geography, businessType, companySize])

  const chartData = [
    {name: "25th %ile", value: filteredData.length ? filteredData[0].percentile25: 0},
    {name: "Median", value: filteredData.length ? filteredData[0].median: 0},
    {name: "75th %ile", value: filteredData.length ? filteredData[0].percentile75: 0},
    ...(currentFee ? [{name: "Your Fee", value: parseFloat(currentFee)}]: [])
  ]

  const trendData = filteredData.map(item=> ({
    quarter: item.quarter,
    "25th Percentile": item.percentile25,
    "Median": item.median,
    "75th Percentile": item.percentile75
  }))

 

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Fee Benchmark Dashboard</h1>

      <FilterSection
        geography={geography}
        businessType={businessType}
        companySize={companySize}
        currentFee={currentFee}
        geographies={geographies}
        businessTypes={businessTypes}
        companySizes={companySizes}
        dropdownOpen={dropdownOpen}
        toggle={toggle}
        handleSelect={handleSelect}
        setCurrentFee={setCurrentFee}
        resetFilters={resetFilters}
        dropdownStyles={dropdownStyles}
      />

      <BenchmarkCharts chartData={chartData} trendData={trendData} />

      <FeeBenchmarkTable filteredData={filteredData} />
    </main>
  )
}
