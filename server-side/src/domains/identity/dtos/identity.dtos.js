/**
 * Identity Domain DTOs
 * Validation schemas for User, Role, Permission, RolePermission, and UserRole entities
 */

const { z } = require('zod');

// ============================================
// USER DTOs
// ============================================

/**
 * UserRegisterDTO
 * Validates data for user registration/signup
 */
const UserRegisterDTO = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*]/, 'Password must contain special character (!@#$%^&*)'),
  phoneNumber: z.string().optional().nullable(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Must accept terms and conditions',
  }),
});

/**
 * UserLoginDTO
 * Validates login credentials
 */
const UserLoginDTO = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * UserUpdateDTO
 * Validates user profile updates
 */
const UserUpdateDTO = z.object({
  fullName: z.string().min(2).max(255).optional(),
  phoneNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().date().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  profileImageUrl: z.string().url('Invalid URL').optional().nullable(),
});

/**
 * UserResponseDTO
 * Response format for user (excludes password)
 */
const UserResponseDTO = z.object({
  id: z.string().cuid(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable(),
  dateOfBirth: z.date().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  bio: z.string().nullable(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  emailVerifiedAt: z.date().nullable(),
  lastLoginAt: z.date().nullable(),
  failedLoginAttempts: z.number().int(),
  lockedUntil: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

/**
 * UserWithRolesDTO
 * User response with assigned roles
 */
const UserWithRolesDTO = UserResponseDTO.extend({
  roles: z.array(z.object({
    id: z.string().cuid(),
    name: z.string(),
    description: z.string().nullable(),
  })).optional(),
});

/**
 * ChangePasswordDTO
 * Validates password change request
 */
const ChangePasswordDTO = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*]/, 'Password must contain special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

/**
 * UserFilterDTO
 * Query filters for listing users
 */
const UserFilterDTO = z.object({
  search: z.string().optional(), // Search by name or email
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'fullName', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// ROLE DTOs
// ============================================

/**
 * RoleCreateDTO
 * Validates data for creating a new role
 */
const RoleCreateDTO = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').max(100),
  description: z.string().optional().nullable(),
});

/**
 * RoleUpdateDTO
 * Validates data for updating a role
 */
const RoleUpdateDTO = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional().nullable(),
});

/**
 * RoleResponseDTO
 * Response format for a role
 */
const RoleResponseDTO = z.object({
  id: z.string().cuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

/**
 * RoleWithPermissionsDTO
 * Role response with assigned permissions
 */
const RoleWithPermissionsDTO = RoleResponseDTO.extend({
  permissions: z.array(z.object({
    id: z.string().cuid(),
    name: z.string(),
    description: z.string().nullable(),
  })).optional(),
});

// ============================================
// PERMISSION DTOs
// ============================================

/**
 * PermissionCreateDTO
 * Validates data for creating a permission
 */
const PermissionCreateDTO = z.object({
  name: z.string().min(2, 'Permission name must be at least 2 characters').max(100),
  description: z.string().optional().nullable(),
});

/**
 * PermissionUpdateDTO
 * Validates data for updating a permission
 */
const PermissionUpdateDTO = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional().nullable(),
});

/**
 * PermissionResponseDTO
 * Response format for a permission
 */
const PermissionResponseDTO = z.object({
  id: z.string().cuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// ============================================
// ROLE-PERMISSION DTOs
// ============================================

/**
 * AssignPermissionToRoleDTO
 * Validates permission assignment to role
 */
const AssignPermissionToRoleDTO = z.object({
  permissionId: z.string().cuid('Invalid permission ID'),
});

/**
 * RolePermissionResponseDTO
 * Response format for role-permission mapping
 */
const RolePermissionResponseDTO = z.object({
  id: z.string().cuid(),
  roleId: z.string().cuid(),
  permissionId: z.string().cuid(),
  createdAt: z.date(),
});

// ============================================
// USER-ROLE DTOs
// ============================================

/**
 * AssignRoleToUserDTO
 * Validates role assignment to user
 */
const AssignRoleToUserDTO = z.object({
  roleId: z.string().cuid('Invalid role ID'),
});

/**
 * BulkAssignRolesToUserDTO
 * Validates bulk role assignment
 */
const BulkAssignRolesToUserDTO = z.object({
  roleIds: z.array(z.string().cuid('Invalid role ID')).min(1, 'At least one role is required'),
});

/**
 * UserRoleResponseDTO
 * Response format for user-role mapping
 */
const UserRoleResponseDTO = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  roleId: z.string().cuid(),
  createdAt: z.date(),
});

// Export all DTOs
module.exports = {
  UserRegisterDTO,
  UserLoginDTO,
  UserUpdateDTO,
  UserResponseDTO,
  UserWithRolesDTO,
  ChangePasswordDTO,
  UserFilterDTO,
  RoleCreateDTO,
  RoleUpdateDTO,
  RoleResponseDTO,
  RoleWithPermissionsDTO,
  PermissionCreateDTO,
  PermissionUpdateDTO,
  PermissionResponseDTO,
  AssignPermissionToRoleDTO,
  RolePermissionResponseDTO,
  AssignRoleToUserDTO,
  BulkAssignRolesToUserDTO,
  UserRoleResponseDTO,
};
