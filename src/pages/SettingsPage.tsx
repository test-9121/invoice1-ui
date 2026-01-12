import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Globe, 
  Mic, 
  CreditCard, 
  Bell,
  Mail,
  Smartphone,
  Save,
  ChevronRight,
  Percent,
  Calendar,
  Wallet,
  Link2
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const settingsSections = [
  {
    id: "voice",
    title: "Voice & Language",
    icon: Mic,
    description: "Configure voice recognition settings"
  },
  {
    id: "tax",
    title: "Tax & Currency",
    icon: Percent,
    description: "Set default tax rates and currency"
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Link2,
    description: "Connect external services"
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    description: "Manage notification preferences"
  },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("voice");

  return (
    <div className="min-h-screen">
      <Header title="Settings" subtitle="Configure your preferences" />
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card-elevated p-4 space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    activeSection === section.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <section.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-medium">{section.title}</p>
                    <p className={`text-xs ${activeSection === section.id ? "text-accent-foreground/70" : "text-muted-foreground"}`}>
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="card-elevated p-8">
              {/* Voice & Language Settings */}
              {activeSection === "voice" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Mic className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Voice & Language</h2>
                      <p className="text-sm text-muted-foreground">Configure voice recognition settings</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Language</label>
                      <select className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>English (India)</option>
                        <option>English (US)</option>
                        <option>Hindi</option>
                        <option>Tamil</option>
                        <option>Telugu</option>
                        <option>Marathi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Accent</label>
                      <select className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>Indian English</option>
                        <option>British English</option>
                        <option>American English</option>
                        <option>Australian English</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Voice Engine</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {["Google", "Azure", "AWS"].map((engine) => (
                          <button
                            key={engine}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              engine === "Google"
                                ? "border-accent bg-accent/10"
                                : "border-border hover:border-accent/50"
                            }`}
                          >
                            <p className="font-medium text-foreground">{engine}</p>
                            <p className="text-xs text-muted-foreground">Speech-to-Text</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tax & Currency Settings */}
              {activeSection === "tax" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Percent className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Tax & Currency</h2>
                      <p className="text-sm text-muted-foreground">Set default tax rates and currency</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Default Tax Rate (%)</label>
                        <Input type="number" defaultValue="18" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Currency</label>
                        <select className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                          <option>₹ INR (Indian Rupee)</option>
                          <option>$ USD (US Dollar)</option>
                          <option>€ EUR (Euro)</option>
                          <option>£ GBP (British Pound)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Date Format</label>
                      <select className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>DD/MM/YYYY</option>
                        <option>MM/DD/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Invoice Prefix</label>
                      <Input defaultValue="INV-" />
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {activeSection === "integrations" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Link2 className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Integrations</h2>
                      <p className="text-sm text-muted-foreground">Connect external services</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: "QuickBooks", description: "Sync invoices with QuickBooks", connected: false },
                      { name: "Tally", description: "Export to Tally accounting", connected: true },
                      { name: "Gmail", description: "Send invoices via Gmail", connected: true },
                      { name: "WhatsApp", description: "Share invoices on WhatsApp", connected: false },
                    ].map((integration) => (
                      <div
                        key={integration.name}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                      >
                        <div>
                          <p className="font-medium text-foreground">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                        <Switch checked={integration.connected} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeSection === "notifications" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Bell className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
                      <p className="text-sm text-muted-foreground">Manage notification preferences</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { icon: Mail, name: "Email Notifications", description: "Receive updates via email" },
                      { icon: Smartphone, name: "SMS Notifications", description: "Get SMS for important events" },
                      { icon: Bell, name: "Push Notifications", description: "Browser push notifications" },
                    ].map((notification) => (
                      <div
                        key={notification.name}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                      >
                        <div className="flex items-center gap-4">
                          <notification.icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{notification.name}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-border">
                <Button variant="accent" size="lg">
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
