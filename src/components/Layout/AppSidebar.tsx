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
  BookOpen,
  Plus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";

interface AppSidebarProps {
  onShowSettings: () => void;
  onShowImport: () => void;
  onShowCSVImport: () => void;
  onShowQSOMap: () => void;
  onShowQCodes: () => void;
  onShowCreateLogbook: () => void;
}

export function AppSidebar({
  onShowSettings,
  onShowImport,
  onShowCSVImport,
  onShowQSOMap,
  onShowQCodes,
  onShowCreateLogbook,
}: AppSidebarProps) {
  const { qsoRecords, exportToADIF, logbooks, currentLogbook, setCurrentLogbook } = useQSO();
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
          <SidebarGroupLabel>Logbook</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-2 space-y-2">
              <Select
                value={currentLogbook?.id || ""}
                onValueChange={(value) => setCurrentLogbook(value)}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <SelectValue placeholder="Logbook seçin" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {logbooks.map((logbook) => (
                    <SelectItem key={logbook.id} value={logbook.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>{logbook.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({logbook.qsoCount} QSO)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onShowCreateLogbook} className="w-full">
                    <Plus className="h-4 w-4" />
                    <span>Yeni Logbook</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

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
