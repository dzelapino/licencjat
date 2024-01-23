import axios from "axios";

const apiUrl = process.env.SERVER_URL || "http://localhost:5000";

export default async function postScore(data) {
  await axios
    .post(`${apiUrl}/scores`, data, { withCredentials: true })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
}
