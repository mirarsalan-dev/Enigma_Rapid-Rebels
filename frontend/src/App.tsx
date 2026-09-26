import React from 'react'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-brand-light font-sans">
      <header className="p-6 border-b border-gray-800 flex justify-between items-center backdrop-blur-sm bg-brand-dark/80 sticky top-0 z-50">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
          SYMBIO
        </h1>
        <nav className="space-x-6 text-sm font-medium">
          <a href="#" className="hover:text-brand-primary transition-colors">Dashboard</a>
          <a href="#" className="hover:text-brand-primary transition-colors">Network Map</a>
          <a href="#" className="hover:text-brand-primary transition-colors">Analytics</a>
        </nav>
      </header>
      
      <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-5xl font-extrabold tracking-tight">
            Discovering Hidden <br className="hidden md:block" />
            <span className="text-brand-primary">Industrial Symbiosis</span>
          </h2>
          <p className="text-lg text-gray-400">
            AI Industrial Resource Intelligence Network. Upload your material streams to discover synergies, reduce waste, and build a circular economy.
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <button className="px-6 py-3 bg-brand-primary hover:bg-blue-600 text-white rounded-full font-semibold transition-transform transform hover:scale-105 shadow-lg shadow-brand-primary/20">
              Get Started
            </button>
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-semibold transition-transform transform hover:scale-105 border border-gray-700">
              Learn More
            </button>
          </div>
        </div>
      </main>

      <footer className="p-6 border-t border-gray-800 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Enigma_TeamName. All rights reserved.
      </footer>
    </div>
  )
}

export default App
