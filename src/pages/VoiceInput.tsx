import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  RefreshCw, 
  CheckCircle2, 
  Trash2,
  Sparkles,
  Volume2
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const VoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [detectedFields, setDetectedFields] = useState({
    client: "",
    items: [] as { name: string; quantity: number; rate: number }[],
    tax: 0,
    total: 0
  });
  const navigate = useNavigate();

  // Simulated voice input demo
  const demoText = "Create invoice for ABC Pvt Ltd for web design services, quantity 1 at rate 25000 rupees with 18% GST";
  
  useEffect(() => {
    if (isRecording) {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= demoText.length) {
          setTranscription(demoText.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
          setIsRecording(false);
          // Parse detected fields
          setDetectedFields({
            client: "ABC Pvt Ltd",
            items: [{ name: "Web Design Services", quantity: 1, rate: 25000 }],
            tax: 18,
            total: 29500
          });
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscription("");
    setDetectedFields({ client: "", items: [], tax: 0, total: 0 });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleClear = () => {
    setTranscription("");
    setDetectedFields({ client: "", items: [], tax: 0, total: 0 });
  };

  return (
    <div className="min-h-screen">
      <Header title="Voice Input Mode" subtitle="Speak to create your invoice" />
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voice Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="card-elevated p-8"
          >
            {/* Mic Button */}
            <div className="flex flex-col items-center mb-8">
              <motion.button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`voice-button ${isRecording ? 'recording' : ''}`}
              >
                {isRecording ? (
                  <MicOff className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
                {isRecording && (
                  <>
                    <span className="absolute inset-0 rounded-full border-4 border-accent-foreground/20 animate-ping" />
                    <span className="absolute -inset-4 rounded-full border-2 border-accent/30 animate-pulse" />
                  </>
                )}
              </motion.button>
              
              <p className="mt-4 text-lg font-medium text-foreground">
                {isRecording ? "Listening..." : "Click to start recording"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRecording ? "Speak clearly into your microphone" : "or press Space to toggle"}
              </p>
            </div>

            {/* Progress Indicator */}
            {isRecording && (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [12, 24, 12],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className="w-1 bg-accent rounded-full"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Transcription Area */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Speech-to-Text Output
              </label>
              <div className="min-h-[120px] p-4 rounded-xl bg-secondary/50 border-2 border-dashed border-border">
                <AnimatePresence mode="wait">
                  {transcription ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-foreground leading-relaxed"
                    >
                      {transcription}
                      {isRecording && <span className="animate-pulse">|</span>}
                    </motion.p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Your spoken words will appear here...
                    </p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Voice Hint */}
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Voice Hint</p>
                  <p className="text-sm text-muted-foreground">
                    "Create invoice for [Client Name] for [Service] at rate [Amount] with [Tax]% GST"
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                variant={isRecording ? "destructive" : "accent"}
                size="lg"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className="flex-1"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={handleClear}>
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Detected Fields Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-elevated p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">AI Detected Fields</h3>
            </div>

            <div className="space-y-4">
              {/* Client */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Client Name
                </label>
                <p className="text-lg font-medium text-foreground mt-1">
                  {detectedFields.client || "—"}
                </p>
              </div>

              {/* Items */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Items / Services
                </label>
                {detectedFields.items.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {detectedFields.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.quantity} × ₹{item.rate.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg font-medium text-foreground mt-1">—</p>
                )}
              </div>

              {/* Tax */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tax Rate
                  </label>
                  <p className="text-lg font-medium text-foreground mt-1">
                    {detectedFields.tax ? `${detectedFields.tax}%` : "—"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <label className="text-xs font-medium text-accent uppercase tracking-wider">
                    Total Amount
                  </label>
                  <p className="text-lg font-bold text-accent mt-1">
                    {detectedFields.total ? `₹${detectedFields.total.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Voice Commands */}
            <div className="mt-6 p-4 rounded-xl border border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Quick Voice Commands</h4>
              <div className="flex flex-wrap gap-2">
                {["Add item", "Change quantity", "Apply discount", "Save draft"].map((cmd) => (
                  <span 
                    key={cmd}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground"
                  >
                    "{cmd}"
                  </span>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="accent"
                size="lg"
                className="flex-1"
                disabled={!detectedFields.client}
                onClick={() => navigate("/invoice-preview")}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Confirm & Generate Invoice
              </Button>
              <Button variant="outline" size="lg">
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
