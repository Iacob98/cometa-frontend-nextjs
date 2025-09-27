import { addMonths, differenceInDays, isPast } from 'date-fns';

export interface DocumentExpirationInfo {
  status: 'active' | 'expiring_soon' | 'expired';
  daysUntilExpiry: number;
  warningLevel: 'none' | 'three_months' | 'two_months' | 'one_month' | 'critical';
  priority: 'normal' | 'high' | 'urgent';
  notificationTitle: string;
  notificationMessage: string;
}

export interface Document {
  id: string;
  user_id: string;
  category_id: string;
  file_name: string;
  expiry_date: string | null;
  category?: {
    name_ru?: string;
    name_en?: string;
    required_for_work?: boolean;
  };
}

/**
 * Calculates expiration information for a document
 */
export function calculateDocumentExpiration(document: Document): DocumentExpirationInfo {
  const defaultResult: DocumentExpirationInfo = {
    status: 'active',
    daysUntilExpiry: Infinity,
    warningLevel: 'none',
    priority: 'normal',
    notificationTitle: '',
    notificationMessage: ''
  };

  if (!document.expiry_date) {
    return defaultResult;
  }

  const expiryDate = new Date(document.expiry_date);
  const today = new Date();
  const daysUntilExpiry = differenceInDays(expiryDate, today);

  // Check if already expired
  if (isPast(expiryDate)) {
    return {
      status: 'expired',
      daysUntilExpiry: Math.abs(daysUntilExpiry),
      warningLevel: 'critical',
      priority: 'urgent',
      notificationTitle: 'Document Expired',
      notificationMessage: `Document "${document.file_name}" (${document.category?.name_en || 'document'}) expired ${Math.abs(daysUntilExpiry)} days ago`
    };
  }

  // Calculate warning levels based on days until expiry
  const oneMonthInDays = 30;
  const twoMonthsInDays = 60;
  const threeMonthsInDays = 90;

  let warningLevel: DocumentExpirationInfo['warningLevel'] = 'none';
  let priority: DocumentExpirationInfo['priority'] = 'normal';
  let status: DocumentExpirationInfo['status'] = 'active';
  let notificationTitle = '';
  let notificationMessage = '';

  if (daysUntilExpiry <= oneMonthInDays) {
    warningLevel = 'one_month';
    priority = 'urgent';
    status = 'expiring_soon';
    notificationTitle = '🚨 Critical: Document expiring within a month';
    notificationMessage = `Document "${document.file_name}" (${document.category?.name_en || 'document'}) expires in ${daysUntilExpiry} days`;
  } else if (daysUntilExpiry <= twoMonthsInDays) {
    warningLevel = 'two_months';
    priority = 'high';
    status = 'expiring_soon';
    notificationTitle = '⚠️ Warning: Document expiring within 2 months';
    notificationMessage = `Document "${document.file_name}" (${document.category?.name_en || 'document'}) expires in ${daysUntilExpiry} days`;
  } else if (daysUntilExpiry <= threeMonthsInDays) {
    warningLevel = 'three_months';
    priority = 'normal';
    status = 'expiring_soon';
    notificationTitle = 'ℹ️ Reminder: Document expiring within 3 months';
    notificationMessage = `Document "${document.file_name}" (${document.category?.name_en || 'document'}) expires in ${daysUntilExpiry} days`;
  }

  return {
    status,
    daysUntilExpiry,
    warningLevel,
    priority,
    notificationTitle,
    notificationMessage
  };
}

/**
 * Calculates expiration information for multiple documents
 */
export function calculateDocumentsExpiration(documents: Document[]): {
  expirationInfo: (Document & DocumentExpirationInfo)[];
  summary: {
    total: number;
    active: number;
    expiring_soon: number;
    expired: number;
    critical_count: number;
    urgent_count: number;
    high_priority_count: number;
  };
} {
  const expirationInfo = documents.map(doc => ({
    ...doc,
    ...calculateDocumentExpiration(doc)
  }));

  const summary = {
    total: documents.length,
    active: expirationInfo.filter(doc => doc.status === 'active').length,
    expiring_soon: expirationInfo.filter(doc => doc.status === 'expiring_soon').length,
    expired: expirationInfo.filter(doc => doc.status === 'expired').length,
    critical_count: expirationInfo.filter(doc => doc.warningLevel === 'critical').length,
    urgent_count: expirationInfo.filter(doc => doc.priority === 'urgent').length,
    high_priority_count: expirationInfo.filter(doc => doc.priority === 'high').length
  };

  return { expirationInfo, summary };
}

/**
 * Generates notifications for expiring documents
 */
export function generateExpirationNotifications(documents: Document[]): Array<{
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: 'normal' | 'high' | 'urgent';
  action_url: string;
  action_label: string;
  document_id: string;
  warning_level: string;
}> {
  const notifications: Array<{
    user_id: string;
    title: string;
    message: string;
    notification_type: string;
    priority: 'normal' | 'high' | 'urgent';
    action_url: string;
    action_label: string;
    document_id: string;
    warning_level: string;
  }> = [];

  documents.forEach(document => {
    const expiration = calculateDocumentExpiration(document);

    // Only create notifications for documents that need warnings
    if (expiration.warningLevel !== 'none') {
      notifications.push({
        user_id: document.user_id,
        title: expiration.notificationTitle,
        message: expiration.notificationMessage,
        notification_type: 'info', // Use 'info' as standard type
        priority: expiration.priority,
        action_url: `/dashboard/teams/${document.user_id}`, // Navigate to user's documents
        action_label: 'View Documents',
        document_id: document.id,
        warning_level: expiration.warningLevel
      });
    }
  });

  return notifications;
}