"use client"

import { useState } from "react"
import { searchAPI } from "@/utils/api"
import JsonMesh from "@/components/Jsonmesh"

interface Person {
  _id: string
  name: string
  skills: string[]
  experience: string[]
  tags: string[]
  background: string
  school: string
}

export default function SearchMesh() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Person[]>([])
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
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          name="search"
          placeholder="Search for people..."
          className="w-full px-6 py-4 text-lg text-white bg-white/10 rounded-full 
                   placeholder:text-white/70 focus:outline-none focus:ring-2 
                   focus:ring-[#FF9966]/50 backdrop-blur-sm"
          disabled={isLoading}
        />
      </form>

      {isLoading && <div className="text-center text-white/70">Searching...</div>}

      {error && <div className="text-center text-red-400">{error}</div>}

      {results.length > 0 && (
        <div className="space-y-8">
          <JsonMesh data={results} />
          <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
            <ul className="space-y-4">
              {results.map((person) => (
                <li key={person._id} className="text-white/90">
                  <h3 className="text-lg font-semibold">{person.name}</h3>
                  <p className="text-sm text-white/70">{person.school}</p>
                  <p className="text-sm mt-1">{person.background.slice(0, 150)}...</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

