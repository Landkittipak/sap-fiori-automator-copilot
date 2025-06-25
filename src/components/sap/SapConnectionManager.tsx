
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Server, TestTube, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { sapConnectionService } from '@/services/SapConnectionService';

interface SapConnection {
  id: string;
  name: string;
  system_id: string;
  host: string;
  client: string;
  is_active: boolean;
  last_tested_at: string | null;
  created_at: string;
}

export const SapConnectionManager = () => {
  const [connections, setConnections] = useState<SapConnection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    systemId: '',
    host: '',
    client: '',
  });

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await sapConnectionService.getUserConnections();
      setConnections(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load SAP connections",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sapConnectionService.createConnection({
        name: formData.name,
        systemId: formData.systemId,
        host: formData.host,
        client: formData.client,
      });

      toast({
        title: "Success",
        description: "SAP connection created successfully",
      });

      setFormData({ name: '', systemId: '', host: '', client: '' });
      setIsDialogOpen(false);
      loadConnections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create SAP connection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const success = await sapConnectionService.testConnection(id);
      toast({
        title: success ? "Success" : "Failed",
        description: success 
          ? "Connection test successful" 
          : "Connection test failed",
        variant: success ? "default" : "destructive",
      });
      loadConnections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive",
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await sapConnectionService.deleteConnection(id);
      toast({
        title: "Success",
        description: "Connection deleted successfully",
      });
      loadConnections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete connection",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SAP Connections</h2>
          <p className="text-gray-600">Manage your SAP system connections</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add SAP Connection</DialogTitle>
              <DialogDescription>
                Configure a new SAP system connection for automation
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Production SAP"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemId">System ID</Label>
                <Input
                  id="systemId"
                  value={formData.systemId}
                  onChange={(e) => setFormData(prev => ({ ...prev, systemId: e.target.value }))}
                  placeholder="PRD"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="sap.company.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                  placeholder="100"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Connection'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">{connection.name}</CardTitle>
                {connection.is_active ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactive
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(connection.id)}
                  disabled={testingId === connection.id}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testingId === connection.id ? 'Testing...' : 'Test'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(connection.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">System ID</p>
                  <p className="text-gray-600">{connection.system_id}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Host</p>
                  <p className="text-gray-600">{connection.host}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Client</p>
                  <p className="text-gray-600">{connection.client}</p>
                </div>
              </div>
              
              {connection.last_tested_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Last tested: {new Date(connection.last_tested_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        
        {connections.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No SAP connections configured</p>
              <p className="text-sm text-gray-500 mt-2">
                Add your first SAP connection to get started with automation
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
