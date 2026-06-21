import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Student, LessonRecord, Homework, BillingRecord, StudentStats } from '@/types';
import { formatDate, formatDateTime } from './date';

export async function generateStudentReport(
  student: Student,
  stats: StudentStats,
  recentRecords: LessonRecord[],
  homeworkList: Homework[],
  billingRecords: BillingRecord[]
): Promise<ArrayBuffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('学习报告', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`报告日期: ${formatDate(new Date())}`, pageWidth - margin, y, { align: 'right' });
  y += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('学生基本信息', margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const infoItems = [
    { label: '姓名', value: student.name },
    { label: '学习水平', value: student.level || '未设置' },
    { label: '曲目偏好', value: student.preferredGenres || '未设置' },
    { label: '累计课时', value: `${stats.totalLessons} 节` },
    { label: '已完成作业', value: `${stats.completedHomework} 项` },
    { label: '待完成作业', value: `${stats.pendingHomework} 项` },
  ];

  const colWidth = (pageWidth - margin * 2) / 2;
  infoItems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * colWidth;
    const itemY = y + row * 8;
    doc.text(`${item.label}: ${item.value}`, x, itemY);
  });

  y += Math.ceil(infoItems.length / 2) * 8 + 10;

  if (y > 250) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('近期课堂记录', margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  recentRecords.slice(0, 5).forEach((record, index) => {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(200);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(record.date), margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');

    if (record.keyPoints) {
      const keyPointsLines = doc.splitTextToSize(`重点问题: ${record.keyPoints}`, pageWidth - margin * 2);
      doc.text(keyPointsLines, margin, y);
      y += keyPointsLines.length * 6;
    }

    if (record.nextGoals) {
      const goalsLines = doc.splitTextToSize(`下次目标: ${record.nextGoals}`, pageWidth - margin * 2);
      doc.text(goalsLines, margin, y);
      y += goalsLines.length * 6;
    }
    y += 4;
  });

  y += 6;

  if (y > 250) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('当前作业', margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const statusMap: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    paused: '已暂停'
  };

  homeworkList.slice(0, 5).forEach((hw, index) => {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(200);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
    y += 4;
    doc.text(
      `${hw.pieceName}${hw.composer ? ` - ${hw.composer}` : ''}`,
      margin, y
    );
    doc.text(`状态: ${statusMap[hw.status]}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
    if (hw.dueDate) {
      doc.text(`截止日期: ${formatDate(hw.dueDate)}`, margin, y);
      y += 6;
    }
    y += 2;
  });

  y += 6;

  if (y > 250) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('费用明细', margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const typeMap: Record<string, string> = {
    lesson: '课时费',
    material: '材料费',
    other: '其他'
  };

  billingRecords.slice(0, 8).forEach((record, index) => {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(200);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
    y += 4;
    doc.text(`${formatDate(record.date)} ${typeMap[record.type]}`, margin, y);
    doc.text(`¥${record.amount.toFixed(2)}`, pageWidth - margin - 30, y);
    doc.text(
      record.isPaid ? '已支付' : '未支付',
      pageWidth - margin,
      y,
      { align: 'right' }
    );
    y += 6;
  });

  y += 6;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`累计费用: ¥${stats.totalAmount.toFixed(2)}`, margin, y);
  const unpaidColor = stats.unpaidAmount > 0 ? [232, 138, 122] : [136, 201, 161];
  doc.setTextColor(unpaidColor[0], unpaidColor[1], unpaidColor[2]);
  doc.text(`待支付: ¥${stats.unpaidAmount.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });

  return doc.output('arraybuffer');
}

export async function exportReportAsPdf(
  elementId: string,
  fileName: string
): Promise<ArrayBuffer> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 40;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 20;

  pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight + 20;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf.output('arraybuffer');
}
