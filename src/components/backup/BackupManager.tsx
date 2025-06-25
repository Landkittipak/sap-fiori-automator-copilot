
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Archive
} from 'lucide-react';
import { backupService } from '@/services/BackupService';

interface BackupJob {
  id: string;
  backup_type: string;
  status: string;
  progress: number;
  file_path: string | null;
  file_size: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export const BackupManager = () => {
  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'full' | 'templates' | 'executions'>('full');
  const { toast } = useToast();

  useEffect(() => {
    loadBackups();
    
    // Set up periodic refresh for backup status
    const interval = setInterval(loadBackups, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadBackups = async () => {
    try {
      const data = await backupService.getUserBackups();
      setBackups(data);
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await backupService.createBackup(selectedType);
      toast({
        title: "Backup Started",
        description: `${selectedType} backup has been initiated`,
      });
      loadBackups();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (jobId: string) => {
    try {
      await backupService.restoreBackup(jobId);
      toast({
        title: "Restore Started",
        description: "Data restore has been initiated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start restore",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">
          <Play className="w-3 h-3 mr-1" />
          Running
        </Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return <Database className="w-4 h-4" />;
      case 'templates':
        return <FileText className="w-4 h-4" />;
      case 'executions':
        return <Play className="w-4 h-4" />;
      default:
        return <Archive className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Backup & Restore</h2>
          <p className="text-gray-600">Manage your data backups and restorations</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Backup type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Backup</SelectItem>
              <SelectItem value="templates">Templates Only</SelectItem>
              <SelectItem value="executions">Executions Only</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleCreateBackup} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Backup'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {backups.map((backup) => (
          <Card key={backup.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                {getTypeIcon(backup.backup_type)}
                <CardTitle className="text-lg capitalize">
                  {backup.backup_type} Backup
                </CardTitle>
                {getStatusBadge(backup.status)}
              </div>
              
              {backup.status === 'completed' && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(backup.id)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Restore
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backup.status === 'running' && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{backup.progress}%</span>
                    </div>
                    <Progress value={backup.progress} className="w-full" />
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Created</p>
                    <p className="text-gray-600">
                      {new Date(backup.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Size</p>
                    <p className="text-gray-600">{formatFileSize(backup.file_size)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Duration</p>
                    <p className="text-gray-600">
                      {backup.completed_at 
                        ? `${Math.round((new Date(backup.completed_at).getTime() - new Date(backup.created_at).getTime()) / 1000)}s`
                        : 'Running...'
                      }
                    </p>
                  </div>
                </div>
                
                {backup.error_message && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700">{backup.error_message}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {backups.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No backups created yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first backup to secure your data
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
