export enum Role {
  Admin = 'Admin',
  FinanceManager = 'FinanceManager',
  CEO = 'CEO',
  Technician = 'Technician',
  Receptionist = 'Receptionist',
  WarehouseManager = 'WarehouseManager',
  Accountant = 'Accountant',
  BranchManager = 'BranchManager',
  MaintenanceSupervisor = 'MaintenanceSupervisor',
  ProcurementOfficer = 'ProcurementOfficer',
  HousekeepingStaff = 'HousekeepingStaff',
}

export enum RequestType {
  Maintenance = 'Maintenance',
  Warehouse = 'Warehouse',
  Procurement = 'Procurement',
}

export enum RequestStatus {
  Pending = 'Pending',
  In_Progress = 'In_Progress',
  Awaiting_Confirmation = 'Awaiting_Confirmation',
  Completed = 'Completed',
  Rejected = 'Rejected',
  Reopened = 'Reopened',
}

export enum ApprovalStatus {
  Pending_Finance = 'Pending_Finance',
  Pending_CEO = 'Pending_CEO',
  Approved = 'Approved',
  Rejected = 'Rejected',
}
