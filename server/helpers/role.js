const UserPermissions = [
  'basic'
];

const AdminPermissions = [
  'basic',
  'user:edit',
  'user:remove'
];

module.exports = {
  Admin: AdminPermissions,
  User: UserPermissions
};
