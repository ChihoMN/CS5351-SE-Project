import {Draggable} from "@hello-pangea/dnd";
import {MoreVertical, Pencil, Trash2} from "lucide-react";
import {memo, useCallback, useState} from "react";
import {Link} from "@tanstack/react-router";
import {useHotkeys} from "react-hotkeys-hook";
import {flushSync} from "react-dom";
import {toast} from "sonner";
import {Tooltip as RadixTooltip} from "radix-ui";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import type {GetBoardWithColumnsAndTasksQueryResult} from "@/lib/zero-queries";
import {Button} from "@/components/ui/button";
import {EditTask} from "@/features/board-detail/edit-task";
import {cn} from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  // 👇👇👇 【新增这两个】 👇👇👇
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {useZ} from "@/lib/zero-cache";
import {useFocusManager} from "@/components/focus-scope";
import {useUndoManager} from "@/state/undo-manager";
import {FOCUS_TOOLTIP_CLASS, ModKey} from "@/lib/constants";
import {useDelayedFocusIndicator} from "@/hooks/use-focus-indicator";
import {KeyboardShortcutIndicator} from "@/components/keyboard-shortcut";
import {AssigneeCombobox} from "@/features/board-detail/assignee-combobox";
import {useAssignee} from "@/features/board-detail/use-assignee";

// 📅 简单的日期格式化
const formatDate = (ts: number | null) => {
  if (!ts) return null;
  // ✅ 修改为：乘 1000 转回毫秒显示
  const date = new Date(ts * 1000);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// 找到 getDateColor 函数
const getDateColor = (ts: number | null) => {
  if (!ts) return "text-muted-foreground";
  // ✅ 修改为：乘 1000
  const dueTime = ts * 1000;
  const now = Date.now();
  if (dueTime < now) return "text-red-600 font-bold";
  if (dueTime - now < 24 * 60 * 60 * 1000) return "text-orange-500";
  return "text-gray-500";
};

// 👇👇👇 【新增颜色定义】 👇👇👇
const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
  low: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
};

export type TaskProps = {
  task: NonNullable<GetBoardWithColumnsAndTasksQueryResult>["columns"][number]["tasks"][number];
  index: number;
  readonly?: boolean;
  // 👇👇👇 【新增这行】定义新属性 👇👇👇
  isDragDisabled?: boolean;
};

