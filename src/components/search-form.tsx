"use client"

import { useState } from "react"
import { searchAPI } from "@/utils/api"

export default function SearchForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string>("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const searchQuery = formData.get("search") as string

    try {
      const response = await searchAPI(searchQuery)
      setResults(response)
    } catch (err) {
      setError("Failed to perform search. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          name="search"
          placeholder="search here..."
          className="w-full px-6 py-4 text-lg text-white bg-white/10 rounded-full 
                   placeholder:text-white/70 focus:outline-none focus:ring-2 
                   focus:ring-[#FF9966]/50 backdrop-blur-sm"
          disabled={isLoading}
        />
      </form>

      {isLoading && <div className="text-center text-white/70">Searching...</div>}

      {error && <div className="text-center text-red-400">{error}</div>}

      {results.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
          <ul className="space-y-2">
            {results.map((result, index) => (
              <li key={index} className="text-white/90">
                {result.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

