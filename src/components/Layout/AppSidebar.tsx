"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQSO } from "@/contexts/QSOContext";
import { useToast } from "@/hooks/useToast";
import { useUserMode } from "@/hooks/useUserMode";
import {
  Download,
  Upload,
  FileSpreadsheet,
  Map,
  Settings,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";

interface AppSidebarProps {
  onShowSettings: () => void;
  onShowImport: () => void;
  onShowCSVImport: () => void;
  onShowQSOMap: () => void;
  onShowQCodes: () => void;
}

export function AppSidebar({
  onShowSettings,
  onShowImport,
  onShowCSVImport,
  onShowQSOMap,
  onShowQCodes,
}: AppSidebarProps) {
  const { qsoRecords, exportToADIF } = useQSO();
  const { showToast } = useToast();
  const userMode = useUserMode();

  const handleExport = () => {
    if (qsoRecords.length === 0) {
      showToast("Dışa aktarılacak kayıt bulunmuyor", "warning");
      return;
    }
    exportToADIF();
    showToast("QSO kayıtları ADIF olarak dışa aktarıldı", "success");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex items-center justify-center size-8">
                  <Image src="/favicon.svg" alt="TA QSO Logo" className="size-8 rounded-md" width={32} height={32} />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">TA QSO Logger</span>
                  <span className="text-xs">Amatör Telsiz</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleExport}>
                  <Download />
                  <span>Dışa Aktar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowImport}>
                  <Upload />
                  <span>İçe Aktar (ADIF)</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowCSVImport}>
                  <FileSpreadsheet />
                  <span>İçe Aktar (CSV)</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {userMode === 'advanced' && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onShowQSOMap}>
                    <Map />
                    <span>QSO Haritası</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowSettings}>
                  <Settings />
                  <span>Ayarlar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Yardım</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowQCodes}>
                  <HelpCircle />
                  <span>Q Kodları</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
