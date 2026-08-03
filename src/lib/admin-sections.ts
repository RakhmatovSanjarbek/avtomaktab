export const ADMIN_SECTION_KEYS = ["students", "questions", "talim", "bosqichli"] as const;
export type AdminSectionKey = (typeof ADMIN_SECTION_KEYS)[number];
