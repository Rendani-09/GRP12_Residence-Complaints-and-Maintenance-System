import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { mockComplaints, mockContractors } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BLOCKS, CATEGORIES, ComplaintStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [blockFilter, setBlockFilter] = useState<string>('all');
  const [complaintStates, setComplaintStates] = useState<Record<string, { status: ComplaintStatus; assignedTo: string; assignedToName: string }>>({});
  const [selectedContractors, setSelectedContractors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const complaints = mockComplaints;
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => (complaintStates[c.id]?.status || c.status) === 'Pending').length,
    assigned: complaints.filter((c) => (complaintStates[c.id]?.status || c.status) === 'Assigned').length,
    completed: complaints.filter((c) => (complaintStates[c.id]?.status || c.status) === 'Completed').length,
  };

  const getStatus = (id: string, original: ComplaintStatus) => complaintStates[id]?.status || original;
  const getAssignedName = (id: string, original?: string) => complaintStates[id]?.assignedToName || original || '';

  const handleAssign = (complaintId: string) => {
    const contractorId = selectedContractors[complaintId];
    if (!contractorId) return;
    const contractor = mockContractors.find((c) => c.id === contractorId);
    if (!contractor) return;
    setComplaintStates((prev) => ({
      ...prev,
      [complaintId]: { status: 'Assigned', assignedTo: contractorId, assignedToName: contractor.name },
    }));
    toast({ title: 'Contractor Assigned', description: `${contractor.name} has been assigned. Status changed to Assigned.` });
  };

  const handleMarkCompleted = (complaintId: string) => {
    setComplaintStates((prev) => ({
      ...prev,
      [complaintId]: { ...prev[complaintId], status: 'Completed' },
    }));
    toast({ title: 'Complaint Completed', description: 'This complaint has been marked as Completed.' });
  };

  const filtered = complaints.filter((c) => {
    const status = getStatus(c.id, c.status);
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (blockFilter !== 'all' && c.block !== blockFilter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.studentName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all residence complaints</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Complaints" value={stats.total} />
          <StatsCard title="Pending" value={stats.pending} />
          <StatsCard title="Assigned" value={stats.assigned} />
          <StatsCard title="Completed" value={stats.completed} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by title or student name..."
            className="flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={blockFilter} onValueChange={setBlockFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Block" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              {BLOCKS.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Block</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assigned To</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const status = getStatus(c.id, c.status);
                  const assignedName = getAssignedName(c.id, c.assignedToName);
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link to={`/complaint/${c.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.studentName}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.block}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {c.locationType === 'Room' ? `Room ${c.room}` : c.facility}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.priority}</td>
                      <td className="px-4 py-3 text-foreground">{status}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.dateSubmitted}</td>
                      <td className="px-4 py-3">
                        {assignedName ? (
                          <span className="text-foreground">{assignedName}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {status === 'Completed' ? (
                          <span className="text-muted-foreground text-xs">Completed</span>
                        ) : status === 'Pending' ? (
                          <div className="flex flex-col gap-2">
                            <Select
                              value={selectedContractors[c.id] || ''}
                              onValueChange={(val) => setSelectedContractors((prev) => ({ ...prev, [c.id]: val }))}
                            >
                              <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue placeholder="Select contractor" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockContractors.map((con) => (
                                  <SelectItem key={con.id} value={con.id}>
                                    {con.name} — {con.specialty}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleAssign(c.id)}
                              disabled={!selectedContractors[c.id]}
                              className="h-8 text-xs"
                            >
                              Assign Contractor
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkCompleted(c.id)}
                            className="h-8 text-xs"
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No complaints match your filters</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
