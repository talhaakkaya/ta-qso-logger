"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useQSO } from "@/contexts/QSOContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";
import { LogOut, UserCircle } from "lucide-react";

const Header: React.FC = () => {
  const t = useTranslations();
  const { data: session } = useSession();
  const { currentLogbook } = useQSO();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold">
          {currentLogbook?.isDefault
            ? t("common.welcome")
            : currentLogbook?.name || t("common.welcome")}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <span className="hidden sm:block text-sm font-medium">
                {session.user.name}
              </span>
              <Avatar className="w-8 h-8">
                <AvatarImage src={session.user.image || undefined} alt="Profile" />
                <AvatarFallback>
                  <UserCircle className="w-full h-full" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="font-medium">{session.user.name}</div>
                <div className="text-xs text-muted-foreground font-normal">
                  {session.user.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <ThemeToggle />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("common.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
