/**
 * Identity Domain Barrel Export
 * Aggregates all Identity domain layers: routes, services, repositories, DTOs
 */

const identityRoutes = require('./routes/identity.routes');
const identityService = require('./services/identity.service');
const identityRepository = require('./repositories/identity.repository');
const {
  UserRegisterDTO,
  UserLoginDTO,
  UserUpdateDTO,
  UserResponseDTO,
  UserWithRolesDTO,
  UserFilterDTO,
  ChangePasswordDTO,
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
} = require('./dtos/identity.dtos');

module.exports = {
  // Routes
  identityRoutes,

  // Service
  identityService,

  // Repository
  identityRepository,

  // DTOs
  identity: {
    UserRegisterDTO,
    UserLoginDTO,
    UserUpdateDTO,
    UserResponseDTO,
    UserWithRolesDTO,
    UserFilterDTO,
    ChangePasswordDTO,
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
  },
};
