import { useEffect, useState } from "react";
import "./ListFollowTxs.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap";
import { useParams } from "react-router-dom";
import { Table } from "react-bootstrap";

type FollowTx = {
  tx_hash: string;
  account_addr: string;
  token_id: string;
  trade_direct: boolean;
  total_amount_usdt: number;
  total_amount_token: number;
  price_usdt: number;
  profit: number;
  tms: number;
};

function ListFollowTxs() {
  const { account_addr } = useParams<{ account_addr: string }>();
  const [followTxs, setFollowTxs] = useState<FollowTx[]>([]);

  const getFollowTxs = async () => {
    console.log("getFollowTxs");

    const response = await fetch(
      `http://localhost:8888/list_follow_txs/${account_addr}`,
      {
        // headers: {
        //   "Accept": "application/json",
        //   "Content-Type": "application/json",
        // },
        method: "GET",
      },
    );
    if (!response.ok) {
      const error = await response.json();
      console.error("request failed:", error.error);
      alert("request failed:" + error.error);
      return;
    }
    const result: { success: boolean; follow_txs: FollowTx[] } =
      await response.json();
    console.log("Fetched followed users:", result.follow_txs);
    setFollowTxs(result.follow_txs);
  };

  useEffect(() => {
    getFollowTxs();
  }, []);

  return (
    <>
      <div className="mt-4">
        <Table
          striped
          bordered
          hover
          responsive
          className="table-light my-custom-table"
          style={{ tableLayout: "fixed" }}
        >
          <thead className="bg-primary text-white">
            <tr>
              <th className="font-size-lg font-weight-bold">Account Address</th>
              <th className="font-size-lg font-weight-bold">Trade Direct</th>
              <th className="font-size-lg font-weight-bold">Token Id</th>
              <th className="font-size-lg font-weight-bold">
                Total Amount Usdt
              </th>
              <th className="font-size-lg font-weight-bold">
                Total Amount Token
              </th>
              <th className="font-size-lg font-weight-bold">Price Usdt</th>
              <th className="font-size-lg font-weight-bold">Profit</th>
              <th className="font-size-lg font-weight-bold">Trade Datetime</th>
            </tr>
          </thead>
          <tbody>
            {followTxs.map((followTx) => (
              <tr key={followTx.account_addr} className="table-success">
                <td>{followTx.account_addr}</td>
                <td>{followTx.trade_direct ? "buy" : "sell"}</td>
                <td>{followTx.token_id}</td>
                <td>{followTx.total_amount_usdt}</td>
                <td>{followTx.total_amount_token}</td>
                <td>{followTx.price_usdt}</td>
                <td>{followTx.profit}</td>
                <td>
                  {(() => {
                    if (followTx.tms == 1) {
                      return "datetime error";
                    }

                    const curr_tms = Math.floor(new Date().getTime() / 1000);
                    const diff_tms = curr_tms - followTx.tms;
                    if (diff_tms <= 0) {
                      return "before 0 seconds";
                    }
                    if (diff_tms < 60) {
                      return `before ${diff_tms} seconds`;
                    }
                    if (diff_tms > 60 && diff_tms < 3600) {
                      return `before ${Math.floor(diff_tms / 60)} minutes`;
                    }
                    if (diff_tms > 3600 && 86400) {
                      return `before ${Math.floor(diff_tms / 3600)} hours`;
                    }

                    return `before ${Math.floor(diff_tms / 86400)} days`;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default ListFollowTxs;
