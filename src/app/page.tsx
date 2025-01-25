import SearchForm from "@/components/search-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-[#FF9966] text-7xl md:text-8xl font-bold">mesh.</h1>
        <p className="text-[#FF9966] text-xl md:text-2xl">search. collaborate. create.</p>
        <SearchForm />
      </div>
    </main>
  )
}

