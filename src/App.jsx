import React from 'react';
import Flipbook from './components/Flipbook';

import bookPdf from '../book.pdf';
import logo from '../Senegal.png';

function App() {
  return (
    <div className="app">
      <Flipbook
        pdfFile={bookPdf}
        logoUrl={logo}
      />
    </div>
  );
}

export default App;