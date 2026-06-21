import { useEffect, useState, useMemo } from 'react';
import { Plus, Download, Calendar, AlertCircle, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { BillingRecordCard } from '@/components/billing/BillingRecordCard';
import { BillingForm } from '@/components/billing/BillingForm';
import { useBillingStore } from '@/store/useBillingStore';
import { useStudentStore } from '@/store/useStudentStore';
import { useLessonStore } from '@/store/useLessonStore';
import { useHomeworkStore } from '@/store/useHomeworkStore';
import type { BillingRecord, Student } from '@/types';
import { formatDate, getMonthLabel } from '@/utils/date';
import { generateStudentReport } from '@/utils/pdf';
import { handleIpcResponse, getApi } from '@/utils/ipc';

export const Billing = () => {
  const { records, loading, fetchAll, create, update, remove, togglePaid, fetchSummary, fetchMonthlyStats, monthlyStats, summary } = useBillingStore();
  const { students, fetchAll: fetchStudents, studentStats, fetchStats } = useStudentStore();
  const { records: lessonRecords, fetchAll: fetchLessons } = useLessonStore();
  const { homeworkList, fetchAll: fetchHomework, fetchSections, fetchRecordings, sections, recordings } = useHomeworkStore();
  
  const [studentFilter, setStudentFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BillingRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<BillingRecord | null>(null);
  const [activeTab, setActiveTab] = useState('records');
  const [exportingReport, setExportingReport] = useState<number | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchAll();
    fetchSummary();
    fetchMonthlyStats();
  }, [fetchStudents, fetchAll, fetchSummary, fetchMonthlyStats]);

  useEffect(() => {
    students.forEach(s => {
      if (!studentStats[s.id]) {
        fetchStats(s.id);
      }
    });
  }, [students, fetchStats, studentStats]);

  const studentMap = useMemo(() => {
    const map: Record<number, string> = {};
    students.forEach(s => { map[s.id] = s.name; });
    return map;
  }, [students]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchStudent = !studentFilter || r.studentId.toString() === studentFilter;
      const matchMonth = !monthFilter || r.date.startsWith(monthFilter);
      const matchStatus = !statusFilter || 
        (statusFilter === 'paid' && r.isPaid) || 
        (statusFilter === 'unpaid' && !r.isPaid);
      return matchStudent && matchMonth && matchStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, studentFilter, monthFilter, statusFilter]);

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    records.forEach(r => monthSet.add(r.date.slice(0, 7)));
    return Array.from(monthSet).sort().reverse();
  }, [records]);

  const unpaidRecords = useMemo(() => {
    return records.filter(r => !r.isPaid).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records]);

  const handleAdd = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEdit = (record: BillingRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDeleteClick = (record: BillingRecord) => {
    setDeletingRecord(record);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (deletingRecord) {
      await remove(Number(deletingRecord.id));
      setShowDeleteConfirm(false);
      setDeletingRecord(null);
    }
  };

  const handleTogglePaid = async (record: BillingRecord) => {
    await togglePaid(Number(record.id));
  };

  const handleExportReport = async (student: Student) => {
    setExportingReport(student.id);
    try {
      const hasStudentLessons = lessonRecords.some(r => r.studentId === student.id);
      const hasStudentHomework = homeworkList.some(h => h.studentId === student.id);
      const hasStats = !!studentStats[student.id];

      const loadPromises: Promise<void>[] = [];

      if (!hasStudentLessons) {
        loadPromises.push(fetchLessons(student.id));
      }

      if (!hasStats) {
        loadPromises.push(fetchStats(student.id));
      }

      if (!hasStudentHomework) {
        loadPromises.push(fetchHomework(student.id));
      }

      await Promise.all(loadPromises);

      const currentHomeworkList = homeworkList.filter(h => h.studentId === student.id);

      const sectionPromises: Promise<void>[] = [];
      currentHomeworkList.forEach(hw => {
        if (!sections[hw.id]) {
          sectionPromises.push(fetchSections(hw.id));
        }
      });
      await Promise.all(sectionPromises);

      const recordingPromises: Promise<void>[] = [];
      currentHomeworkList.forEach(hw => {
        const hwSections = sections[hw.id] || [];
        hwSections.forEach(section => {
          if (!recordings[section.id]) {
            recordingPromises.push(fetchRecordings(section.id));
          }
        });
      });
      await Promise.all(recordingPromises);

      const stats = studentStats[student.id];
      if (!stats) {
        alert('学生统计数据加载失败，请重试');
        return;
      }

      const studentRecords = lessonRecords.filter(r => r.studentId === student.id);
      const studentHomework = homeworkList.filter(h => h.studentId === student.id);
      const studentBilling = records.filter(b => b.studentId === student.id);

      const arrayBuffer = await generateStudentReport(
        student,
        stats,
        studentRecords,
        studentHomework,
        studentBilling
      );
      const api = getApi();
      const fileName = `${student.name}_学习报告_${formatDate(new Date())}.pdf`;
      await handleIpcResponse(await api.files.savePdf(fileName, arrayBuffer));
      alert('学习报告导出成功！');
    } catch (error) {
      console.error('导出报告失败:', error);
      alert('导出报告失败，请重试');
    } finally {
      setExportingReport(null);
    }
  };

  const handleSubmit = async (data: Omit<BillingRecord, 'id' | 'createdAt'>) => {
    if (editingRecord) {
      await update(editingRecord.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
    setEditingRecord(null);
  };

  const totalAmount = summary?.totalAmount || 0;
  const unpaidAmount = summary?.unpaidAmount || 0;
  const paidAmount = totalAmount - unpaidAmount;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-title mb-0">账单</h2>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          添加账单
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总收入"
          value={`¥${totalAmount.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          valueColor="text-accent-mint"
        />
        <StatCard
          title="已收款"
          value={`¥${paidAmount.toFixed(2)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          valueColor="text-primary-600"
        />
        <StatCard
          title="待收款"
          value={`¥${unpaidAmount.toFixed(2)}`}
          icon={<AlertCircle className="w-5 h-5" />}
          valueColor={unpaidAmount > 0 ? 'text-accent-coral' : 'text-accent-mint'}
        />
        <StatCard
          title="欠费学生"
          value={summary?.unpaidStudents || 0}
          icon={<Users className="w-5 h-5" />}
          valueColor={summary?.unpaidStudents ? 'text-accent-gold' : 'text-accent-mint'}
        />
      </div>

      {unpaidRecords.length > 0 && (
        <Card className="mb-6 border-accent-gold/30 bg-accent-gold/5">
          <Card.Body className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-accent-gold" />
              <h3 className="font-semibold text-gray-900 font-serif">欠费提醒</h3>
              <Badge variant="warning">{unpaidRecords.length} 笔</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {unpaidRecords.slice(0, 6).map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{studentMap[record.studentId]}</p>
                    <p className="text-xs text-gray-500">{record.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent-coral">¥{record.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{formatDate(record.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      <Tabs
        tabs={[
          { id: 'records', label: '账单记录' },
          { id: 'reports', label: '学习报告' },
          { id: 'stats', label: '月度统计' },
        ]}
        onChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        {() => (
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'records' && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-48">
                    <Select
                      value={studentFilter}
                      onChange={(e) => setStudentFilter(e.target.value)}
                      options={[
                        { value: '', label: '全部学生' },
                        ...students.map(s => ({ value: s.id.toString(), label: s.name })),
                      ]}
                    />
                  </div>
                  <div className="w-40">
                    <Select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      options={[
                        { value: '', label: '全部月份' },
                        ...months.map(m => ({ value: m, label: m.replace('-', '年') + '月' })),
                      ]}
                    />
                  </div>
                  <div className="w-32">
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      options={[
                        { value: '', label: '全部状态' },
                        { value: 'paid', label: '已支付' },
                        { value: 'unpaid', label: '未支付' },
                      ]}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-pulse text-gray-500">加载中...</div>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-gray-500 mb-4">暂无账单记录</p>
                    <Button onClick={handleAdd}>添加第一笔账单</Button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    <div className="grid grid-cols-2 gap-4">
                      {filteredRecords.map(record => (
                        <BillingRecordCard
                          key={record.id}
                          record={record}
                          studentName={studentMap[record.studentId]}
                          onEdit={() => handleEdit(record)}
                          onDelete={() => handleDeleteClick(record)}
                          onTogglePaid={() => handleTogglePaid(record)}
                          isExporting={exportingReport === record.studentId}
                          onExportReport={() => {
                            const student = students.find(s => s.id === record.studentId);
                            if (student) handleExportReport(student);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'reports' && (
              <div className="flex-1 overflow-auto">
                <h3 className="section-title mb-4">导出学生学习报告</h3>
                <div className="grid grid-cols-3 gap-4">
                  {students.map(student => (
                    <Card key={student.id} hoverable>
                      <Card.Body className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 font-serif">{student.name}</h4>
                            {student.level && (
                              <Badge variant="info" size="sm" className="mt-1">{student.level}</Badge>
                            )}
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleExportReport(student)}
                            disabled={exportingReport === student.id}
                          >
                            {exportingReport === student.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                              <Download className="w-4 h-4 mr-1" />
                            )}
                            {exportingReport === student.id ? '导出中...' : '导出报告'}
                          </Button>
                        </div>
                        {studentStats[student.id] && (
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
                            <div>
                              <p className="text-lg font-bold font-serif text-gray-900">
                                {studentStats[student.id].totalLessons}
                              </p>
                              <p className="text-xs text-gray-500">课时</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold font-serif text-accent-mint">
                                {studentStats[student.id].completedHomework}
                              </p>
                              <p className="text-xs text-gray-500">完成作业</p>
                            </div>
                            <div>
                              <p className={`text-lg font-bold font-serif ${studentStats[student.id].unpaidAmount > 0 ? 'text-accent-coral' : 'text-accent-mint'}`}>
                                ¥{studentStats[student.id].unpaidAmount}
                              </p>
                              <p className="text-xs text-gray-500">待缴</p>
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="flex-1 overflow-auto">
                <h3 className="section-title mb-4">月度收入统计</h3>
                <div className="space-y-4">
                  {monthlyStats.slice(0, 12).map(stat => {
                    const income = stat.totalAmount - stat.unpaidAmount;
                    const collectionRate = stat.totalAmount > 0 ? Math.round((income / stat.totalAmount) * 100) : 0;
                    
                    return (
                      <Card key={stat.month}>
                        <Card.Body className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 font-serif text-lg">
                              {getMonthLabel(new Date(stat.month + '-01'))}
                            </h4>
                            <Badge variant={collectionRate >= 80 ? 'success' : collectionRate >= 50 ? 'warning' : 'danger'}>
                              收缴率 {collectionRate}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">总金额</p>
                              <p className="text-xl font-bold font-serif text-gray-900">
                                ¥{stat.totalAmount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">已收款</p>
                              <p className="text-xl font-bold font-serif text-accent-mint">
                                ¥{income.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">待收款</p>
                              <p className="text-xl font-bold font-serif text-accent-coral">
                                ¥{stat.unpaidAmount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">账单数</p>
                              <p className="text-xl font-bold font-serif text-primary-600">
                                {stat.count}
                              </p>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Tabs>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingRecord(null); }}
        title={editingRecord ? '编辑账单' : '添加账单'}
        size="lg"
      >
        <BillingForm
          record={editingRecord}
          students={students}
          defaultStudentId={studentFilter ? parseInt(studentFilter) : undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingRecord(null); }}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingRecord(null); }}
        title="确认删除"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            确定要删除 {studentMap[deletingRecord?.studentId || 0]} 的账单
            "{deletingRecord?.description}"（¥{deletingRecord?.amount.toFixed(2)}）吗？
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setDeletingRecord(null); }}>
              取消
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
