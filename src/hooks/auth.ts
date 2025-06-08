// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const useAuth = (allowedRoles: string[] = []) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (allowedRoles.length > 0 && !allowedRoles.includes(parsedUser.role)) {
      router.push("/not-authorized");
      return;
    }

    setUser(parsedUser);
  }, []);

  return user;
};
