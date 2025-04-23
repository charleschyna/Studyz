import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [retentionDays, setRetentionDays] = useState('30');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetch system configurations
      const { data: configData, error: configError } = await supabase
        .from('system_configs')
        .select('*')
        .order('category', { ascending: true });

      if (configError) throw configError;

      // Fetch email templates
      const { data: templateData, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (templateError) throw templateError;

      setConfigs(configData || []);
      setEmailTemplates(templateData || []);

      // Set initial values
      const maintenance = configData?.find(c => c.key === 'maintenance_mode')?.value === 'true';
      const backup = configData?.find(c => c.key === 'backup_schedule')?.value || 'daily';
      const retention = configData?.find(c => c.key === 'backup_retention_days')?.value || '30';

      setMaintenanceMode(maintenance);
      setBackupSchedule(backup);
      setRetentionDays(retention);

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch system settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key: string, value: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_configs')
        .update({ value })
        .eq('key', key);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });

      // Log the configuration change
      await supabase.from('activity_logs').insert({
        action: 'update_system_config',
        details: { key, new_value: value },
        performed_by: (await supabase.auth.getUser()).data.user?.id
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateEmailTemplate = async (template: EmailTemplate) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: template.subject,
          body: template.body,
          variables: template.variables
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Email template updated successfully',
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update email template',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBackupNow = async () => {
    setSaving(true);
    try {
      // Trigger backup function
      const { error } = await supabase.functions.invoke('trigger-backup', {
        body: { type: 'manual' }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Backup started successfully',
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start backup',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    const newValue = !maintenanceMode;
    await updateConfig('maintenance_mode', newValue.toString());
    setMaintenanceMode(newValue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Manage system-wide configurations and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="email">Email Templates</TabsTrigger>
              <TabsTrigger value="backup">Backup & Maintenance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {configs
                    .filter(config => config.category === 'general')
                    .map(config => (
                      <div key={config.id} className="space-y-2">
                        <Label>{config.description}</Label>
                        <Input
                          value={config.value}
                          onChange={(e) => {
                            const newConfigs = configs.map(c =>
                              c.id === config.id ? { ...c, value: e.target.value } : c
                            );
                            setConfigs(newConfigs);
                          }}
                          onBlur={() => updateConfig(config.key, config.value)}
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Template</Label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <div className="space-y-4">
                      {emailTemplates
                        .filter(t => t.id === selectedTemplate)
                        .map(template => (
                          <div key={template.id} className="space-y-4">
                            <div className="space-y-2">
                              <Label>Subject</Label>
                              <Input
                                value={template.subject}
                                onChange={(e) => {
                                  const newTemplates = emailTemplates.map(t =>
                                    t.id === template.id
                                      ? { ...t, subject: e.target.value }
                                      : t
                                  );
                                  setEmailTemplates(newTemplates);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Body</Label>
                              <Textarea
                                value={template.body}
                                rows={10}
                                onChange={(e) => {
                                  const newTemplates = emailTemplates.map(t =>
                                    t.id === template.id
                                      ? { ...t, body: e.target.value }
                                      : t
                                  );
                                  setEmailTemplates(newTemplates);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Available Variables</Label>
                              <div className="text-sm text-muted-foreground">
                                {template.variables.join(', ')}
                              </div>
                            </div>

                            <Button
                              onClick={() => updateEmailTemplate(template)}
                              disabled={saving}
                            >
                              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save Template
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Backup Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Backup Schedule</Label>
                    <Select
                      value={backupSchedule}
                      onValueChange={(value) => {
                        setBackupSchedule(value);
                        updateConfig('backup_schedule', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Retention Period (Days)</Label>
                    <Input
                      type="number"
                      value={retentionDays}
                      onChange={(e) => {
                        setRetentionDays(e.target.value);
                        updateConfig('backup_retention_days', e.target.value);
                      }}
                    />
                  </div>

                  <Button onClick={handleBackupNow} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Backup Now
                  </Button>

                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Maintenance Mode</h4>
                        <p className="text-sm text-muted-foreground">
                          Enable maintenance mode to prevent user access during system updates
                        </p>
                      </div>
                      <Switch
                        checked={maintenanceMode}
                        onCheckedChange={toggleMaintenanceMode}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {configs
                    .filter(config => config.category === 'security')
                    .map(config => (
                      <div key={config.id} className="space-y-2">
                        <Label>{config.description}</Label>
                        {config.key.includes('enabled') ? (
                          <Switch
                            checked={config.value === 'true'}
                            onCheckedChange={(checked) => {
                              const newValue = checked.toString();
                              const newConfigs = configs.map(c =>
                                c.id === config.id ? { ...c, value: newValue } : c
                              );
                              setConfigs(newConfigs);
                              updateConfig(config.key, newValue);
                            }}
                          />
                        ) : (
                          <Input
                            value={config.value}
                            onChange={(e) => {
                              const newConfigs = configs.map(c =>
                                c.id === config.id ? { ...c, value: e.target.value } : c
                              );
                              setConfigs(newConfigs);
                            }}
                            onBlur={() => updateConfig(config.key, config.value)}
                            type={config.key.includes('password') ? 'password' : 'text'}
                          />
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
