import {
  IonCheckbox,
  IonIcon,
  IonSpinner
} from "@ionic/react";
import {
  add,
  arrowBack,
  paperPlaneOutline
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { v4 as uuid } from "uuid";
import { projectApi, writeData } from "../../api";

const ProjectDetail: React.FC<any> = () => {
  const history = useHistory();
  const params = useParams<any>();
  const id = params.id;
  const [detail, setDetail] = useState<any>();
  const [showAddInput, setShowAddInput] = useState<boolean>(false);
  const [addValue, setAddValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!detail && id) {
      getDetail();
    }
  }, [id]);

  const getDetail = async () => {
    setLoading(true);
    try {
      const data = await projectApi.getDetail(id);
      if (data) {
        setDetail(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!addValue) return;

    const res = await writeData([
      {
        type: "item_add",
        uuid: uuid(),
        temp_id: uuid(),
        args: {
          content: addValue,
          project_id: detail?.project?.v2_id,
        },
      },
    ]);

    if (res) {
      setAddValue("");
      getDetail();
    }
  };

  const handleCheck = async (id: string) => {
    const taskIndex = detail?.items.findIndex((item: any) => item.id === id);

    if (taskIndex !== -1) {
      detail.items.splice(taskIndex, 1);

      setDetail({
        ...detail,
      });
    }

    await writeData([
      {
        type: "item_complete",
        uuid: uuid(),
        temp_id: uuid(),
        args: {
          id: id,
        },
      },
    ]);
  };

  return (
    <div className="relative flex flex-col h-full py-3 px-4">
      {loading && (
        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50 bg-zinc-900/60 w-full h-full">
          <IonSpinner name="circles" className="w-12 h-12"></IonSpinner>
        </div>
      )}
      <div className="w-14 h-14 min-w-14 rounded-full bg-blue-600 fixed right-0 bottom-0 z-10 m-2 flex items-center justify-center">
        <IonIcon
          aria-hidden="true"
          icon={add}
          className="text-3xl text-white active:opacity-30"
          onClick={() => {
            setShowAddInput(!showAddInput);
            const list = document.getElementById("task-list");
            list!.scrollTop = 0;
          }}
        />
      </div>
      {/* <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton
          onClick={() => {
            setShowAddInput(!showAddInput);
            const list = document.getElementById("task-list");
            list!.scrollTop = 0;
          }}
        >
          <IonIcon icon={add}></IonIcon>
        </IonFabButton>
      </IonFab> */}
      <div className="header flex items-center gap-2">
        <IonIcon
          aria-hidden="true"
          icon={arrowBack}
          className="text-3xl text-white active:opacity-30"
          onClick={() => history.push("/projects")}
        />
        <p className="text-2xl font-bold">{detail?.project?.name}</p>
      </div>
      <div className="body overflow-y-auto flex-1 grow" id="task-list">
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
        {detail?.items?.map((task: any) => (
          <div
            key={task.id}
            className="p-5 mx-0 bg-gray-500/40 rounded-lg my-3 last:mb-20 flex items-center justify-between"
          >
            <div>
              <p className="text-xl font-bold mb-2 text-white">
                {task?.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 items-center">
                  <p className="text-xl font-bold text-white">
                    {/* {project.tasks.length} */}
                  </p>
                  <p className="text-xl font-thin italic text-white opacity-50">
                    {/* {project.tasks.length ? "tasks" : "task"} */}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <IonCheckbox onClick={() => handleCheck(task?.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetail;
