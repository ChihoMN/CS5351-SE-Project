"use client";

import {KanbanSquare} from "lucide-react";
import {linkOptions} from "@tanstack/react-router";
import {useQuery} from "@rocicorp/zero/react";
import type {NavGroupType} from "@/components/nav-group";
import {NavGroup} from "@/components/nav-group";
import {SidebarGroup, SidebarMenu} from "@/components/ui/sidebar";
import {useZ} from "@/lib/zero-cache";
import {getBoardsListQuery} from "@/lib/zero-queries";

export function NavBoards() {
  const z = useZ();
  const [boards] = useQuery(getBoardsListQuery(z));

  const navGroup: NavGroupType = {
    title: "Boards",
    linkProps: linkOptions({to: "/boards"}),
    icon: KanbanSquare,
    items: boards.map((board) => ({
      title: board.name,
      linkProps: linkOptions({
        to: "/boards/$boardId",
        params: {
          boardId: board.id,
        },
      }),
    })),
  };

  return (
    <SidebarGroup className="py-1">
      <SidebarMenu>
        <NavGroup {...navGroup} />
      </SidebarMenu>
    </SidebarGroup>
  );
}
