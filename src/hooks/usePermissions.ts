import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";

/**
 * A custom hook to easily check for user permissions
 * based on the current NextAuth session.
 */
export function usePermissions() {
  const { data: session } = useSession();
  
  const permissions = session?.user?.permissions || [];

  // Create a Set for O(1) lookups, memoize to avoid recreating on each render
  const userPermissions = useMemo(() => new Set(permissions), [permissions]);

  const hasPermission = useCallback((code: string) => {
    return userPermissions.has(code);
  }, [userPermissions]);

  const hasAnyPermission = useCallback((...codes: string[]) => {
    return codes.some(code => userPermissions.has(code));
  }, [userPermissions]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
  };
}
