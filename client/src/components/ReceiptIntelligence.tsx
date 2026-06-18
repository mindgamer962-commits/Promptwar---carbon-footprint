import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import type { TwinData } from '../types';

interface ReceiptIntelligenceProps {
  token: string;
  twinData: TwinData;
  onLogged: () => void;
}

interface ScannedResult {
  category: string;
  amount: number;
  desc: string;
  co2_impact: number;
  points: number;
}

export default function ReceiptIntelligence({ token, onLogged }: ReceiptIntelligenceProps) {
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<ScannedResult | null>(null);
  const [error, setError] = useState('');

  // Sample templates to test instantly
  const templates = [
    { name: 'Fuel Receipt ($45)', category: 'fuel', amount: 45, desc: 'Chevron Fuel Station - Regular Octane' },
    { name: 'Grocery Bill ($112)', category: 'grocery', amount: 112, desc: 'Whole Foods Market - Organic Items' },
    { name: 'Utility Power Bill ($165)', category: 'utility', amount: 165, desc: 'Edison Utility - Monthly Power bill' }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const selectTemplate = (tpl: typeof templates[0]) => {
    runOCRScan(tpl.category, tpl.amount, tpl.desc);
  };

  const processFile = (file: File) => {
    setError('');
    setScanning(true);
    setScannedResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultData = e.target?.result as string;
      
      // Bypass canvas image loading if the file is a PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        runOCRScan('', 0, file.name, resultData);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedData = canvas.toDataURL('image/jpeg', 0.7);
          runOCRScan('', 0, file.name, compressedData);
        } else {
          runOCRScan('', 0, file.name, resultData);
        }
      };
      img.onerror = () => {
        setError('Failed to load image for auditing');
        setScanning(false);
      };
      img.src = resultData;
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const runOCRScan = (category: string, amount: number, desc: string, base64Data?: string) => {
    setError('');
    setScanning(true);
    setScannedResult(null);

    // Simulate longer delay for mock template animations, resolve immediately for live API fetch
    const timeoutVal = base64Data ? 100 : 2500;

    setTimeout(async () => {
      try {
        const res = await fetch('/api/receipt/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            receiptData: base64Data ? null : {
              category,
              amount,
              itemDescription: desc
            },
            imageBase64: base64Data || null
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to parse receipt');

        setScannedResult({
          category: data.extracted.category,
          amount: data.extracted.cost,
          desc: data.extracted.description,
          co2_impact: data.co2_impact,
          points: data.points_earned
        });
        
        onLogged(); // Refresh dashboard logs
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errMsg);
      } finally {
        setScanning(false);
      }
    }, timeoutVal);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 select-none">
      {/* File Dropper & Template Section */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Receipt Intelligence</h1>
          <p className="text-gray-400 text-sm mt-1">Upload grocery receipts, utility bills, or fuel stubs to audit their carbon footprint.</p>
        </div>

        {/* Drag & Drop Card */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          tabIndex={0}
          role="region"
          aria-label="Receipt drag and drop upload zone"
          className={`glass-panel rounded-3xl p-10 relative overflow-hidden border border-dashed flex flex-col items-center justify-center min-h-[350px] transition-all ${
            dragActive ? 'border-primary bg-primary/5' : 'border-white/10'
          }`}
        >
          {scanning ? (
            /* Scanning Laser Overlay Animation */
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative w-36 h-36 border border-primary/20 rounded-2xl overflow-hidden flex items-center justify-center">
                <FileText className="text-primary/30 w-16 h-16" />
                {/* Visual laser scanner line */}
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', repeatType: 'reverse' }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_#00E58F]"
                />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold font-display text-white animate-pulse">OCR Document Extraction Active</h3>
                <p className="text-xs text-gray-500 mt-1">Extracting purchases, costs, and carbon index coefficients...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Upload className="text-primary" size={24} />
              </div>
              
              <h3 className="text-lg font-bold font-display text-white mb-2">Drag and drop receipt image</h3>
              <p className="text-xs text-gray-400 mb-6 text-center max-w-sm">Supports Utility Bills, Grocery items, and Fuel stubs (JPG, PNG, PDF up to 5MB).</p>

              <label htmlFor="receipt-file-input" className="cursor-pointer px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-all">
                Browse Files
                <input
                  id="receipt-file-input"
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  aria-label="Upload receipt image or utility bill file"
                  onChange={handleChange}
                />
              </label>
            </>
          )}
        </div>

        {/* Demo Templates selection */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-secondary" size={16} />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Test Templates</h4>
          </div>
          <p className="text-xs text-gray-400 mb-4">Click a mock invoice below to test the OCR scanning and carbon calculation engine instantly.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => selectTemplate(tpl)}
                disabled={scanning}
                aria-label={`Test with template ${tpl.name}`}
                className="cursor-pointer p-4 rounded-xl border border-white/5 bg-black/20 text-xs font-semibold text-gray-300 hover:border-primary/20 hover:text-primary transition-all text-left flex flex-col justify-between h-24"
              >
                <span>{tpl.name}</span>
                <span className="text-[10px] text-gray-500 font-normal truncate mt-2">{tpl.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scanned Results Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between h-[600px] mt-12 lg:mt-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="space-y-6">
          <h3 className="text-base font-bold font-display text-white">Extraction Audit</h3>
          
          <AnimatePresence mode="wait">
            {scannedResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-success/5 border border-success/20 text-success text-xs font-semibold">
                  <CheckCircle2 size={18} />
                  <span>Receipt Logged Successfully</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Vendor / Source</span>
                    <div className="text-sm font-bold text-white mt-0.5">{scannedResult.desc}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estimated Carbon Footprint</span>
                    <div className="text-2xl font-black font-display text-error mt-0.5">
                      +{scannedResult.co2_impact} kg CO₂
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Invoice Cost</span>
                      <div className="text-sm font-bold text-white mt-0.5">${scannedResult.amount}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Points Earned</span>
                      <div className="text-sm font-bold text-primary mt-0.5">+{scannedResult.points} Pts</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sustainability Impact</span>
                  <p className="text-xs text-gray-400 leading-normal">
                    This transaction has been incorporated into your Digital Carbon Twin.
                    {scannedResult.category === 'fuel' && ' Tip: Every liter of gasoline emits 2.3kg of carbon. Switching to carpooling twice weekly offsets this.'}
                    {scannedResult.category === 'grocery' && ' Tip: Choosing organic local produce limits logistics-emissions by up to 30%.'}
                  </p>
                </div>
              </motion.div>
            ) : error ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-error/5 border border-error/20 text-error text-xs font-semibold">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <FileText className="text-gray-600" size={40} />
                <p className="text-xs text-gray-500 max-w-[200px]">Awaiting receipt upload to audit transaction ledger.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-black/20 text-[10px] text-gray-500 leading-normal">
          Receipt Intelligence uses an optical character parser scanning prices, items, and billing descriptors to cross-reference with standard carbon emission coefficient databases.
        </div>
      </div>
    </div>
  );
}
