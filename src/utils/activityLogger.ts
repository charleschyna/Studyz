import { supabase } from '@/integrations/supabase/client';

type ActionType = 'login' | 'update' | 'add' | 'delete';
type EntityType = 'student' | 'teacher' | 'class' | 'grade' | 'attendance' | 'system';

/**
 * Logs a user activity to the activity_logs table.
 * 
 * @param userId - The ID of the user performing the action
 * @param actionType - The type of action (login, update, add, delete)
 * @param description - A human-readable description of the activity
 * @param entityType - The type of entity affected (optional)
 * @param entityId - The ID of the entity affected (optional)
 * @param metadata - Additional data related to the activity (optional)
 * @returns Promise<void>
 */
export async function logActivity(
  userId: string,
  actionType: ActionType,
  description: string,
  entityType?: EntityType,
  entityId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action_type: actionType,
      description,
      entity_type: entityType,
      entity_id: entityId,
      metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // We don't throw here to prevent activity logging from breaking the main app flow
  }
}

/**
 * Logs a login activity
 */
export async function logLogin(userId: string, userEmail: string): Promise<void> {
  return logActivity(
    userId,
    'login',
    `User ${userEmail} logged in`,
    'system'
  );
}

/**
 * Logs a data creation activity
 */
export async function logCreation(
  userId: string, 
  entityType: EntityType, 
  entityName: string,
  entityId: string
): Promise<void> {
  return logActivity(
    userId,
    'add',
    `Created new ${entityType}: ${entityName}`,
    entityType,
    entityId
  );
}

/**
 * Logs a data update activity
 */
export async function logUpdate(
  userId: string, 
  entityType: EntityType, 
  entityName: string,
  entityId: string,
  changedFields?: string[]
): Promise<void> {
  const fieldInfo = changedFields?.length 
    ? ` (Updated: ${changedFields.join(', ')})` 
    : '';
    
  return logActivity(
    userId,
    'update',
    `Updated ${entityType}: ${entityName}${fieldInfo}`,
    entityType,
    entityId,
    { changedFields }
  );
}

/**
 * Logs a data deletion activity
 */
export async function logDeletion(
  userId: string, 
  entityType: EntityType, 
  entityName: string,
  entityId: string
): Promise<void> {
  return logActivity(
    userId,
    'delete',
    `Deleted ${entityType}: ${entityName}`,
    entityType,
    entityId
  );
} 