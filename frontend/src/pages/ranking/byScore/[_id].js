import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "@/styles/RankingTable.module.scss";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { BorderColor } from "@mui/icons-material";
const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

const columns = [
  {
    field: "orderNumber",
    headerName: " ",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "amount",
    headerName: "Score",
    type: "number",
    flex: 3,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "player",
    headerName: "User",
    flex: 3,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "date",
    headerName: "Date",
    flex: 3,
    headerAlign: "center",
    align: "center",
  },
];

export default function ByScoreTable() {
  const [scores, setScores] = useState([]);
  const router = useRouter();

  const id = router.query._id;

  async function getScores(id) {
    if (id) {
      try {
        const response = await axios.get(
          `${serverUrl}/scores/scoreboard/${id}`
        );
        if (response.status === 200) {
          setScores(response.data);
        }
      } catch (ex) {
        console.log(ex);
      }
    }
  }

  useEffect(() => {
    getScores(id);
  }, [router.query._id]);

  return (
    <div className={styles.rankingContainer}>
      {scores && scores.length > 0 ? (
        <div className={styles.chartContainer}>
          <DataGrid
            disableRowSelectionOnClick
            sx={{
              backgroundColor: "#0F1924",
              color: "white",
              border: 2,
              borderColor: "white",
              "& .MuiTablePagination-root": {
                color: "white",
              },
              "& .MuiDataGrid-cell:hover": {
                color: "primary.main",
              },
              "& .MuiDataGrid-footerContainer ": {
                backgroundColor: "black",
                opacity: 0.8,
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "black",
                opacity: 0.8,
              },
            }}
            rows={scores}
            getRowId={(row) => row._id}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      ) : (
        <h1 className={styles.chartContainerNoData}>No data</h1>
      )}
    </div>
  );
}
