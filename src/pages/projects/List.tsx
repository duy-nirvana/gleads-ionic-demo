import {
  IonBackdrop,
  IonButton,
  IonButtons,
  IonDatetime,
  IonDatetimeButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonLoading,
  IonModal,
  IonSpinner,
} from "@ionic/react";
import { add, closeOutline, paperPlaneOutline, calendar } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { getListData, writeData } from "../../api";
import LongPressWrapper from "../../components/LongPressWrapper";
import { useDebouncedCallback } from "use-debounce";
import { v4 as uuid } from "uuid";
import { format } from "date-fns";

const icons = ["✨", "🚀", "💪", "🤘", "🔥"];

const formatDate = (date: any) => {
  if (null) return;

  return format(new Date(date), "yyyy-MM-dd");
};

function ProjectList({}) {
  const history = useHistory();
  const [list, setList] = useState([]);
  const [showAddInput, setShowAddInput] = useState<boolean>(false);
  const [addValue, setAddValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dateValue, setDateValue] = useState<string | any | null>(null);
  const datetime = useRef<null | HTMLIonDatetimeElement>(null);

  useEffect(() => {
    if (list.length) return;

    getList();
  }, []);

  const getList = async () => {
    setLoading(true);
    try {
      const data = await getListData({
        sync_token: "*",
        resource_types: ["projects", "items"],
      });

      const projectsTemp = data.projects.map((project: any) => {
        const tasksOfProject = data.items.filter(
          (task: any) => task.project_id === project.id
        );

        return {
          ...project,
          tasks: tasksOfProject,
        };
      });

      setList(projectsTemp);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: any, id: string) => {
    e.stopPropagation();

    const projectIndex = list.findIndex((item: any) => item.id === id);

    if (projectIndex !== -1) {
      list.splice(projectIndex, 1);
      console.log({ list });
      setList([...list]);
    }

    await writeData([
      {
        type: "project_delete",
        uuid: uuid(),
        args: {
          id: id,
        },
      },
    ]);

    console.log("on delete item");
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      if (!addValue) return;

      const res = await writeData([
        {
          type: "project_add",
          uuid: uuid(),
          temp_id: uuid(),
          args: {
            name: addValue,
          },
        },
      ]);

      if (res) {
        setAddValue("");
        getList();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeName = useDebouncedCallback(
    async (e: any, id: string, currentValue: string) => {
      const value = e.target.textContent;
      if (!value) return;

      const res = await writeData([
        {
          type: "project_update",
          uuid: uuid(),
          args: {
            name: value,
            id,
          },
        },
      ]);

      console.log({ res });
    },
    500
  );

  const reset = () => {
    datetime.current?.reset();
    datetime.current?.confirm(true);
  };
  const cancel = () => {
    datetime.current?.cancel();
  };
  const confirm = () => {
    datetime.current?.confirm(true);
  };

  return (
    <div
      className={`relative py-3 px-4 flex flex-col h-full ${
        loading && "pointer-events-none"
      }`}
    >
      {loading && (
        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50 bg-zinc-900/60 w-full h-full">
          <IonSpinner name="circles" className="w-12 h-12"></IonSpinner>
        </div>
      )}

      <IonModal keepContentsMounted={true}>
        <IonDatetime
          ref={datetime}
          id="datetime"
          presentation="date"
          value={dateValue}
          onIonChange={(e) => setDateValue(e.detail.value ?? null)}
          // preferWheel={true}
          showDefaultButtons={true}
        >
          <IonButtons slot="buttons">
            <IonButton color="danger" onClick={reset}>
              Reset
            </IonButton>
            <IonButton color="primary" onClick={confirm}>
              OK
            </IonButton>
          </IonButtons>
        </IonDatetime>
      </IonModal>

      <div className="w-14 h-14 min-w-14 rounded-full bg-blue-600 fixed right-0 bottom-0 z-10 m-2 flex items-center justify-center">
        <IonIcon
          aria-hidden="true"
          icon={add}
          className="text-3xl text-white active:opacity-30"
          onClick={() => {
            setShowAddInput(!showAddInput);
            const list = document.getElementById("project-list");
            list!.scrollTop = 0;
          }}
        />
      </div>

      <div className="flex justify-between flex-wrap gap-2">
        <p className="text-3xl font-bold">
          Let's do it {icons[Math.floor(icons.length * Math.random())]}
        </p>
        <div className="flex items-center relative">
          {!dateValue && (
            <IonIcon
              aria-hidden="true"
              icon={calendar}
              className="text-2xl text-white active:opacity-30 p-2 bg-gray-500/40 rounded-lg absolute right-0"
            />
          )}

          <IonDatetimeButton
            datetime="datetime"
            {...(!dateValue && {
              className: "bg-transparent w-10 h-10",
              style: {
                overflow: "hidden",
                opacity: 0,
              },
            })}
          ></IonDatetimeButton>
        </div>
      </div>
      <div className="body overflow-y-auto flex-1 grow" id="project-list">
        {showAddInput && (
          <div className="flex items-center p-5 w-full rounded-lg mt-3 bg-gray-500/40">
            <input
              name="task_cotenten"
              autoFocus={showAddInput}
              className="text-white text-xl font-bold grow bg-transparent outline-none active:outline-none"
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
            ></input>
            <IonIcon
              aria-hidden="true"
              icon={paperPlaneOutline}
              className={`text-2xl text-white ${!addValue && "opacity-50"}`}
              onClick={handleAdd}
            />
          </div>
        )}
        {list
          .filter((project: any) => {
            if (dateValue) {
              return formatDate(dateValue) === formatDate(project.created_at);
            } else {
              return project;
            }
          })
          .filter(
            (project: any) =>
              project.child_order !== 0 || project.name !== "Inbox"
          )
          .map((project: any) => (
            <LongPressWrapper
              key={project.id}
              onLongPress={(e: Event) => console.log("long press...")}
            >
              <div
                key={project.id}
                className="p-5 mx-0 bg-gray-500/40 rounded-lg my-3 last:mb-0 flex items-center justify-between active:bg-gray-500/50"
                onClick={() => history.push(`/projects/${project.id}`)}
              >
                <div className="flex-grow">
                  <p
                    className="text-2xl font-bold mb-2 text-white"
                    contentEditable
                    autoFocus
                    onInput={(e) =>
                      handleChangeName(e, project.id, project.name)
                    }
                  >
                    {project.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 items-center">
                      <p className="text-xl font-bold text-white">
                        {project.tasks.length}
                      </p>
                      <p className="text-xl font-thin italic text-white opacity-50">
                        {project.tasks.length > 1 ? "tasks" : "task"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-thin italic text-white opacity-50">
                    <span className="underline">created at:</span>{" "}
                    {format(project.created_at, "HH:mm dd-MM-yyyy")}
                  </p>
                </div>
                <div className="">
                  <button onClick={(e: any) => handleDelete(e, project.id)}>
                    <IonIcon
                      aria-hidden="true"
                      icon={closeOutline}
                      className="text-2xl text-white active:opacity-30"
                    />
                  </button>
                </div>
              </div>
            </LongPressWrapper>
          ))}
      </div>
    </div>
  );
}

export default ProjectList;
