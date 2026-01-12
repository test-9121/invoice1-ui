// Client Form Dialog Component - Updated for Backend API

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Client, CreateClientRequest } from "@/types/client";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateClientRequest) => Promise<boolean>;
  client?: Client | null;
  isLoading?: boolean;
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const ClientFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  client,
  isLoading = false,
}: ClientFormDialogProps) => {
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
    if (client && open) {
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
    } else if (!client && open) {
      // Reset form for new client
      setFormData({
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
      setSameAsAddress(true);
    }
  }, [client, open]);

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
      // Remove shipping address if same as billing
      shippingAddressLine1: sameAsAddress ? undefined : formData.shippingAddressLine1,
      shippingAddressLine2: sameAsAddress ? undefined : formData.shippingAddressLine2,
      shippingCity: sameAsAddress ? undefined : formData.shippingCity,
      shippingState: sameAsAddress ? undefined : formData.shippingState,
      shippingPostalCode: sameAsAddress ? undefined : formData.shippingPostalCode,
      shippingCountry: sameAsAddress ? undefined : formData.shippingCountry,
    };

    const success = await onSubmit(submitData);
    if (success) {
      onOpenChange(false);
    }
  };

  const updateField = (field: keyof CreateClientRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {client ? "Update client information" : "Fill in the details to create a new client"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="other">Other Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                    placeholder="+911234567890"
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
                    placeholder="+911234567890"
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

                <div className="space-y-2 col-span-2 flex items-center">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => updateField("isActive", checked)}
                  />
                  <Label htmlFor="isActive" className="ml-2">Active</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Billing Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="billingAddressLine1">Address Line 1 *</Label>
                    <Input
                      id="billingAddressLine1"
                      value={formData.billingAddressLine1}
                      onChange={(e) => updateField("billingAddressLine1", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="billingAddressLine2">Address Line 2</Label>
                    <Input
                      id="billingAddressLine2"
                      value={formData.billingAddressLine2}
                      onChange={(e) => updateField("billingAddressLine2", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
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
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsAddress"
                    checked={sameAsAddress}
                    onCheckedChange={(checked) => setSameAsAddress(checked === true)}
                  />
                  <Label htmlFor="sameAsAddress">Shipping address same as billing address</Label>
                </div>

                {!sameAsAddress && (
                  <>
                    <h3 className="font-semibold mt-4">Shipping Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="shippingAddressLine1">Address Line 1</Label>
                        <Input
                          id="shippingAddressLine1"
                          value={formData.shippingAddressLine1}
                          onChange={(e) => updateField("shippingAddressLine1", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="shippingAddressLine2">Address Line 2</Label>
                        <Input
                          id="shippingAddressLine2"
                          value={formData.shippingAddressLine2}
                          onChange={(e) => updateField("shippingAddressLine2", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shippingCity">City</Label>
                        <Input
                          id="shippingCity"
                          value={formData.shippingCity}
                          onChange={(e) => updateField("shippingCity", e.target.value)}
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
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shippingCountry">Country</Label>
                        <Input
                          id="shippingCountry"
                          value={formData.shippingCountry}
                          onChange={(e) => updateField("shippingCountry", e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Contact Person</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonName">Name</Label>
                    <Input
                      id="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={(e) => updateField("contactPersonName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPersonDesignation">Designation</Label>
                    <Input
                      id="contactPersonDesignation"
                      value={formData.contactPersonDesignation}
                      onChange={(e) => updateField("contactPersonDesignation", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPersonEmail">Email</Label>
                    <Input
                      id="contactPersonEmail"
                      type="email"
                      value={formData.contactPersonEmail}
                      onChange={(e) => updateField("contactPersonEmail", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPersonPhone">Phone</Label>
                    <Input
                      id="contactPersonPhone"
                      type="tel"
                      value={formData.contactPersonPhone}
                      onChange={(e) => updateField("contactPersonPhone", e.target.value)}
                    />
                  </div>
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
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : client ? "Update Client" : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