function ViewTask(props: {
  taskProps: TaskProps;
  dndProps: {provided: DraggableProvided; snapshot: DraggableStateSnapshot};
  onEdit: () => void;
  readonly?: boolean;
}) {
  const {task} = props.taskProps;
  const {provided, snapshot} = props.dndProps;
  const z = useZ();
  const focusManager = useFocusManager();
  const undoManager = useUndoManager();
  const {isFocused, showIndicatorDelayed, hideIndicator} =
    useDelayedFocusIndicator({
      isDisabled: props.readonly,
    });

  const {assigneeComboboxOpen, setAssigneeComboboxOpen, handleAssigneeChange} =
    useAssignee({
      taskId: task.id,
    });

  const editHotkeyRef = useHotkeys(
    "i",
    () => {
      if (!props.readonly) {
        props.onEdit();
      }
    },
    {
      preventDefault: true,
    },
  );

  const deleteHotkeyRef = useHotkeys(
    "shift+d",
    () => {
      if (!props.readonly) {
        handleDeleteTask();
      }
    },
    {
      preventDefault: true,
    },
  );

  const openAssigneeComboboxHotkeyRef = useHotkeys(
    "a",
    () => {
      if (!props.readonly) {
        setAssigneeComboboxOpen(true);
      }
    },
    {
      preventDefault: true,
    },
  );

  const handleDeleteTask = () => {
    const execute = () => {
      z.mutate.tasksTable.update({
        id: task.id,
        deletedAt: Date.now(),
      });
    };



    const undo = () => {
      z.mutate.tasksTable.update({
        id: task.id,
        deletedAt: null,
      });
    };

    undoManager.add({
      execute,
      undo,
    });

    toast.success("Task deleted", {
      action: {
        label: `Undo (${ModKey}+Z)`,
        onClick: () => undoManager.undo(),
      },
    });

    focusManager.focusNext();
  };

  // 👇👇👇 【新增：更新优先级函数】 👇👇👇
  const handlePriorityChange = (priority: string) => {
    z.mutate.tasksTable.update({
      id: task.id,
      priority: priority,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value; // "2023-12-31"
    if (!dateString) return;

    // 转成时间戳存入数据库
    // 注意：这里设为当天的 23:59:59 比较合理
    // ✅ 【修改后】转成秒 (除以 1000 并取整)
    const timestamp = Math.floor(new Date(dateString).setHours(23, 59, 59, 999) / 1000);

    z.mutate.tasksTable.update({
      id: task.id,
      dueDate: timestamp, // 注意大小写要和 Schema 一致 (dueDate vs due_date)
    });
  };


  return (
    <Link
      ref={useCallback((el: HTMLAnchorElement) => {
        provided.innerRef(el);
        editHotkeyRef.current = el;
        deleteHotkeyRef.current = el;
        openAssigneeComboboxHotkeyRef.current = el;
      }, [])}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={cn(
        "group mb-2.5 block cursor-default! overflow-x-hidden rounded-lg border text-foreground dark:hover:bg-gray-4 hover:bg-gray-3 default-focus-ring relative",
        snapshot.isDragging
          ? "shadow-inner bg-gray-4 dark:bg-gray-5 border-gray-10"
          : "dark:border-transparent bg-white dark:bg-gray-3",
      )}
      id={`task-${task.id}`}
      to="."
      search={{taskId: task.id}}
      replace
      data-kb-focus
      onFocus={showIndicatorDelayed}
      onBlur={hideIndicator}
    >
      <RadixTooltip.Provider>
        <RadixTooltip.Root open={isFocused} delayDuration={1000}>
          <RadixTooltip.Trigger asChild>
            {/*<div className={cn("p-2 min-h-16 flex justify-between gap-1")}>*/}
            {/*  <span*/}
            {/*    style={{*/}
            {/*      overflowWrap: "anywhere",*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    {task.name}*/}
            {/*  </span>*/}

            {/*  <div className="shrink-0 flex flex-col justify-between gap-1.5">*/}
            <div className={cn("p-2 min-h-16 flex justify-between gap-1")}>

              {/* 👇👇👇 开始修改区域：左侧内容包裹层 👇👇👇 */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">

                {/* 1. 显示优先级标签 */}
                <div className="flex">
                  <span className={cn(
                      "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border w-fit leading-none",
                      // 如果报红色波浪线，忽略它，或者把 task 改成 (task as any)
                      priorityStyles[(task as any).priority || "medium"]
                  )}>
                    {(task as any).priority || "medium"}
                    {/* 👇👇👇 【新增】显示截止时间 👇👇👇 */}
                    {(task as any).dueDate && (
                        <span className={cn(
                            "ml-auto text-[10px] flex items-center",
                            getDateColor((task as any).dueDate)
                        )}>
    🕒                   {formatDate((task as any).dueDate)}
                         </span>
                    )}
                    {/* 👆👆👆 */}

                  </span>
                </div>

                {/* 2. 原来的任务标题 (被移到这里面了) */}
                <span
                    style={{
                      overflowWrap: "anywhere",
                    }}
                >
                  {task.name}
                </span>
              </div>
              {/* 👆👆👆 修改区域结束 👆👆👆 */}

              {/* 下面是原来的右侧按钮区域，不用动，保持对接即可 */}
              <div className="shrink-0 flex flex-col justify-between gap-1.5">
                {!props.readonly && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 text-muted-foreground hover:text-foreground w-7 h-7 hover:bg-gray-5 opacity-0 group-hover:opacity-90 transition-opacity group-focus:opacity-90 self-end aria-expanded:opacity-90"
                            variant="ghost"
                            size="icon"
                        >
                          <MoreVertical className="w-4 h-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              props.onEdit();
                            }}
                        >
                          <Pencil className="mr-2 h-4 w-4"/>
                          Edit Task
                        </DropdownMenuItem>
                        {/* 👇👇👇 【新增】优先级菜单区域 开始 👇👇👇 */}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Priority</DropdownMenuLabel>

                        <DropdownMenuItem onClick={() => handlePriorityChange("high")}>
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                          High
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handlePriorityChange("medium")}>
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                          Medium
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handlePriorityChange("low")}>
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                          Low
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        {/* 👆👆👆 【新增】优先级菜单区域 结束 👆👆👆 */}

                        <DropdownMenuSeparator />

                        {/* 👇👇👇 【新增】原生日期选择器 👇👇👇 */}
                        <div className="px-2 py-1.5 text-sm outline-none flex flex-col gap-1">
                          <span className="text-muted-foreground text-xs font-semibold px-1">Due Date</span>
                          <input
                              type="date"
                              className="w-full bg-transparent border rounded px-2 py-1 text-xs cursor-pointer dark:text-white"
                              onClick={(e) => e.stopPropagation()} // 防止点击输入框导致菜单关闭
                              onChange={handleDateChange}
                              // ✅ 【修改后】注意这里的 * 1000
                              defaultValue={(task as any).dueDate ? new Date((task as any).dueDate * 1000).toISOString().split('T')[0] : ""}
                          />
                        </div>
                        {/* 👆👆👆 */}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask();
                            }}
                            className="!text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-destructive"/>
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <AssigneeCombobox
                    assignee={task.assignee ?? null}
                    onAssigneeChange={handleAssigneeChange}
                    isOpen={assigneeComboboxOpen}
                    onOpenChange={setAssigneeComboboxOpen}
                    isDisabled={props.readonly}
                />
              </div>
            </div>
          </RadixTooltip.Trigger>

          <RadixTooltip.Content
              side="bottom"
              className={FOCUS_TOOLTIP_CLASS}
              sideOffset={6}
          >
            <div className="flex gap-4 items-center text-xs">
              <div>
                <KeyboardShortcutIndicator>i</KeyboardShortcutIndicator> to edit
              </div>

              <div>
                <KeyboardShortcutIndicator>shift + D</KeyboardShortcutIndicator>{" "}
                to delete
              </div>
            </div>
          </RadixTooltip.Content>
        </RadixTooltip.Root>
      </RadixTooltip.Provider>
    </Link>
  );
}

