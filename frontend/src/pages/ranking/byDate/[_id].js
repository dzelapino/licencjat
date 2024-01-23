import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "@/styles/RankingByDate.module.scss";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Scores amount by day",
    },
  },
};

export default function ByDate() {
  const [labels, setLabels] = useState([]);
  const [dataValues, setDataValues] = useState([]);
  const router = useRouter();
  const id = router.query._id;

  async function getScores(id) {
    if (id) {
      try {
        const response = await axios.get(
          `${serverUrl}/scores/byDay/${id}`
        );
        if (response.status === 200) {
          extractDatesAndCounts(response.data);
        }
      } catch (ex) {
        console.log(ex);
      }
    }
  }

  function extractDatesAndCounts(data) {
    const jsonObject = JSON.parse(JSON.stringify(data));

    const sortedDates = Object.keys(jsonObject).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const labels = [];
    const dataArr = [];

    for (const date of sortedDates) {
      labels.push(date);
      dataArr.push(jsonObject[date].count);
    }

    setLabels(labels);
    setDataValues(dataArr);
  }

  const data = {
    labels,
    datasets: [
      {
        label: "scores amount",
        data: dataValues,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      }
    ],
  };

  useEffect(() => {
    getScores(id);
  }, [router.query._id]);

  return (
    <div className={styles.rankingContainer}>
      <div className={styles.chartContainer}>
        {labels && dataValues && labels.length > 0 && dataValues.length > 0 ? (
          <Line options={options} data={data} />
        ) : (
          <h1>No data</h1>
        )}
      </div>
    </div>
  );
}
