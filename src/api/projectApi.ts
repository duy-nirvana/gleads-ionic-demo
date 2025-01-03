import axios from "axios";

const ENDPOINT = "projects";

export const projectApi = {
  getDetail: (id: string) =>
    axios.get(ENDPOINT + "/get_data", { params: { project_id: id } }),
};
