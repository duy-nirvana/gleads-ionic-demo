import axios from "axios";

export * from "./projectApi";

export const getListData = (data: {
  sync_token: string;
  resource_types: string[];
}) => axios.post("sync", data);

export const writeData = (
  commands: [
    {
      type: string;
      args: Object;
      uuid?: string;
      temp_id?: string;
    }
  ]
) =>
  axios.post("sync", {
    commands,
  });
