import {useMemo} from "react";
import {Link, createFileRoute} from "@tanstack/react-router";
import {useQuery} from "@rocicorp/zero/react";
import {ArrowRight, FileText, KanbanSquare} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {getBoardsListQuery, getNotesListQuery} from "@/lib/zero-queries";
import {useZ} from "@/lib/zero-cache";
import {useAuthData} from "@/queries/session";

export const Route = createFileRoute("/_authenticated/_layout/")({
  component: HomeComponent,
});

function HomeComponent() {
  const userData = useAuthData();
  const z = useZ();
  const [boards] = useQuery(getBoardsListQuery(z));
  const [notes] = useQuery(getNotesListQuery(z));

  const recentData = useMemo(() => {
    const recentBoards = [...boards]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 4);

    const recentNotes = [...notes]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 4);

    return {
      recentBoards,
      recentNotes,
    };
  }, [boards, notes]);

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-l from-primary to-primary/50 bg-clip-text text-transparent mb-6">
            Welcome back, {userData.name}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ready to boost your productivity? Jump into your workspace.
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Boards Section */}
          <Card className="relative overflow-hidden border border-gray-3 shadow-xl transition-all duration-500 bg-gradient-to-br from-card to-card/80">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5" />

            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      📋 Boards
                    </CardTitle>
                    <p className="text-muted-foreground text-sm mt-1">
                      Manage your kanban boards and track progress
                    </p>
                  </div>
                </div>
                <Link to="/boards" className="self-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-secondary/80 group"
                  >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              {recentData.recentBoards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <KanbanSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No boards yet</p>
                  <p className="text-sm mt-2">
                    Create your first one to get started!
                  </p>
                  <Link to="/boards" className="mt-4 inline-block">
                    <Button variant="outline" size="sm" className="mt-4">
                      Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Recent Boards
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {recentData.recentBoards.map((board) => (
                      <Link
                        key={board.id}
                        to="/boards/$boardId"
                        params={{boardId: board.id}}
                        className="block p-4 rounded-xl hover:bg-secondary/50 transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-border/50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate text-base">
                            {board.name}
                          </span>
                          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                            {new Date(board.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card className="relative overflow-hidden border border-gray-3 shadow-xl transition-all duration-500 bg-gradient-to-br from-card to-card/80">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-5" />

            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      📝 Notes
                    </CardTitle>
                    <p className="text-muted-foreground text-sm mt-1">
                      Access your notes and documentation
                    </p>
                  </div>
                </div>
                <Link to="/notes" className="self-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-secondary/80 group"
                  >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              {recentData.recentNotes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No notes yet</p>
                  <p className="text-sm mt-2">
                    Create your first one to get started!
                  </p>
                  <Link to="/notes" className="mt-4 inline-block">
                    <Button variant="outline" size="sm" className="mt-4">
                      Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Recent Notes
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {recentData.recentNotes.map((note) => (
                      <Link
                        key={note.id}
                        to="/notes/$noteId"
                        params={{noteId: note.id}}
                        className="block p-4 rounded-xl hover:bg-secondary/50 transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-border/50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate text-base">
                            {note.name}
                          </span>
                          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
