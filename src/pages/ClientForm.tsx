// Client Form Page - Professional Layout

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, X } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { clientService } from "@/services/client.service";
import type { Client, CreateClientRequest } from "@/types/client";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const ClientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const [formData, setFormData] = useState<CreateClientRequest>({
    name: "",
    company: "",
    email: "",
    secondaryEmail: "",
    mobile: "",
    secondaryMobile: "",
    gstNumber: "",
    panNumber: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    notes: "",
    isActive: true,
  });

  const [sameAsAddress, setSameAsAddress] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    if (!id) return;
    
    try {
      setIsFetching(true);
      const response = await clientService.getClientById(id);
      
      if (response.success && response.data) {
        const client = response.data;
        setFormData({
          name: client.name,
          company: client.company,
          email: client.email,
          secondaryEmail: client.secondaryEmail || "",
          mobile: client.mobile,
          secondaryMobile: client.secondaryMobile || "",
          gstNumber: client.gstNumber || "",
          panNumber: client.panNumber || "",
          billingAddressLine1: client.billingAddressLine1,
          billingAddressLine2: client.billingAddressLine2 || "",
          city: client.city,
          state: client.state,
          postalCode: client.postalCode,
          country: client.country,
          shippingAddressLine1: client.shippingAddressLine1 || "",
          shippingAddressLine2: client.shippingAddressLine2 || "",
          shippingCity: client.shippingCity || "",
          shippingState: client.shippingState || "",
          shippingPostalCode: client.shippingPostalCode || "",
          shippingCountry: client.shippingCountry || "",
          contactPersonName: client.contactPersonName || "",
          contactPersonDesignation: client.contactPersonDesignation || "",
          contactPersonEmail: client.contactPersonEmail || "",
          contactPersonPhone: client.contactPersonPhone || "",
          notes: client.notes || "",
          isActive: client.isActive,
        });
        setSameAsAddress(!client.shippingAddressLine1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch client details",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (sameAsAddress) {
      setFormData(prev => ({
        ...prev,
        shippingAddressLine1: prev.billingAddressLine1,
        shippingAddressLine2: prev.billingAddressLine2,
        shippingCity: prev.city,
        shippingState: prev.state,
        shippingPostalCode: prev.postalCode,
        shippingCountry: prev.country,
      }));
    }
  }, [sameAsAddress, formData.billingAddressLine1, formData.city, formData.state, formData.postalCode, formData.country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: CreateClientRequest = {
      ...formData,
      shippingAddressLine1: sameAsAddress ? undefined : formData.shippingAddressLine1,
      shippingAddressLine2: sameAsAddress ? undefined : formData.shippingAddressLine2,
      shippingCity: sameAsAddress ? undefined : formData.shippingCity,
      shippingState: sameAsAddress ? undefined : formData.shippingState,
      shippingPostalCode: sameAsAddress ? undefined : formData.shippingPostalCode,
      shippingCountry: sameAsAddress ? undefined : formData.shippingCountry,
    };

    try {
      setIsLoading(true);
      
      const response = id 
        ? await clientService.updateClient(id, submitData)
        : await clientService.createClient(submitData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: `Client ${id ? 'updated' : 'created'} successfully`,
        });
        navigate('/clients');
      } else {
        throw new Error('Failed to save client');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${id ? 'update' : 'create'} client`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof CreateClientRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isFetching) {
    return (
      <div className="min-h-screen">
        <Header title="Loading..." subtitle="Please wait" />
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={id ? "Edit Client" : "Add New Client"} 
        subtitle={id ? "Update client information" : "Create a new client profile"} 
      />
      
      <div className="container max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/clients')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
                <p className="text-sm text-muted-foreground mt-1">Essential client details and contact information</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter client name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryEmail">Secondary Email</Label>
                  <Input
                    id="secondaryEmail"
                    type="email"
                    value={formData.secondaryEmail}
                    onChange={(e) => updateField("secondaryEmail", e.target.value)}
                    placeholder="secondary@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile <span className="text-destructive">*</span></Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                    placeholder="+91 1234567890"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryMobile">Secondary Mobile</Label>
                  <Input
                    id="secondaryMobile"
                    type="tel"
                    value={formData.secondaryMobile}
                    onChange={(e) => updateField("secondaryMobile", e.target.value)}
                    placeholder="+91 1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={formData.gstNumber}
                    onChange={(e) => updateField("gstNumber", e.target.value.toUpperCase())}
                    maxLength={15}
                    placeholder="27AAEPM1234F1Z5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    value={formData.panNumber}
                    onChange={(e) => updateField("panNumber", e.target.value.toUpperCase())}
                    maxLength={10}
                    placeholder="AAEPM1234F"
                  />
                </div>

                <div className="space-y-2 flex items-center pt-8">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => updateField("isActive", checked)}
                  />
                  <Label htmlFor="isActive" className="ml-2 cursor-pointer">Active Status</Label>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Billing Address Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">Billing Address</h2>
                <p className="text-sm text-muted-foreground mt-1">Primary billing location details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="billingAddressLine1">Address Line 1 <span className="text-destructive">*</span></Label>
                  <Input
                    id="billingAddressLine1"
                    value={formData.billingAddressLine1}
                    onChange={(e) => updateField("billingAddressLine1", e.target.value)}
                    placeholder="Street address, building, apartment"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="billingAddressLine2">Address Line 2</Label>
                  <Input
                    id="billingAddressLine2"
                    value={formData.billingAddressLine2}
                    onChange={(e) => updateField("billingAddressLine2", e.target.value)}
                    placeholder="Area, landmark"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => updateField("state", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code <span className="text-destructive">*</span></Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="India"
                    required
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Shipping Address Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">Shipping Address</h2>
                <p className="text-sm text-muted-foreground mt-1">Delivery location (if different from billing)</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsAddress"
                    checked={sameAsAddress}
                    onCheckedChange={(checked) => setSameAsAddress(checked === true)}
                  />
                  <Label htmlFor="sameAsAddress" className="cursor-pointer">Same as billing address</Label>
                </div>
              </div>

              {!sameAsAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="shippingAddressLine1">Address Line 1</Label>
                    <Input
                      id="shippingAddressLine1"
                      value={formData.shippingAddressLine1}
                      onChange={(e) => updateField("shippingAddressLine1", e.target.value)}
                      placeholder="Street address, building, apartment"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="shippingAddressLine2">Address Line 2</Label>
                    <Input
                      id="shippingAddressLine2"
                      value={formData.shippingAddressLine2}
                      onChange={(e) => updateField("shippingAddressLine2", e.target.value)}
                      placeholder="Area, landmark"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingCity">City</Label>
                    <Input
                      id="shippingCity"
                      value={formData.shippingCity}
                      onChange={(e) => updateField("shippingCity", e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingState">State</Label>
                    <Select
                      value={formData.shippingState}
                      onValueChange={(value) => updateField("shippingState", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingPostalCode">Postal Code</Label>
                    <Input
                      id="shippingPostalCode"
                      value={formData.shippingPostalCode}
                      onChange={(e) => updateField("shippingPostalCode", e.target.value)}
                      maxLength={6}
                      placeholder="123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingCountry">Country</Label>
                    <Input
                      id="shippingCountry"
                      value={formData.shippingCountry}
                      onChange={(e) => updateField("shippingCountry", e.target.value)}
                      placeholder="India"
                    />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Contact Person Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">Contact Person</h2>
                <p className="text-sm text-muted-foreground mt-1">Primary point of contact details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactPersonName">Name</Label>
                  <Input
                    id="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={(e) => updateField("contactPersonName", e.target.value)}
                    placeholder="Contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPersonDesignation">Designation</Label>
                  <Input
                    id="contactPersonDesignation"
                    value={formData.contactPersonDesignation}
                    onChange={(e) => updateField("contactPersonDesignation", e.target.value)}
                    placeholder="Manager, CEO, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPersonEmail">Email</Label>
                  <Input
                    id="contactPersonEmail"
                    type="email"
                    value={formData.contactPersonEmail}
                    onChange={(e) => updateField("contactPersonEmail", e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPersonPhone">Phone</Label>
                  <Input
                    id="contactPersonPhone"
                    type="tel"
                    value={formData.contactPersonPhone}
                    onChange={(e) => updateField("contactPersonPhone", e.target.value)}
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Additional Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">Additional Information</h2>
                <p className="text-sm text-muted-foreground mt-1">Any other relevant notes or details</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={4}
                  placeholder="Add any additional notes about this client..."
                />
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-end gap-4 pt-6"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/clients')}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : id ? "Update Client" : "Create Client"}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