// function TaskComp(props: TaskProps) {
//   const {task} = props;
//   const [isEditing, setIsEditing] = useState(false);
//
//   return (                                                  // 👇👇👇 【新增这行】把开关传给拖拽组件 👇👇👇
//       <Draggable draggableId={task.id} index={props.index}  isDragDisabled={props.isDragDisabled} >
//         {(provided, snapshot) => (
//             <>
//               {isEditing ? (
//                   <EditTask
//                       task={task}
//                       onComplete={() => {
//                         flushSync(() => {
//                           setIsEditing(false);
//                         });
//                         document.getElementById(`task-${task.id}`)?.focus();
//                       }}
//               className="mb-2.5"
//             />
//           ) : (
//             <ViewTask
//               taskProps={props}
//               dndProps={{provided, snapshot}}
//               onEdit={() => setIsEditing(true)}
//               readonly={props.readonly}
//             />
//           )}
//         </>
//       )}
//     </Draggable>
//   );
// }


// export const Task = memo<TaskProps>(TaskComp);

// ... (上面所有的 import 和 ViewTask 函数保持不变) ...

function TaskComp(props: TaskProps) {
  const { task } = props;
  const [isEditing, setIsEditing] = useState(false);

  return (
      <Draggable
          draggableId={task.id}
          index={props.index}
          // 👇 关键点：这里使用了 props.isDragDisabled
          isDragDisabled={props.isDragDisabled}
      >
        {(provided, snapshot) => (
            <>
              {isEditing ? (
                  <EditTask
                      task={task}
                      onComplete={() => {
                        flushSync(() => {
                          setIsEditing(false);
                        });
                        document.getElementById(`task-${task.id}`)?.focus();
                      }}
                      className="mb-2.5"
                  />
              ) : (
                  <ViewTask
                      taskProps={props}
                      dndProps={{ provided, snapshot }}
                      onEdit={() => setIsEditing(true)}
                      readonly={props.readonly}
                  />
              )}
            </>
        )}
      </Draggable>
  );
}

// 👇👇👇 【修改这里】去掉 <TaskProps> 泛型，让 TS 自动推断，或者使用 displayName
export const Task = memo(TaskComp);
Task.displayName = "Task";
