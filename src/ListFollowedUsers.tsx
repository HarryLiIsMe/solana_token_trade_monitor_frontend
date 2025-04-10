import { useEffect, useRef, useState } from "react";
// import "./ListFollowedUsers.css";
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
        const newFollowedUser = cloneDeep(followedUser);
        if (followedUser.account_addr === addr) {
          is_existed = true;
          if (newFollowedUser.is_disabled !== is_disabled) {
            is_changed = true;
            newFollowedUser.is_disabled = is_disabled;
          }
        }
        return newFollowedUser;
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
          window.location.reload();
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
              className="me-2 w-75"
              ref={inputRef}
            />
            <Form.Text className="text-muted"></Form.Text>
            <Button variant="primary" type="submit" className="w-25">
              Add Followed User
            </Button>
          </Form.Group>
        </Form>
      </div>
      <div className="mt-4">
        <Table>
          <thead>
            <tr>
              <th>account address</th>
              <th>last tx hash</th>
              <th>timestamp</th>
              <th>block number</th>
              <th>is disabled</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const temp = [];
              for (const followedUser of followedUsers) {
                temp.push(
                  <tr>
                    <td>{followedUser.account_addr}</td>
                    <td>{followedUser.last_tx_hash}</td>
                    <td>{followedUser.tms}</td>
                    <td>{followedUser.block_number}</td>
                    <td>
                      <Button
                        variant={
                          followedUser.is_disabled ? "primary" : "danger"
                        }
                        onClick={() =>
                          setFollowedUserIsDisable(
                            followedUser.account_addr,
                            !followedUser.is_disabled,
                          )
                        }
                      >
                        {followedUser.is_disabled ? "enbale" : "disable"}
                      </Button>
                    </td>
                  </tr>,
                );
              }
              return temp;
            })()}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default ListFollowedUsers;
