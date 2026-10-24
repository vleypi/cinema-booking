"use client";

import type { ReactNode } from "react";
import { SidebarProvider } from "@/shared/ui";
import { CurrentCinemaProvider } from "@/entities/viewer";
import { AppHeader } from "@/widgets/app-header";
import { Sidebar } from "@/widgets/sidebar";
import { WorkspaceContent } from "@/views/workspace/components/WorkspaceContent";

interface IWorkspaceLayoutProps {
  initialSidebarExpanded: boolean;
  initialCinemaId: string | null;
  children: ReactNode;
}

export const WorkspaceLayout = ({ initialSidebarExpanded, initialCinemaId, children }: IWorkspaceLayoutProps) => (
  <SidebarProvider initialExpanded={initialSidebarExpanded}>
    <CurrentCinemaProvider initialCinemaId={initialCinemaId}>
      <div className="flex h-dvh flex-col overflow-hidden bg-white">
        <AppHeader />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <WorkspaceContent>{children}</WorkspaceContent>
          </main>
        </div>
      </div>
    </CurrentCinemaProvider>
  </SidebarProvider>
);
