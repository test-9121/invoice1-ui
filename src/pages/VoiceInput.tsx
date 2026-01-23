import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  RefreshCw, 
  CheckCircle2, 
  Trash2,
  Sparkles,
  Volume2,
  Send,
  AlertCircle,
  Plus,
  X,
  Loader2,
  Users
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ForeignKeyField, useForeignKeyField } from "@/components/ui/foreign-key-field";
import { useNavigate } from "react-router-dom";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { voiceInvoiceService } from "@/services/voice-invoice.service";
import { ClientService } from "@/services/client.service";
import { productService } from "@/services/product.service";
import { useToast } from "@/hooks/use-toast";
import type { InvoiceFormData, VoiceInvoiceData } from "@/types/invoice";
import type { Client } from "@/types/client";
import type { Product } from "@/types/product";

const VoiceInput = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceData, setVoiceData] = useState<VoiceInvoiceData | null>(null);
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [itemProductMatches, setItemProductMatches] = useState<Product[]>([]);

  const clientService = new ClientService();

  // Initialize react-hook-form
  const { register, control, setValue, watch, handleSubmit, reset } = useForm<InvoiceFormData>({
    defaultValues: {
      clientId: undefined,
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      items: [{ name: "", quantity: 1, unitPrice: 0, amount: 0 }],
      discount: 0,
      taxPercent: 18,
      notes: "",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const response = await clientService.getClients({ 
          status: 'ACTIVE',
          limit: 1000 // Get all active clients
        });
        if (response.success && response.data) {
          setClients(response.data.clients || []);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        toast({
          title: "Error",
          description: "Failed to load clients list",
          variant: "destructive",
        });
      } finally {
        setIsLoadingClients(false);
      }
    };
    
    fetchClients();
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await productService.getProducts({ 
          page: 0,
          size: 200,
          isActive: true
        });
        if (response.success && response.data) {
          setProducts(response.data.content || []);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast({
          title: "Error",
          description: "Failed to load products list",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Speech recognition hook
  const {
    isRecording,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported,
    startRecording,
    stopRecording,
    resetTranscript
  } = useSpeechRecognition({
    language: 'en-IN',
  });

  // Process transcript and call backend API
  const handleProcessTranscript = async () => {
    // Get transcript from manual input if speech failed
    let textToProcess = transcript;
    if (speechError) {
      const input = document.querySelector('[data-transcript-input]') as HTMLTextAreaElement;
      if (input) textToProcess = input.value;
    }
    
    if (!textToProcess.trim()) {
      toast({
        title: "No text provided",
        description: "Please speak or type your invoice details.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await voiceInvoiceService.parseVoiceTranscript(textToProcess);

      console.log('[VoiceInput] API Response:', response);

      if (response.success && response.data) {
        // response.data already contains the invoice data directly
        const invoiceData = response.data;
        
        console.log('[VoiceInput] Invoice Data:', invoiceData);
        console.log('[VoiceInput] Items:', invoiceData.items);
        console.log('[VoiceInput] Client Matches:', invoiceData.clientMatches);
        
        setVoiceData(invoiceData);
        setConfidence({});
        
        // Handle client matching based on clientMatches array
        const matchesCount = invoiceData.clientMatches?.length || 0;
        
        if (matchesCount > 1) {
          // Multiple clients found - show selection dialog
          console.log(`[VoiceInput] Found ${matchesCount} matching clients, showing selector`);
          setShowClientSelector(true);
          toast({
            title: "Multiple Clients Found",
            description: `Found ${matchesCount} matching clients. Please select one.`,
            variant: "default",
          });
        } else if (matchesCount === 1) {
          // Single client match - auto-select
          const matchedClient = invoiceData.clientMatches![0];
          console.log('[VoiceInput] Single client match, auto-selecting:', matchedClient.name);
          setSelectedClient(matchedClient);
        } else {
          // No matches found
          console.log('[VoiceInput] No client matches found for:', invoiceData.clientName);
        }
        
        // Auto-fill form fields from voice data
        autoFillFormFields(invoiceData);

        // Count filled fields
        const filledCount = [
          invoiceData.clientName || matchesCount > 0,
          invoiceData.issuedDate && invoiceData.issuedDate !== 'null' && invoiceData.issuedDate !== null,
          invoiceData.dueDate && invoiceData.dueDate !== 'null' && invoiceData.dueDate !== null,
          invoiceData.items?.length > 0,
          invoiceData.discount !== null && invoiceData.discount !== undefined,
          invoiceData.taxPercent !== null && invoiceData.taxPercent !== undefined,
          invoiceData.notes && invoiceData.notes !== 'null' && invoiceData.notes !== null
        ].filter(Boolean).length;

        toast({
          title: "Success!",
          description: `Invoice data extracted successfully! ${filledCount} field${filledCount !== 1 ? 's' : ''} auto-filled.`,
        });
      } else {
        throw new Error('Failed to parse voice transcript');
      }
    } catch (error: any) {
      console.error('[VoiceInput] Error processing transcript:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process voice input. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-fill form fields from voice data
  const autoFillFormFields = (data: VoiceInvoiceData) => {
    const filledFields = new Set<string>();

    console.log('[autoFillFormFields] Starting auto-fill with data:', data);

    // Fill client - check for matches
    const matchesCount = data.clientMatches?.length || 0;
    
    if (matchesCount === 1) {
      // Single match - auto-select
      const matchedClient = data.clientMatches![0];
      console.log('[autoFillFormFields] Auto-selecting single matched client:', matchedClient.name);
      setValue('clientId', matchedClient.id, { shouldValidate: true, shouldDirty: true });
      setSelectedClient(matchedClient);
      filledFields.add('clientId');
    } else if (matchesCount > 1) {
      // Multiple matches - will be handled by selection dialog
      console.log('[autoFillFormFields] Multiple client matches, user must select');
    } else {
      // No matches
      console.log('[autoFillFormFields] No client matches for:', data.clientName);
    }

    if (data.issuedDate && data.issuedDate !== 'null' && data.issuedDate !== null) {
      setValue('issuedDate', data.issuedDate);
      filledFields.add('issuedDate');
    }

    if (data.dueDate && data.dueDate !== 'null' && data.dueDate !== null) {
      setValue('dueDate', data.dueDate);
      filledFields.add('dueDate');
    }

    if (data.items && data.items.length > 0) {
      // Process items with product matches
      const processedItems = data.items.map((item) => {
        const productMatchesCount = item.productMatches?.length || 0;
        
        if (productMatchesCount === 1) {
          // Single match - auto-select
          const matchedProduct = item.productMatches![0];
          return {
            ...item,
            name: matchedProduct.name,
            unitPrice: item.unitPrice || matchedProduct.salePrice,
            amount: (item.quantity || 1) * (item.unitPrice || matchedProduct.salePrice),
            productId: matchedProduct.id,
            hsnCode: matchedProduct.hsnProductTax.code,
            category: matchedProduct.hsnProductTax.category,
            taxPercentage: matchedProduct.hsnProductTax.taxPercentage,
            productMatches: item.productMatches
          };
        } else if (productMatchesCount > 1) {
          // Multiple matches - keep productMatches for user selection
          return {
            ...item,
            unitPrice: item.unitPrice || 0,
            amount: item.amount || 0,
            productMatches: item.productMatches
          };
        } else {
          // No matches
          return {
            ...item,
            unitPrice: item.unitPrice || 0,
            amount: item.amount || 0
          };
        }
      });
      
      setValue('items', processedItems as any);
      filledFields.add('items');
    }

    if (data.discount !== null && data.discount !== undefined) {
      setValue('discount', data.discount);
      filledFields.add('discount');
    }

    if (data.taxPercent !== null && data.taxPercent !== undefined) {
      setValue('taxPercent', data.taxPercent);
      filledFields.add('taxPercent');
    }

    if (data.notes && data.notes !== 'null' && data.notes !== null) {
      setValue('notes', data.notes);
      filledFields.add('notes');
    }

    // Set calculated amounts from API
    if (data.subtotalAmount !== null && data.subtotalAmount !== undefined) {
      setValue('subtotalAmount', data.subtotalAmount);
    }

    if (data.totalAmount !== null && data.totalAmount !== undefined) {
      setValue('totalAmount', data.totalAmount);
    }

    setAutoFilledFields(filledFields);
  };

  // Toggle recording
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
      // Wait a bit for the final transcript to be captured, then process
      setTimeout(() => {
        const finalTranscript = transcript.trim();
        if (finalTranscript) {
          handleProcessTranscript();
        } else {
          toast({
            title: "No speech detected",
            description: "Please speak and try again, or use manual text input.",
            variant: "destructive",
          });
        }
      }, 500); // 500ms delay to ensure transcript is finalized
    } else {
      startRecording();
    }
  };

  // Handle clear all
  const handleClear = () => {
    resetTranscript();
    setVoiceData(null);
    setConfidence({});
    setAutoFilledFields(new Set());
    setSelectedClient(null);
    setShowClientSelector(false);
    reset();
  };

  // Handle client selection from multiple matches dialog
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setValue('clientId', client.id, { shouldValidate: true, shouldDirty: true });
    setAutoFilledFields(prev => new Set(prev).add('clientId'));
    setShowClientSelector(false);
    toast({
      title: "Client Selected",
      description: `${client.name} has been selected for this invoice.`,
    });
  };

  // Handle product selection for line items
  const handleProductSelect = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setValue(`items.${index}.name`, product.name);
      setValue(`items.${index}.unitPrice`, product.salePrice);
      setValue(`items.${index}.productId` as any, product.id);
      setValue(`items.${index}.hsnCode` as any, product.hsnProductTax.code);
      setValue(`items.${index}.category` as any, product.hsnProductTax.category);
      setValue(`items.${index}.taxPercentage` as any, product.hsnProductTax.taxPercentage);
      // Clear product matches after selection
      setValue(`items.${index}.productMatches` as any, null);
    }
  };

  // Handle opening product matches dialog
  const handleShowProductMatches = (index: number) => {
    const item = watch(`items.${index}` as any);
    if (item?.productMatches && item.productMatches.length > 0) {
      setSelectedItemIndex(index);
      setItemProductMatches(item.productMatches);
      setShowProductSelector(true);
    }
  };

  // Handle product selection from matches dialog
  const handleProductMatchSelect = (product: Product) => {
    if (selectedItemIndex !== null) {
      setValue(`items.${selectedItemIndex}.name`, product.name);
      setValue(`items.${selectedItemIndex}.unitPrice`, product.salePrice);
      setValue(`items.${selectedItemIndex}.productId` as any, product.id);
      setValue(`items.${selectedItemIndex}.hsnCode` as any, product.hsnProductTax.code);
      setValue(`items.${selectedItemIndex}.category` as any, product.hsnProductTax.category);
      setValue(`items.${selectedItemIndex}.taxPercentage` as any, product.hsnProductTax.taxPercentage);
      // Clear product matches after selection
      setValue(`items.${selectedItemIndex}.productMatches` as any, null);
      
      // Update amount
      const quantity = watch(`items.${selectedItemIndex}.quantity` as any);
      setValue(`items.${selectedItemIndex}.amount` as any, quantity * product.salePrice);
      
      setShowProductSelector(false);
      setSelectedItemIndex(null);
      setItemProductMatches([]);
      
      toast({
        title: "Product Selected",
        description: `${product.name} has been selected for this line item.`,
      });
    }
  };

  // Handle client selection from dropdown
  const handleClientChange = (clientId: string) => {
    console.log('[handleClientChange] Selected clientId:', clientId, 'Type:', typeof clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      console.log('[handleClientChange] Found client:', client);
      setSelectedClient(client);
      setValue('clientId', clientId, { shouldValidate: true, shouldDirty: true });
      console.log('[handleClientChange] After setValue, watch clientId:', watch('clientId'));
    }
  };

  // Handle form submit
  const onSubmit = (data: InvoiceFormData) => {
    console.log('[VoiceInput] Submitting invoice data:', data);
    // Navigate to invoice preview with data
    navigate("/invoice-preview", { state: { invoiceData: data } });
  };

  // Calculate confidence badge color
  const getConfidenceBadgeColor = (field: string): string => {
    const conf = confidence[field] || 0;
    if (conf >= 0.8) return "bg-green-500/20 text-green-700 border-green-500/30";
    if (conf >= 0.5) return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
    return "bg-red-500/20 text-red-700 border-red-500/30";
  };

  // Calculate totals
  const items = watch('items');
  const discount = watch('discount');

  // Calculate subtotal with GST included in each item
  const subtotal = items.reduce((sum, item) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const taxPercentage = item.taxPercentage;
    const gstRate = taxPercentage ? parseFloat(taxPercentage.replace('%', '')) : 0;
    const itemAmount = quantity * unitPrice * (1 + gstRate / 100);
    return sum + itemAmount;
  }, 0);
  
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

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
            className="card-elevated py-6 px-4 sm:px-6 md:px-8 max-h-[90vh] min-h-[200px] h-auto overflow-auto flex flex-col justify-start"
          >
            {/* Mic Button */}
            <div className="flex flex-col items-center mb-8">
              <motion.button
                onClick={handleToggleRecording}
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
                Speech-to-Text Output {speechError && "(or type manually)"}
              </label>
              {speechError ? (
                <Textarea
                  placeholder="Type your invoice details here... Example: Create invoice for ABC Company for Web Development services quantity 5 at rate 1000 with 18% GST"
                  value={transcript}
                  onChange={(e) => {
                    // Manual input when speech fails - need to use a ref or state
                    const input = document.querySelector('[data-transcript-input]') as HTMLTextAreaElement;
                    if (input) input.value = e.target.value;
                  }}
                  data-transcript-input
                  className="min-h-[120px] p-4 rounded-xl bg-secondary/50 border-2 border-dashed border-border"
                  rows={5}
                />
              ) : (
                <div className="min-h-[120px] p-4 rounded-xl bg-secondary/50 border-2 border-dashed border-border">
                  <AnimatePresence mode="wait">
                    {transcript || interimTranscript ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-foreground leading-relaxed"
                      >
                        {transcript}
                        {interimTranscript && <span className="text-muted-foreground italic"> {interimTranscript}</span>}
                        {isRecording && <span className="animate-pulse">|</span>}
                      </motion.p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        Your spoken words will appear here...
                      </p>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Error Display */}
            {speechError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">{speechError}</p>
                  {speechError.includes('Network') && (
                    <div className="mt-2 text-sm">
                      <p className="mb-1">The Web Speech API requires internet connection to Google's servers.</p>
                      <p className="mb-1">Possible solutions:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li>Check your internet connection</li>
                        <li>Disable VPN or proxy if using one</li>
                        <li>Try a different network (mobile hotspot)</li>
                        <li>Check if your firewall blocks Google APIs</li>
                        <li>Or type the transcript manually above and click "Process Text" below</li>
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Manual Process Button - shows when speech fails */}
            {speechError && (
              <Button
                onClick={handleProcessTranscript}
                disabled={isProcessing}
                className="w-full mb-6"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Process Text
                  </>
                )}
              </Button>
            )}

            {/* Voice Hint */}
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Voice Hint</p>
                  <p className="text-sm text-muted-foreground">
                    "Create an invoice for client [Client Name]. Add [Product Name] with quantity [X], and [Product Name] with quantity [Y]. Set the invoice date to [Invoice Date] and the due date to [Due Date].Apply a [Discount]% discount."
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                variant={isRecording ? "destructive" : "accent"}
                size="lg"
                onClick={handleToggleRecording}
                disabled={!isSupported || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop & Process
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleClear}
                disabled={isProcessing}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Invoice Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-elevated p-8 relative"
          >
            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
                  <p className="text-lg font-semibold text-foreground">Processing Invoice...</p>
                  <p className="text-sm text-muted-foreground mt-2">AI is extracting data from your input</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Invoice Details</h3>
              {autoFilledFields.size > 0 && (
                <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-300">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Filled
                </Badge>
              )}
            </div>

            <form className="space-y-6">
              {/* Client Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="clientId" className="text-sm font-medium">
                    Client <span className="text-destructive">*</span>
                  </Label>
                  {selectedClient && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      <Users className="w-3 h-3 mr-1" />
                      Matched Client
                    </Badge>
                  )}
                  {voiceData?.clientMatches && voiceData.clientMatches.length > 1 && !selectedClient && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowClientSelector(true)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Select Client ({voiceData.clientMatches.length})
                    </Button>
                  )}
                </div>
                <Controller
                  name="clientId"
                  control={control}
                  rules={{ required: "Client is required" }}
                  render={({ field }) => (
                    <ForeignKeyField
                      value={selectedClient?.id || field.value || null}
                      onChange={(value) => {
                        field.onChange(value);
                        handleClientChange(value as string);
                      }}
                      options={clients.map(client => ({
                        id: client.id,
                        label: client.name,
                        description: client.company || client.email || client.mobile,
                        ...client
                      }))}
                      placeholder={isLoadingClients ? "Loading clients..." : "Select a client"}
                      searchPlaceholder="Search clients..."
                      loading={isLoadingClients}
                      disabled={isProcessing || isLoadingClients}
                      className={autoFilledFields.has('clientId') ? 'bg-green-50 border-green-300' : ''}
                      renderOption={(option) => (
                        <div className="flex items-center gap-2 w-full overflow-hidden">
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="font-medium truncate">{option.label}</span>
                            {option.description && (
                              <span className="text-xs text-muted-foreground truncate">{option.description}</span>
                            )}
                          </div>
                          {selectedClient?.id === option.id && (
                            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                          )}
                        </div>
                      )}
                      renderSelected={(option) => (
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium truncate">{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-muted-foreground truncate">{option.description}</span>
                          )}
                        </div>
                      )}
                    />
                  )}
                />
                {selectedClient && (
                  <p className="text-xs text-muted-foreground">
                    {selectedClient.email && `Email: ${selectedClient.email}`}
                    {selectedClient.mobile && ` | Mobile: ${selectedClient.mobile}`}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issuedDate" className="text-sm font-medium">
                    Issued Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="issuedDate"
                    type="date"
                    {...register('issuedDate')}
                    disabled={isProcessing}
                    className={autoFilledFields.has('issuedDate') ? 'bg-green-50 border-green-300' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register('dueDate')}
                    disabled={isProcessing}
                    className={autoFilledFields.has('dueDate') ? 'bg-green-50 border-green-300' : ''}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Items / Services <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => append({ name: "", quantity: 1, unitPrice: 0, amount: 0 })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const item = watch(`items.${index}` as any);
                    const productMatchesCount = item?.productMatches?.length || 0;
                    const hasMultipleMatches = productMatchesCount > 1;
                    const hasSingleMatch = productMatchesCount === 1;
                    
                    return (
                      <Card key={field.id} className="p-4 bg-secondary/30">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Product / Service</Label>
                                {hasMultipleMatches && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleShowProductMatches(index)}
                                    className="h-7 px-2 text-xs bg-orange-50 hover:bg-orange-100 border-orange-300 text-orange-700"
                                  >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {productMatchesCount} Matches Found
                                  </Button>
                                )}
                                {hasSingleMatch && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Auto-matched
                                  </Badge>
                                )}
                              </div>
                              <Controller
                                name={`items.${index}.productId` as any}
                                control={control}
                                render={({ field }) => (
                                  <ForeignKeyField
                                    value={field.value || null}
                                    onChange={(value) => {
                                      field.onChange(value);
                                      if (value) {
                                        handleProductSelect(value as string, index);
                                      }
                                    }}
                                    options={products.map(product => ({
                                      id: product.id,
                                      label: product.name,
                                      description: `HSN: ${product.hsnProductTax.code}`,
                                      ...product
                                    }))}
                                    placeholder="Select product or service"
                                    searchPlaceholder="Search products..."
                                    loading={isLoadingProducts}
                                    disabled={isProcessing || isLoadingProducts}
                                    className={autoFilledFields.has('items') ? 'bg-green-50 border-green-300' : ''}
                                    renderOption={(option) => (
                                      <div className="flex items-center justify-between w-full gap-2">
                                        <span className="flex-1">{option.label}</span>
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                          {option.hsnProductTax?.code}
                                        </Badge>
                                      </div>
                                    )}
                                    renderSelected={(option) => (
                                      <div className="flex items-center gap-2">
                                        <span>{option.label}</span>
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                          {option.hsnProductTax?.code}
                                        </Badge>
                                      </div>
                                    )}
                                  />
                                )}
                              />
                              {/* Hidden input to store the product name for form submission */}
                              <input
                                type="hidden"
                                {...register(`items.${index}.name` as const)}
                              />
                            </div>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isProcessing}
                                onClick={() => remove(index)}
                                className="mt-6 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="space-y-2">
                            <Label className="text-xs">HSN/SAC Code</Label>
                            <Input
                              type="text"
                              {...register(`items.${index}.hsnCode` as const)}
                              placeholder="HSN/SAC Code"
                              disabled={isProcessing}
                              readOnly
                              className={watch(`items.${index}.hsnCode`) ? 'bg-blue-50 border-blue-300' : 'bg-muted'}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Category</Label>
                            <Input
                              type="text"
                              {...register(`items.${index}.category` as const)}
                              placeholder="Category"
                              disabled={isProcessing}
                              readOnly
                              className={watch(`items.${index}.category`) ? 'bg-blue-50 border-blue-300' : 'bg-muted'}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Tax %</Label>
                            <Input
                              type="text"
                              {...register(`items.${index}.taxPercentage` as const)}
                              placeholder="Tax %"
                              disabled={isProcessing}
                              readOnly
                              className={watch(`items.${index}.taxPercentage`) ? 'bg-blue-50 border-blue-300' : 'bg-muted'}
                            />
                          </div>
                        </div>  

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                              placeholder="1"
                              min="1"
                              disabled={isProcessing}
                              className={autoFilledFields.has('items') ? 'bg-green-50 border-green-300' : ''}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Unit Price (₹)</Label>
                            <Input
                              type="number"
                              {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              disabled={isProcessing}
                              className={autoFilledFields.has('items') ? 'bg-green-50 border-green-300' : ''}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Amount (₹)</Label>
                            <Input
                              type="number"
                              value={(() => {
                                const quantity = watch(`items.${index}.quantity`) || 0;
                                const unitPrice = watch(`items.${index}.unitPrice`) || 0;
                                const taxPercentage = watch(`items.${index}.taxPercentage`);
                                const gstRate = taxPercentage ? parseFloat(taxPercentage.replace('%', '')) : 0;
                                return (quantity * unitPrice * (1 + gstRate / 100)).toFixed(2);
                              })()}
                              readOnly
                              className="bg-muted"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                  })}
                </div>
              </div>

              {/* Financial Details */}
              <div className="space-y-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
                <h4 className="font-semibold text-foreground">Financial Summary</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount" className="text-sm font-medium">
                      Discount (%)
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      {...register('discount', { valueAsNumber: true })}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={isProcessing}
                      className={autoFilledFields.has('discount') ? 'bg-green-50 border-green-300' : ''}
                    />
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal (incl. GST):</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount ({discount}%):</span>
                    <span className="font-medium text-red-600">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-accent">Total Amount:</span>
                    <span className="text-accent">₹{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    * GST is included in each line item amount
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes / Additional Information
                </Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Add any additional notes or terms..."
                  rows={3}
                  disabled={isProcessing}
                  className={autoFilledFields.has('notes') ? 'bg-green-50 border-green-300' : ''}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="accent"
                  size="lg"
                  className="flex-1"
                  disabled={!watch('clientId') || fields.length === 0}
                  onClick={() => {
                    const formData = watch();
                    
                    console.log('[Submit] Raw formData:', formData);
                    console.log('[Submit] formData.clientId:', formData.clientId, 'Type:', typeof formData.clientId);
                    console.log('[Submit] selectedClient:', selectedClient);
                    console.log('[Submit] selectedClient.id:', selectedClient?.id, 'Type:', typeof selectedClient?.id);
                    
                    // Calculate amount for each item with GST included
                    const itemsWithAmount = formData.items.map(item => {
                      const quantity = item.quantity || 0;
                      const unitPrice = item.unitPrice || 0;
                      const taxPercentage = item.taxPercentage;
                      const gstRate = taxPercentage ? parseFloat(taxPercentage.replace('%', '')) : 0;
                      
                      const baseAmount = quantity * unitPrice;
                      const taxAmount = baseAmount * (gstRate / 100);
                      const itemAmount = baseAmount + taxAmount;
                      
                      return {
                        ...item,
                        taxPercent: gstRate,
                        taxAmount: taxAmount,
                        amount: itemAmount
                      };
                    });
                    
                    // Calculate financial totals (GST already included in item amounts)
                    const calculatedSubtotal = itemsWithAmount.reduce((sum, item) => sum + (item.amount || 0), 0);
                    const calculatedDiscountAmount = (calculatedSubtotal * (formData.discount || 0)) / 100;
                    const calculatedTotal = calculatedSubtotal - calculatedDiscountAmount;
                    
                    // Prepare final invoice data with calculated amounts (remove overall taxPercent)
                    const invoiceDataToSubmit: InvoiceFormData = {
                      ...formData,
                      items: itemsWithAmount,
                      clientId: selectedClient ? selectedClient.id : formData.clientId,
                      subtotalAmount: calculatedSubtotal,
                      totalAmount: calculatedTotal,
                      taxPercent: undefined, // Remove overall tax percent from payload
                    };
                    
                    console.log('Invoice Data to Submit:', invoiceDataToSubmit);
                    console.log('Invoice clientId:', invoiceDataToSubmit.clientId, 'Type:', typeof invoiceDataToSubmit.clientId);
                    console.log('Subtotal Amount:', invoiceDataToSubmit.subtotalAmount);
                    console.log('Total Amount:', invoiceDataToSubmit.totalAmount);
                    console.log('Items with tax:', invoiceDataToSubmit.items.map(item => ({
                      name: item.name,
                      taxPercent: item.taxPercent,
                      taxAmount: item.taxAmount,
                      amount: item.amount
                    })));
                    console.log('Overall taxPercent removed:', invoiceDataToSubmit.taxPercent);
                    
                    // Navigate to invoice preview with form data
                    navigate("/invoice-preview", { 
                      state: { 
                        invoiceData: invoiceDataToSubmit,
                        selectedClient: selectedClient 
                      } 
                    });
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Generate Invoice
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  size="lg" 
                  onClick={handleClear}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Client Selector Dialog */}
      <Dialog open={showClientSelector} onOpenChange={setShowClientSelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Client
            </DialogTitle>
            <DialogDescription>
              Multiple clients match "{voiceData?.clientName}". Please select the correct one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {voiceData?.clientMatches?.map((client) => (
              <Card
                key={client.id}
                className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => handleClientSelect(client)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground">{client.name}</h4>
                    {client.company && (
                      <p className="text-sm text-muted-foreground">{client.company}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {client.email && (
                        <Badge variant="outline" className="text-xs">
                          {client.email}
                        </Badge>
                      )}
                      {client.mobile && (
                        <Badge variant="outline" className="text-xs">
                          {client.mobile}
                        </Badge>
                      )}
                      {client.gstNumber && (
                        <Badge variant="outline" className="text-xs">
                          GST: {client.gstNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant={client.isActive ? "default" : "secondary"}>
                    {client.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowClientSelector(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Matches Selection Dialog */}
      <Dialog open={showProductSelector} onOpenChange={setShowProductSelector}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Multiple Products Found
            </DialogTitle>
            <DialogDescription>
              We found {itemProductMatches.length} matching products for "{watch(`items.${selectedItemIndex}` as any)?.name}". 
              Please select the correct one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {itemProductMatches.map((product) => (
              <Card
                key={product.id}
                className="p-4 hover:bg-accent/50 cursor-pointer transition-colors border-2 hover:border-accent"
                onClick={() => handleProductMatchSelect(product)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{product.name}</h4>
                      <Badge 
                        variant="outline" 
                        className="bg-blue-50 text-blue-700 border-blue-300"
                      >
                        {product.hsnProductTax.type}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">HSN/SAC Code:</span>
                        <span className="ml-2 font-medium">{product.hsnProductTax.code}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="ml-2 font-medium">{product.hsnProductTax.category}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tax:</span>
                        <span className="ml-2 font-medium">{product.hsnProductTax.taxPercentage}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sale Price:</span>
                        <span className="ml-2 font-medium text-green-600">₹{product.salePrice.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground pt-1">
                      {product.hsnProductTax.description}
                    </div>
                  </div>
                  
                  <Badge variant={product.isActive ? "default" : "secondary"} className="ml-3">
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowProductSelector(false);
                setSelectedItemIndex(null);
                setItemProductMatches([]);
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceInput;
