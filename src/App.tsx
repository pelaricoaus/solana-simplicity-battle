
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import Solodex from '@/pages/Solodex'

import '@/App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/solodex" element={<Solodex />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
