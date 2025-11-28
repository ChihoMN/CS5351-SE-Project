import {getRouteApi, useNavigate} from "@tanstack/react-router";
import CreateNote from "@/features/notes/create-note";
import {promiseTimeout} from "@/lib/utils";

const routeApi = getRouteApi("/_authenticated/_layout/notes");

export function Actions() {
  const {createNote} = routeApi.useSearch();
  const navigate = useNavigate();

  const handleClose = async () => {
    await navigate({to: ".", search: undefined, replace: true});
    document.getElementById("create-note-button")?.focus();
  };

  const handleAfterSave = async (noteId: string) => {
    await navigate({to: ".", search: undefined, replace: true});
    await promiseTimeout(500);
    document.getElementById(`note-item-${noteId}`)?.focus();
  };

  if (createNote) {
    return <CreateNote afterSave={handleAfterSave} onClose={handleClose} />;
  }

  return null;
}
