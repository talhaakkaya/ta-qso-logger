import { prisma } from "@/lib/prisma";

/**
 * Get or create a Profile for the authenticated user
 * Creates profile automatically on first use
 */
export async function getOrCreateProfile(user: { email: string; name?: string | null }) {
  // Try to find existing profile
  let profile = await prisma.profile.findUnique({
    where: { email: user.email },
  });

  // Create profile if it doesn't exist
  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        email: user.email,
        name: user.name || null,
      },
    });
  }

  return profile;
}

/**
 * Get or create the default Logbook for a profile
 * Each user gets one default logbook automatically
 */
export async function getOrCreateDefaultLogbook(profileId: string) {
  // Try to find existing default logbook
  let logbook = await prisma.logbook.findFirst({
    where: {
      profileId,
      isDefault: true,
      deletedAt: null,
    },
  });

  // Create default logbook if it doesn't exist
  if (!logbook) {
    logbook = await prisma.logbook.create({
      data: {
        profileId,
        name: "Default",
        isDefault: true,
      },
    });
  }

  return logbook;
}

/**
 * Get the default logbook ID for an authenticated user
 * Handles profile and logbook creation automatically
 */
export async function getUserDefaultLogbookId(user: { email: string; name?: string | null }): Promise<string> {
  // Get or create profile
  const profile = await getOrCreateProfile(user);

  // Get or create default logbook
  const logbook = await getOrCreateDefaultLogbook(profile.id);

  return logbook.id;
}

/**
 * Get user profile by email (for backward compatibility)
 */
export async function getProfileByEmail(email: string) {
  return prisma.profile.findUnique({
    where: { email },
    include: {
      logbooks: {
        where: {
          isDefault: true,
          deletedAt: null,
        },
      },
    },
  });
}
