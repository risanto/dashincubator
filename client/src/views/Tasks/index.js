import React, { useEffect, useState, useRef } from "react";
import MainLayout from "../../layouts/MainLayout";
import FadeIn from "react-fade-in";

import { fetchOpenTasks } from "../../api/tasksApi";
import { createUseStyles } from "react-jss";
import useOutsideAlerter, { taskTypes } from "../../utils/utils";
import { Breakpoints } from "../../utils/breakpoint";
import TaskListCard from "../../components/TaskListCard";

import caretDownIcon from "./images/caretDown.svg";
import check from "./images/check.svg";
import checked from "./images/checked.svg";
import { CircularProgress } from "@material-ui/core";

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px",
    marginTop: 32,
    color: "#0B0F3B",
  },
  searchInput: {
    border: "none",
    backgroundColor: "transparent",
    boxShadow: "none !important",
    width: "100%",
    color: "white",
    lineHeight: "15px",
    fontSize: "12px",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
    },
  },
  conceptsColumn: {
    width: "256px",
    marginRight: "50px",
    flexShrink: 0,
    boxSizing: "border-box",
  },
  columnHeader: {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: 600,
    letterSpacing: "0.1em",
    fontSize: 12,
    lineHeight: "15px",
    display: "flex",
    marginTop: 18,
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestCTA: {
    marginTop: "16px",
    padding: "8px",
    backgroundColor: "#0B0F3B",
    borderRadius: "4px",
    fontWeight: 600,
    fontSize: "12px",
    display: "inline-block",
    color: "white",
    cursor: "pointer",
    userSelect: "none",
    marginBottom: "8px",
  },
  searchContainer: {
    marginTop: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchIcon: {
    margin: "8px",
    width: "12px",
    height: "12px",
    marginRight: "8px",
  },
  searchIconContainer: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
    position: "relative",
  },
  filterItemsContainer: {
    padding: "7px",
    borderRadius: "4px",
    backgroundColor: "#00B6F0",
    position: "absolute",
    left: 0,
    top: "28px",
    fontSize: "12px",
    color: "white",
    zIndex: 11,
  },
  filterCaret: { width: "9px", marginRight: "8px", transition: "all 0.2s" },
  conceptsLoader: {
    display: "flex",
    justifyContent: "center",
    marginTop: "24px",
    width: "160px",
  },
  [`@media (min-width: ${Breakpoints.lg}px)`]: {
    container: {
      maxWidth: 1600,
      margin: "auto",
      padding: "0 88px",
      marginTop: 32,
      color: "#0B0F3B",
      paddingBottom: "64px",
    },
  },
});

export default function TasksView({ match }) {
  const [openTasks, setOpenTasks] = useState([]);
  const [searchTypes, setSearchTypes] = useState(["spec", "production", "qa"]);
  const [searchingTypes, setSearchingTypes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const styles = useStyles();
  const typeRef = useRef();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const taskData = await fetchOpenTasks();
        setOpenTasks(taskData);

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setErrorMessage(
          "There's something wrong with the server, can't fetch the data :("
        );
      }
    }
    fetchData();
  }, []);

  const filteredOpenTasks = openTasks.filter((task) => {
    if (searchTypes.length > 0 && searchTypes.includes(task.taskType)) {
      return task;
    }
    return null;
  });

  const modifyType = (category) => {
    const newCategories = searchTypes.slice();
    const catIndex = newCategories.indexOf(category);
    if (catIndex >= 0) {
      newCategories.splice(catIndex, 1);
      setSearchTypes(newCategories);
    } else {
      newCategories.push(category);
      setSearchTypes(newCategories);
    }
  };

  useOutsideAlerter(typeRef, () => setSearchingTypes(false));

  return (
    <MainLayout match={match}>
      <FadeIn>
        <div className={styles.container}>
          <div style={{ display: "flex" }}>
            {
              <div
                style={{
                  width: "100%",
                }}
              >
                <div className={styles.columnHeader}>OPEN TASKS
                  <div
                    className={styles.filterContainer}
                    onClick={() => setSearchingTypes(true)}
                  >
                    {searchingTypes && (
                      <div
                        style={{
                          width: "106px",
                        }}
                        className={styles.filterItemsContainer}
                        ref={typeRef}
                      >
                        {taskTypes.map((tag, i) => (
                          <div
                            style={{
                              marginTop: i > 0 && "8px",
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onClick={() => modifyType(tag)}
                          >
                            <img
                              src={
                                searchTypes.find((cat) => cat === tag)
                                  ? checked
                                  : check
                              }
                              alt="check"
                              style={{
                                marginRight: "6px",
                                width: "16px",
                                height: "16px",
                              }}
                            />
                            {tag === "spec"
                              ? "Spec"
                              : tag === "production"
                              ? "Production"
                              : tag === "qa"
                              ? "QA"
                              : null}
                          </div>
                        ))}
                      </div>
                    )}
                    <img
                      src={caretDownIcon}
                      alt="dropdown"
                      className={styles.filterCaret}
                      style={{
                        width: "9px",
                        marginRight: "8px",
                        transform: searchingTypes
                          ? "rotate(-180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                    <div
                      style={{
                        fontWeight: 600,
                        color: "white",
                        fontSize: "12px",
                        lineHeight: "15px",
                      }}
                    >
                      Type
                    </div>
                  </div>
                </div>
                <div
                  id={"open-tasks"}
                  style={{
                    marginTop: "16px",
                  }}
                >
                  {loading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "32px",
                      }}
                    >
                      <CircularProgress style={{ color: "white" }} />
                    </div>
                  ) : errorMessage ? (
                    <div
                      style={{
                        color: "white",
                        fontSize: "12px",
                        textAlign: "center",
                        marginTop: "32px",
                      }}
                    >
                      {errorMessage}
                    </div>
                  ) : filteredOpenTasks.length === 0 ? (
                    <div
                      style={{
                        color: "white",
                        fontSize: "12px",
                        textAlign: "center",
                        marginTop: "32px",
                      }}
                    >
                      No tasks found
                    </div>
                  ) : (
                    filteredOpenTasks.map((taskData, idx) => {
                      return <TaskListCard key={idx} taskData={taskData} />;
                    })
                  )}
                </div>
              </div>
            }
          </div>
        </div>
      </FadeIn>
    </MainLayout>
  );
}
