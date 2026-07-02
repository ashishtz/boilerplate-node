/**
 * Single source of truth for domain enums. The users table migration,
 * the User model, the authorization middleware and the Express type
 * augmentation all derive from these values.
 */
export const ROLES = ["admin", "user"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE = {
	ADMIN: "admin",
	USER: "user",
} as const satisfies Record<string, Role>;

export const USER_STATUSES = ["active", "inactive", "unverified"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_STATUS = {
	ACTIVE: "active",
	INACTIVE: "inactive",
	UNVERIFIED: "unverified",
} as const satisfies Record<string, UserStatus>;
