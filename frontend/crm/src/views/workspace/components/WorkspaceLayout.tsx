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
      <div className="flex h-dvh overflow-hidden bg-white">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-canvas md:my-2 md:mr-2 md:rounded-2xl md:border md:border-gray-200">
          <AppHeader />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <WorkspaceContent>{children}</WorkspaceContent>
          </main>
        </div>
      </div>
    </CurrentCinemaProvider>
  </SidebarProvider>
);
