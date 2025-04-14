import { useEffect, useRef, useState } from "react";
import "./ListFollowedUsers.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap";
import { Form, Button, Table } from "react-bootstrap";
import { cloneDeep } from "lodash";

type FollowedUsr = {
  account_addr: string;
  last_tx_hash: string;
  tms: number;
  block_number: number;
  is_disabled: boolean;
  total_buy_amount: number;
  total_sell_amount: number;
  buy_num: number;
  sell_num: number;
  real_profit: number;
  floating_profit: number;
};

function ListFollowedUsers() {
  const [followedUsers, setFollowedUsers] = useState<FollowedUsr[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFollowedUsers = async () => {
    const response = await fetch("http://localhost:8888/list_followed_users", {
      // headers: {
      //   "Accept": "application/json",
      //   "Content-Type": "application/json",
      // },
      method: "GET",
    });
    const result: { followed_usrs: FollowedUsr[] } = await response.json();
    console.log("Fetched followed users:", result.followed_usrs); // 打印结
    setFollowedUsers(result.followed_usrs);
  };

  const setFollowedUserIsDisable = async (
    addr: string,
    is_disabled: boolean,
  ) => {
    try {
      if (is_disabled) {
        await fetch(`http://localhost:8888/del_followed_addr/${addr}`, {
          method: "GET",
        });
      } else {
        await fetch(`http://localhost:8888/add_followed_addr/${addr}`, {
          method: "GET",
        });
      }
      let is_changed = false;
      let is_existed = false;
      const newFollowedUsers = followedUsers.map((followedUser) => {
        if (followedUser.account_addr === addr) {
          is_existed = true;
          if (followedUser.is_disabled !== is_disabled) {
            is_changed = true;
            const newFollowedUser = cloneDeep(followedUser);
            newFollowedUser.is_disabled = is_disabled;
            return newFollowedUser;
          }
        }

        return followedUser;
      });

      if (is_changed) {
        if (is_disabled) {
          await fetch(`http://localhost:8888/del_followed_addr/${addr}`, {
            method: "GET",
          });
        } else {
          await fetch(`http://localhost:8888/add_followed_addr/${addr}`, {
            method: "GET",
          });
        }
      }

      if (!is_existed) {
        if (is_disabled) {
          await fetch(`http://localhost:8888/del_followed_addr/${addr}`, {
            method: "GET",
          });
        } else {
          await fetch(`http://localhost:8888/add_followed_addr/${addr}`, {
            method: "GET",
          });
        }

        newFollowedUsers.push({
          account_addr: addr,
          last_tx_hash: "11111111",
          tms: 1,
          block_number: 1,
          is_disabled: false,
          total_buy_amount: 0,
          total_sell_amount: 0,
          buy_num: 0,
          sell_num: 0,
          real_profit: 0,
          floating_profit: 0,
        });
      }
      setFollowedUsers([...newFollowedUsers]);
      return is_changed;
    } catch (error) {
      console.error("getFollowedUsers:", error);
    }
  };

  const addFollowedUser = async () => {
    try {
      const addr = inputRef.current?.value;
      if (addr) {
        if (await setFollowedUserIsDisable(addr, false)) {
          // window.location.reload();
        }
      }
    } catch (error) {
      console.error("addFollowedUser:", error);
    }
  };

  useEffect(() => {
    getFollowedUsers();
  }, []);

  return (
    <>
      <div>
        <Form
          className="my-3"
          onSubmit={(e) => {
            e.preventDefault();
            addFollowedUser();
          }}
        >
          <Form.Group
            controlId="formBasicEmail"
            className="d-flex align-items-center"
          >
            <Form.Control
              type="text"
              placeholder="User Address"
              className="me-2 w-75 m-3"
              ref={inputRef}
            />
            <Form.Text className="text-muted"></Form.Text>
            <Button variant="primary" type="submit" className="w-25 m-3">
              Add Followed User
            </Button>
          </Form.Group>
        </Form>
      </div>
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
              <th className="font-size-lg font-weight-bold">
                Total Buy Amount
              </th>
              <th className="font-size-lg font-weight-bold">
                Total Sell Amount
              </th>
              <th className="font-size-lg font-weight-bold">Buy Number</th>
              <th className="font-size-lg font-weight-bold">Sell Number</th>
              <th className="font-size-lg font-weight-bold">Total Profit</th>
              <th className="font-size-lg font-weight-bold">Real Profit</th>
              <th className="font-size-lg font-weight-bold">Floating Profit</th>
              <th className="font-size-lg font-weight-bold">
                Last Trade Datetime
              </th>
              {/* <th className="font-size-lg font-weight-bold ">
                last block number
              </th> */}
              <th className="font-size-lg font-weight-bold">Is Disabled</th>
            </tr>
          </thead>
          <tbody>
            {followedUsers.map((followedUser) => (
              <tr
                key={followedUser.account_addr}
                className={
                  followedUser.is_disabled ? "table-danger" : "table-success"
                }
              >
                <td>{followedUser.account_addr}</td>
                <td>{followedUser.total_buy_amount}</td>
                <td>{followedUser.total_sell_amount}</td>
                <td>{followedUser.buy_num}</td>
                <td>{followedUser.sell_num}</td>
                <td>
                  {followedUser.real_profit + followedUser.floating_profit}
                </td>
                <td>{followedUser.real_profit}</td>
                <td>{followedUser.floating_profit}</td>
                <td>
                  {(() => {
                    if (followedUser.tms == 1) {
                      return "not trade";
                    }

                    const curr_tms = Math.floor(new Date().getTime() / 1000);
                    const diff_tms = curr_tms - followedUser.tms;
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
                {/* <td
                  
                >
                  {followedUser.block_number}
                </td> */}
                <td>
                  <Button
                    variant={followedUser.is_disabled ? "primary" : "danger"}
                    onClick={() =>
                      setFollowedUserIsDisable(
                        followedUser.account_addr,
                        !followedUser.is_disabled,
                      )
                    }
                  >
                    {followedUser.is_disabled ? "Enable" : "Disable"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default ListFollowedUsers;
