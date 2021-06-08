import React, { useEffect, useState, useRef } from "react";
import MainLayout from "../../layouts/MainLayout";
import addIcon from "./images/add.svg";
import FadeIn from "react-fade-in";
import { fetchBounties, fetchConcepts } from "../../api/bountiesApi";
import ConceptCard from "../../components/ConceptCard";
import { createUseStyles } from "react-jss";
import useOutsideAlerter, {
  bountyStatus,
  bountyTypes,
  Breakpoints,
} from "../../utils/utils";
import RequestNewConceptView from "../RequestNewConcept";
import searchIcon from "./images/search.svg";
import caretDownIcon from "./images/caretDown.svg";
import BountyCard from "../../components/BountyCard";
import check from "./images/check.svg";
import checked from "./images/checked.svg";
import { CircularProgress } from "@material-ui/core";
import { isMobile } from "react-device-detect";

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px",
    marginTop: "32px",
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
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "12px",
    lineHeight: "15px",
    letterSpacing: "0.1em",
    userSelect: "none",
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
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: {
      maxWidth: "1050px",
      margin: "auto",
      padding: "0 88px",
      marginTop: "32px",
      color: "#0B0F3B",
    },
  },
});

export default function HomeView({ match }) {
  const [concepts, setConcepts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchStatus, setSearchStatus] = useState(["active"]);
  const [searchingStatus, setSearchingStatus] = useState(false);
  const [searchTypes, setSearchTypes] = useState([]);
  const [searchingTypes, setSearchingTypes] = useState(false);
  const [bounties, setBounties] = useState([]);
  const [requestModal, setRequestModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(1);
  const styles = useStyles();
  const catRef = useRef();
  const typeRef = useRef();

  useEffect(() => {
    setLoading(true);
    fetchConcepts().then((results) => {
      setLoading(false);
      setConcepts(results);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBounties().then((results) => {
      setLoading(false);
      setBounties(results);
    });
  }, []);

  //eslint-disable-next-line
  const filteredBounties = bounties.filter((bounty) => {
    if (
      bounty.title.toUpperCase().includes(search.toUpperCase()) ||
      bounty.valueProposition.toUpperCase().includes(search.toUpperCase())
    ) {
      if (searchTypes.length > 0) {
        if (searchTypes.includes(bounty.bountyType)) {
          if (searchStatus.length > 0) {
            if (searchStatus.some((r) => bounty.status === r)) {
              return bounty;
            }
          } else {
            return bounty;
          }
        }
      } else {
        if (searchStatus.length > 0) {
          if (searchStatus.some((r) => bounty.status === r)) {
            return bounty;
          }
        } else {
          return bounty;
        }
      }
    }
  });

  const modifyStatus = (status) => {
    const newStatus = searchStatus.slice();
    const catIndex = newStatus.indexOf(status);
    if (catIndex >= 0) {
      newStatus.splice(catIndex, 1);
      setSearchStatus(newStatus);
    } else {
      newStatus.push(status);
      setSearchStatus(newStatus);
    }
  };

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

  useOutsideAlerter(catRef, () => setSearchingStatus(false));
  useOutsideAlerter(typeRef, () => setSearchingTypes(false));

  return (
    <MainLayout match={match}>
      <FadeIn>
        <RequestNewConceptView
          open={requestModal}
          onClose={() => setRequestModal(false)}
        />
        <div className={styles.container}>
          {isMobile && (
            <div style={{ display: "flex", marginBottom: "18px" }}>
              <div
                className={styles.columnHeader}
                style={{
                  cursor: "pointer",
                  height: "24px",
                  borderBottom: tab === 0 ? "4px solid white" : "none",
                }}
                onClick={() => setTab(0)}
              >
                CONCEPTS IN REVIEW
              </div>
              <div
                className={styles.columnHeader}
                style={{
                  marginLeft: "46px",
                  cursor: "pointer",
                  height: "24px",
                  borderBottom: tab === 1 ? "4px solid white" : "none",
                }}
                onClick={() => setTab(1)}
              >
                BOUNTIES
              </div>
            </div>
          )}
          <div style={{ display: "flex" }}>
            {((isMobile && tab === 0) || !isMobile) && (
              <div className={styles.conceptsColumn}>
                <div
                  className={styles.columnHeader}
                  style={{ display: isMobile ? "none" : "block" }}
                >
                  CONCEPTS IN REVIEW
                </div>
                <div
                  className={styles.requestCTA}
                  onClick={() => setRequestModal(true)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={addIcon}
                      alt="add"
                      style={{ width: "16px", marginRight: "4px" }}
                    />
                    <div>Request New Concept</div>
                  </div>
                </div>

                {loading ? (
                  <div className={styles.conceptsLoader}>
                    <CircularProgress style={{ color: "white" }} />
                  </div>
                ) : (
                  concepts.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      {concepts.map((concept, i) => (
                        <>
                          {i !== 0 && (
                            <hr
                              style={{
                                opacity: 0.15,
                                border: "0.5px solid #fff",
                              }}
                            />
                          )}
                          <ConceptCard concept={concept} />
                        </>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
            {((isMobile && tab === 1) || !isMobile) && (
              <div
                style={{
                  width: "100%",
                }}
              >
                <div
                  className={styles.columnHeader}
                  style={{ display: isMobile ? "none" : "block" }}
                >
                  BOUNTIES
                </div>
                <div className={styles.searchContainer}>
                  <div className={styles.searchIconContainer}>
                    <img
                      src={searchIcon}
                      alt="search"
                      className={styles.searchIcon}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={"Find a bounty"}
                      className={styles.searchInput}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px",
                    }}
                  >
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
                          {bountyTypes.map((tag, i) => (
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
                              {tag === "project"
                                ? "Projects"
                                : tag === "job"
                                ? "Jobs"
                                : tag === "service"
                                ? "Services"
                                : tag === "programme"
                                ? "Programmes"
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
                        {isMobile ? "Types" : "Filter types"}
                      </div>
                    </div>
                    <div style={{ position: "relative", marginLeft: "20px" }}>
                      {searchingStatus && (
                        <div
                          style={{
                            width: "100px",
                          }}
                          className={styles.filterItemsContainer}
                          ref={catRef}
                        >
                          {bountyStatus.map((tag, i) => (
                            <div
                              style={{
                                marginTop: i > 0 && "8px",
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                              onClick={() => modifyStatus(tag)}
                            >
                              <img
                                src={
                                  searchStatus.find((cat) => cat === tag)
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
                              {tag === "active"
                                ? "Active"
                                : tag === "paused"
                                ? "Paused"
                                : "Completed"}
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        onClick={() => setSearchingStatus(true)}
                      >
                        <img
                          src={caretDownIcon}
                          alt="dropdown"
                          style={{
                            transform: searchingStatus
                              ? "rotate(-180deg)"
                              : "rotate(0deg)",
                          }}
                          className={styles.filterCaret}
                        />
                        <div
                          style={{
                            fontWeight: 600,
                            color: "white",
                            fontSize: "12px",
                            lineHeight: "15px",
                          }}
                        >
                          {isMobile ? "Status" : "Filter status"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
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
                  ) : search && filteredBounties.length === 0 ? (
                    <div
                      style={{
                        color: "white",
                        fontSize: "12px",
                        textAlign: "center",
                        marginTop: "32px",
                      }}
                    >
                      No bounties found
                    </div>
                  ) : (
                    filteredBounties.map((bounty) => (
                      <BountyCard bounty={bounty} search={search} />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </MainLayout>
  );
}
