import React from 'react';
import { Link } from 'react-router-dom';
import { Factory, Recycle, Bot, Globe } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-brand-light font-sans">
      <header className="px-8 py-6 border-b border-gray-800 flex justify-between items-center backdrop-blur-sm bg-brand-dark/80 sticky top-0 z-50">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
          SYMBIO
        </h1>
        <nav className="space-x-6 text-sm font-medium">
          <Link to="/login" className="hover:text-brand-primary transition-colors">Login / Sign Up</Link>
          <Link to="/login" className="px-4 py-2 bg-brand-primary hover:bg-blue-600 rounded-md text-white transition-colors">
            Enter SYMBIO
          </Link>
        </nav>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-8 text-center max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Discovering Hidden <br />
            <span className="text-brand-primary">Industrial Symbiosis</span>
          </h2>
          <p className="text-xl text-gray-400">
            Transform your industrial waste into valuable resources. SYMBIO uses AI to discover hidden synergies between industries, powering the circular economy.
          </p>
          <div className="pt-8">
            <Link to="/login" className="px-8 py-4 bg-brand-primary hover:bg-blue-600 text-white rounded-full font-bold text-lg transition-transform transform hover:scale-105 shadow-lg shadow-brand-primary/20 inline-block">
              Enter SYMBIO
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-8 bg-gray-900 border-y border-gray-800">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="p-6 bg-brand-dark rounded-2xl border border-gray-800 hover:border-brand-primary transition-colors group">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-primary/20 transition-colors">
                <Recycle className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Resource Exchange</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Seamlessly exchange industrial waste and by-products. One facility's waste becomes another's raw material.
              </p>
            </div>

            <div className="p-6 bg-brand-dark rounded-2xl border border-gray-800 hover:border-brand-primary transition-colors group">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-primary/20 transition-colors">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hidden Symbiosis</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Uncover non-obvious geographical and material connections between regional industries to cut transport costs.
              </p>
            </div>

            <div className="p-6 bg-brand-dark rounded-2xl border border-gray-800 hover:border-brand-primary transition-colors group">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-primary/20 transition-colors">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Discovery</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Leverage advanced open-source AI and knowledge graphs to automatically recommend optimal resource matches.
              </p>
            </div>

            <div className="p-6 bg-brand-dark rounded-2xl border border-gray-800 hover:border-brand-primary transition-colors group">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-primary/20 transition-colors">
                <Factory className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Circular Economy</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Transition your operations towards zero-waste goals, lowering emissions and achieving sustainability targets.
              </p>
            </div>

          </div>
        </section>
      </main>

      <footer className="p-8 border-t border-gray-800 text-center text-sm text-gray-500 bg-brand-dark">
        &copy; {new Date().getFullYear()} Enigma_TeamName. Hackathon Project. All rights reserved.
      </footer>
    </div>
  );
};
