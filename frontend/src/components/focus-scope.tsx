import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {Slot} from "radix-ui";
import type {ReactNode} from "react";
import {isHotkeyEnabledOnInput} from "@/lib/helpers";

interface FocusManagerOptions {
  /** Whether focus should wrap around when it reaches the end of the scope. */
  wrap?: boolean;
  /** A callback that determines whether the given element should be focused. */
  accept?: (node: Element) => boolean;
}

interface FocusManager {
  /** Moves focus to the next focusable element in the scope. */
  focusNext: (opts?: FocusManagerOptions) => Element | null;
  /** Moves focus to the previous focusable element in the scope. */
  focusPrevious: (opts?: FocusManagerOptions) => Element | null;
  /** Moves focus to the first focusable element in the scope. */
  focusFirst: (opts?: FocusManagerOptions) => Element | null;
  /** Moves focus to the last focusable element in the scope. */
  focusLast: (opts?: FocusManagerOptions) => Element | null;
}

type FocusScopePropsCommon = {
  /** The contents of the focus scope. */
  children: ReactNode;
  /** The index of the element to auto focus on, can be used to focus first element on component mount or even a specific element after mount. */
  autoFocusElementIndexOnMount?: number;
  asChild?: boolean;
};

type ListShortcutFocusScopeProps = FocusScopePropsCommon & {
  shortcutType: "list";
  eventListenerType: "document" | "parent";
  onUnknownKeyDown?: (event: KeyboardEvent) => void;
};

type FocusScopePropsNoShortcut = FocusScopePropsCommon & {
  shortcutType?: undefined;
};

type FocusScopeProps = ListShortcutFocusScopeProps | FocusScopePropsNoShortcut;

const FocusContext = createContext<FocusManager | null>(null);

function isElementVisible(element: Element): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    !element.hasAttribute("hidden")
  );
}

function getFocusableElements(
  container: Element,
  accept?: (node: Element) => boolean,
): Array<Element> {
  return Array.from(container.querySelectorAll("[data-kb-focus]"))
    .filter(isElementVisible)
    .filter((element) => (accept ? accept(element) : true));
}

function createFocusManager(
  containerRef: React.RefObject<Element | null>,
): FocusManager {
  return {
    focusNext(opts: FocusManagerOptions = {}): Element | null {
      const container = containerRef.current;
      if (!container) return null;

      const elements = getFocusableElements(container, opts.accept);
      if (elements.length === 0) return null;

      const currentIndex = elements.indexOf(document.activeElement as Element);
      let nextIndex = currentIndex + 1;

      if (nextIndex >= elements.length) {
        nextIndex = opts.wrap ? 0 : elements.length - 1;
      }

      const nextElement = elements[nextIndex];
      if (nextElement && nextElement !== document.activeElement) {
        (nextElement as HTMLElement).focus();
        return nextElement;
      }

      return null;
    },

    focusPrevious(opts: FocusManagerOptions = {}): Element | null {
      const container = containerRef.current;
      if (!container) return null;

      const elements = getFocusableElements(container, opts.accept);
      if (elements.length === 0) return null;

      const currentIndex = elements.indexOf(document.activeElement as Element);
      let prevIndex = currentIndex - 1;

      if (prevIndex < 0) {
        prevIndex = opts.wrap ? elements.length - 1 : 0;
      }

      const prevElement = elements[prevIndex];
      if (prevElement && prevElement !== document.activeElement) {
        (prevElement as HTMLElement).focus();
        return prevElement;
      }

      return null;
    },

    focusFirst(opts: FocusManagerOptions = {}): Element | null {
      const container = containerRef.current;
      if (!container) return null;

      const elements = getFocusableElements(container, opts.accept);
      if (elements.length === 0) return null;

      const firstElement = elements[0];
      if (firstElement) {
        (firstElement as HTMLElement).focus();
        return firstElement;
      }
      return null;
    },

    focusLast(opts: FocusManagerOptions = {}): Element | null {
      const container = containerRef.current;
      if (!container) return null;

      const elements = getFocusableElements(container, opts.accept);
      if (elements.length === 0) return null;

      const lastElement = elements[elements.length - 1];
      if (lastElement) {
        (lastElement as HTMLElement).focus();
        return lastElement;
      }
      return null;
    },
  };
}

export function FocusScope(props: FocusScopeProps) {
  const {
    children,
    autoFocusElementIndexOnMount: autoFocusElementIndex,
    asChild,
  } = props;
  const containerRef = useRef<Element>(null);
  const focusManager = useMemo(() => createFocusManager(containerRef), []);

  useEffect(() => {
    if (autoFocusElementIndex !== undefined && containerRef.current) {
      const elements = getFocusableElements(containerRef.current);
      const element = elements[autoFocusElementIndex];

      if (element) {
        (element as HTMLElement).focus();
      }
    }
  }, []);

  useEffect(() => {
    if (props.shortcutType === "list") {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (isHotkeyEnabledOnInput(event)) return;

        switch (event.key) {
          case "ArrowDown":
          case "j":
            if (event.ctrlKey || event.metaKey) return;
            event.preventDefault();
            focusManager.focusNext(listNavigationOptions);
            break;
          case "ArrowUp":
          case "k":
            if (event.ctrlKey || event.metaKey) return;
            event.preventDefault();
            focusManager.focusPrevious(listNavigationOptions);
            break;
          case "Home":
          case "g":
            if (event.ctrlKey || event.metaKey) return;
            event.preventDefault();
            focusManager.focusFirst(listNavigationOptions);
            break;
          case "End":
          case "G":
            if (event.ctrlKey || event.metaKey) return;
            event.preventDefault();
            focusManager.focusLast(listNavigationOptions);
            break;
          default:
            props.onUnknownKeyDown?.(event);
            break;
        }
      };

      const listener =
        props.eventListenerType === "document"
          ? document
          : containerRef.current;

      listener?.addEventListener("keydown", handleKeyDown as EventListener);

      return () => {
        listener?.removeEventListener(
          "keydown",
          handleKeyDown as EventListener,
        );
      };
    }
    // @ts-expect-error
  }, [props.eventListenerType, props.shortcutType, focusManager]);

  const Comp = asChild ? Slot.Slot : "div";

  return (
    <FocusContext.Provider value={focusManager}>
      <Comp ref={containerRef as React.Ref<HTMLDivElement>} data-focus-scope>
        {children}
      </Comp>
    </FocusContext.Provider>
  );
}

export function useFocusManager() {
  const focusManager = useContext(FocusContext);

  if (!focusManager) {
    throw new Error("useFocusManager must be used within a FocusScope");
  }

  return focusManager;
}

const listNavigationOptions: FocusManagerOptions = {
  wrap: true,
};
