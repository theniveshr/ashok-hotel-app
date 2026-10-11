import type { FastifyRequest, FastifyReply } from 'fastify';
import type { UserRole } from '@ashok-raj/types';

export interface AuthenticatedContext {
  userId: string;
  roles: UserRole[];
  branchId?: string;
}

/**
 * Role-Based Access Control (RBAC) Guard for Fastify routes.
 *
 * Enforces role boundaries:
 * - KITCHEN_STAFF: Restricted to kitchen queue, order item preparation statuses.
 * - WAITER: Restricted to table sessions, table service, and dine-in orders.
 * - DELIVERY_PARTNER: Restricted to assigned delivery dispatches and navigation.
 * - CUSTOMER: Restricted to own bookings, orders, profile, and customer catalogs.
 * - MANAGER / ADMIN / SUPER_ADMIN: Operational, configuration, and administrative capabilities.
 *
 * Prevents privilege escalation and unauthorized cross-branch data access.
 */
export function requireRoles(...allowedRoles: (UserRole | string)[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let userRoles: UserRole[] = [];
      let userId: string | undefined;
      let branchId: string | undefined;

      // 1. JWT verification if Authorization header is present
      if (request.headers.authorization) {
        try {
          const decoded = await request.jwtVerify<{
            userId: string;
            role?: string;
            roles?: string[];
            branchId?: string;
          }>();
          userId = decoded.userId;
          branchId = decoded.branchId;

          if (decoded.roles && Array.isArray(decoded.roles)) {
            userRoles = decoded.roles as UserRole[];
          } else if (decoded.role) {
            userRoles = [decoded.role as UserRole];
          }
        } catch {
          // Token verification failed
          return reply.status(401).send({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid or expired authorization token.',
            },
          });
        }
      }

      // 2. Local development fallback only if no token and in dev mode
      if (userRoles.length === 0 && process.env['NODE_ENV'] !== 'production') {
        const staffRoleHeader = request.headers['x-staff-role'] as string | undefined;
        if (staffRoleHeader) {
          userRoles = [staffRoleHeader.toUpperCase() as UserRole];
        } else if (request.url.includes('/kitchen')) {
          userRoles = ['KITCHEN_STAFF'];
        } else if (request.url.includes('/waiter')) {
          userRoles = ['WAITER'];
        } else if (request.url.includes('/delivery/partner')) {
          userRoles = ['DELIVERY_PARTNER'];
        } else {
          userRoles = ['ADMIN'];
        }
        const roleName = userRoles[0] ?? 'ADMIN';
        userId = userId || `staff-${roleName.toLowerCase()}`;
      }

      if (userRoles.length === 0) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to access this endpoint.',
          },
        });
      }

      // Check if ANY of the user's roles matches allowedRoles or administrative roles
      const isPrivileged =
        userRoles.includes('SUPER_ADMIN') ||
        userRoles.includes('ADMIN') ||
        userRoles.includes('MANAGER');

      const isAllowed =
        isPrivileged ||
        allowedRoles.some((allowed) => userRoles.includes(allowed as UserRole));

      if (!isAllowed) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access denied: Role '${userRoles.join(', ')}' does not have permission to perform this action.`,
          },
        });
      }

      // 3. Cross-Branch Isolation Check:
      // If the user's role is strictly tied to a single branch (e.g., branch-specific staff/manager),
      // verify that the requested branch resource matches their assigned branch.
      const requestedBranchId =
        (request.params as any)?.branchId ||
        (request.query as any)?.branchId ||
        (request.body as any)?.branchId;

      if (
        branchId &&
        requestedBranchId &&
        branchId !== requestedBranchId &&
        !userRoles.includes('SUPER_ADMIN')
      ) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'CROSS_BRANCH_UNAUTHORIZED',
            message: 'Access denied: You are not authorized to perform operations across branches.',
          },
        });
      }

      // Attach authenticated context to request
      (request as any).staffContext = {
        userId: userId || 'unknown-user',
        roles: userRoles,
        branchId,
      };
      (request as any).user = {
        userId: userId || 'unknown-user',
        roles: userRoles,
        branchId,
      };
    } catch (err: any) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: err?.message || 'Authentication error',
        },
      });
    }
  };
}

/**
 * Resource Ownership Guard:
 * Ensures a customer or staff user can only access their own resource (order, booking, profile),
 * unless they possess elevated staff/admin roles.
 */
export function requireOwnerOrRoles(
  getOwnerId: (request: FastifyRequest) => string | undefined | Promise<string | undefined>,
  ...overrideRoles: (UserRole | string)[]
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await request.jwtVerify<{
        userId: string;
        roles?: string[];
        role?: string;
        branchId?: string;
      }>();

      const userRoles: UserRole[] = (decoded.roles as UserRole[]) ||
        (decoded.role ? [decoded.role as UserRole] : ['CUSTOMER']);

      const isElevated =
        userRoles.includes('SUPER_ADMIN') ||
        userRoles.includes('ADMIN') ||
        userRoles.includes('MANAGER') ||
        overrideRoles.some((r) => userRoles.includes(r as UserRole));

      if (isElevated) {
        return; // Authorized by role override
      }

      const ownerId = await getOwnerId(request);
      if (ownerId && decoded.userId !== ownerId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: You do not have permission to view or modify this resource.',
          },
        });
      }
    } catch {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }
  };
}
