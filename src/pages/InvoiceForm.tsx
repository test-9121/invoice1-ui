// Invoice Form Page with Voice Recording

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Mic,
  MicOff,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
  amount: number;
}

interface InvoiceFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientGST: string;
  items: InvoiceItem[];
  notes: string;
  dueDate: string;
}

const InvoiceForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [formData, setFormData] = useState<InvoiceFormData>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    clientGST: "",
    items: [
      {
        id: "1",
        description: "",
        quantity: 1,
        rate: 0,
        taxRate: 18,
        amount: 0,
      },
    ],
    notes: "",
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  // Calculate totals
  const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = formData.items.reduce(
    (sum, item) => sum + (item.amount * item.taxRate) / 100,
    0
  );
  const grandTotal = subtotal + totalTax;

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscription("");

      toast({
        title: "Recording started",
        description: "Speak clearly to describe the invoice details",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process audio and extract invoice data
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    // Simulated AI processing - Replace with actual API call
    setTimeout(() => {
      // Demo transcription
      const demoTranscription =
        "Create invoice for ABC Technologies at abc@tech.com, phone number 9876543210, address 123 MG Road Bangalore. Add web development services quantity 1 at rate 50000 rupees with 18 percent GST. Also add hosting services quantity 12 months at rate 1000 rupees per month with 18 percent tax.";

      setTranscription(demoTranscription);

      // Auto-fill form based on transcription
      const extractedData: InvoiceFormData = {
        clientName: "ABC Technologies",
        clientEmail: "abc@tech.com",
        clientPhone: "+91 9876543210",
        clientAddress: "123 MG Road, Bangalore",
        clientGST: "",
        items: [
          {
            id: "1",
            description: "Web Development Services",
            quantity: 1,
            rate: 50000,
            taxRate: 18,
            amount: 50000,
          },
          {
            id: "2",
            description: "Hosting Services",
            quantity: 12,
            rate: 1000,
            taxRate: 18,
            amount: 12000,
          },
        ],
        notes: formData.notes,
        dueDate: formData.dueDate,
      };

      setFormData(extractedData);
      setIsProcessing(false);

      toast({
        title: "Invoice data extracted!",
        description: "Form has been auto-filled. Please review and edit if needed.",
      });
    }, 2000);
  };

  // Update field
  const updateField = (field: keyof InvoiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Update item
  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate amount
    if (field === "quantity" || field === "rate") {
      updatedItems[index].amount =
        updatedItems[index].quantity * updatedItems[index].rate;
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // Add item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      description: "",
      quantity: 1,
      rate: 0,
      taxRate: 18,
      amount: 0,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  // Remove item
  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, items: updatedItems }));
    }
  };

  // Submit invoice
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.clientName || !formData.clientEmail) {
      toast({
        title: "Validation Error",
        description: "Please fill in client name and email",
        variant: "destructive",
      });
      return;
    }

    const hasInvalidItems = formData.items.some(
      (item) => !item.description || item.rate <= 0
    );
    if (hasInvalidItems) {
      toast({
        title: "Validation Error",
        description: "Please fill in all item details with valid rates",
        variant: "destructive",
      });
      return;
    }

    // TODO: Save invoice via API
    toast({
      title: "Invoice Created!",
      description: "Your invoice has been created successfully",
    });

    // Navigate to preview or list
    navigate("/invoice-history");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Create Invoice"
        subtitle="Fill in the details or use voice input"
      />

      <div className="container max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/invoice-history")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-foreground">
                      Client Information
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Details of the customer receiving this invoice
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">
                        Client Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) =>
                          updateField("clientName", e.target.value)
                        }
                        placeholder="Enter client name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) =>
                          updateField("clientEmail", e.target.value)
                        }
                        placeholder="client@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Phone</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) =>
                          updateField("clientPhone", e.target.value)
                        }
                        placeholder="+91 1234567890"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientGST">GST Number</Label>
                      <Input
                        id="clientGST"
                        value={formData.clientGST}
                        onChange={(e) =>
                          updateField(
                            "clientGST",
                            e.target.value.toUpperCase()
                          )
                        }
                        maxLength={15}
                        placeholder="27AAEPM1234F1Z5"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="clientAddress">Address</Label>
                      <Textarea
                        id="clientAddress"
                        value={formData.clientAddress}
                        onChange={(e) =>
                          updateField("clientAddress", e.target.value)
                        }
                        placeholder="Client address"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Invoice Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        Invoice Items
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Products or services being billed
                      </p>
                    </div>
                    <Button type="button" onClick={addItem} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {formData.items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 rounded-lg border border-border bg-secondary/20"
                        >
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-12 md:col-span-4 space-y-2">
                              <Label>Description *</Label>
                              <Input
                                value={item.description}
                                onChange={(e) =>
                                  updateItem(index, "description", e.target.value)
                                }
                                placeholder="Service or product"
                                required
                              />
                            </div>

                            <div className="col-span-6 md:col-span-2 space-y-2">
                              <Label>Qty *</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "quantity",
                                    Number(e.target.value)
                                  )
                                }
                                required
                              />
                            </div>

                            <div className="col-span-6 md:col-span-2 space-y-2">
                              <Label>Rate *</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.rate}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "rate",
                                    Number(e.target.value)
                                  )
                                }
                                required
                              />
                            </div>

                            <div className="col-span-6 md:col-span-2 space-y-2">
                              <Label>Tax %</Label>
                              <Select
                                value={String(item.taxRate)}
                                onValueChange={(value) =>
                                  updateItem(index, "taxRate", Number(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0%</SelectItem>
                                  <SelectItem value="5">5%</SelectItem>
                                  <SelectItem value="12">12%</SelectItem>
                                  <SelectItem value="18">18%</SelectItem>
                                  <SelectItem value="28">28%</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="col-span-6 md:col-span-2 space-y-2 flex flex-col">
                              <Label>Amount</Label>
                              <div className="flex items-center justify-between h-10 px-3 py-2 border border-border rounded-md bg-secondary">
                                <span className="text-sm font-medium">
                                  ₹{item.amount.toLocaleString()}
                                </span>
                                {formData.items.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="w-4 h-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Totals */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex justify-between w-full md:w-64">
                        <span className="text-sm text-muted-foreground">
                          Subtotal:
                        </span>
                        <span className="text-sm font-medium">
                          ₹{subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between w-full md:w-64">
                        <span className="text-sm text-muted-foreground">
                          Total Tax:
                        </span>
                        <span className="text-sm font-medium">
                          ₹{totalTax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between w-full md:w-64 pt-2 border-t">
                        <span className="text-lg font-semibold">
                          Grand Total:
                        </span>
                        <span className="text-lg font-bold text-accent">
                          ₹{grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Additional Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-foreground">
                      Additional Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => updateField("dueDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">Notes / Terms</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        placeholder="Payment terms, thank you note, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Submit Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-end gap-4"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/invoice-history")}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </motion.div>
            </form>
          </div>

          {/* Voice Input Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-6"
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Voice Input
                  </h3>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <motion.button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isProcessing}
                    className={`voice-button ${isRecording ? "recording" : ""} ${
                      isProcessing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="w-8 h-8" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                    {isRecording && (
                      <>
                        <span className="absolute inset-0 rounded-full border-4 border-accent-foreground/20 animate-ping" />
                        <span className="absolute -inset-4 rounded-full border-2 border-accent/30 animate-pulse" />
                      </>
                    )}
                  </motion.button>

                  <p className="mt-4 text-sm font-medium text-center">
                    {isProcessing
                      ? "Processing..."
                      : isRecording
                      ? "Listening..."
                      : "Click to record"}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {isRecording
                      ? "Speak invoice details"
                      : "Auto-fill form with voice"}
                  </p>
                </div>

                {/* Recording Animation */}
                {isRecording && (
                  <div className="mb-4">
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

                {/* Transcription */}
                {transcription && (
                  <div className="mb-4 p-3 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Transcription:
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {transcription}
                    </p>
                  </div>
                )}

                {/* Voice Hint */}
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-xs font-medium text-accent mb-2">
                    Voice Command Example:
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    "Create invoice for ABC Company at abc@company.com with phone
                    9876543210. Add web design service quantity 1 at rate 50000
                    with 18% GST."
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    setTranscription("");
                    setFormData({
                      ...formData,
                      clientName: "",
                      clientEmail: "",
                      clientPhone: "",
                      clientAddress: "",
                      clientGST: "",
                      items: [
                        {
                          id: "1",
                          description: "",
                          quantity: 1,
                          rate: 0,
                          taxRate: 18,
                          amount: 0,
                        },
                      ],
                    });
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Form
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
