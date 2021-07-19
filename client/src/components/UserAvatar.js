import React, {useCallback} from "react";
import { useHistory } from "react-router-dom";
import { ProfileLocation, DashboardLocation } from "../Locations";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core";

const StyledTooltip = withStyles({
  tooltipPlacementTop: {
    margin: "6px 0",
  },
})(Tooltip);

export default function UserAvatar({
  user,
  size,
  fontSize,
  lineHeight,
  disabled,
  isProfile
}) {
  const history = useHistory();

  const handleUserProfile = useCallback(() => {
    if (!disabled) {
      if (isProfile) {
        history.push(DashboardLocation);
      } else {
        history.push(ProfileLocation(user.username));
      }
    }
  }, [user, disabled, history]);

  return (
    <>
      {user && (
        <>
          {user.profileImage ? (
            <StyledTooltip title={user.username} placement={"top"}>
              <div
                style={{
                  width: size ? size : "28px",
                  height: size ? size : "28px",
                  borderRadius: size ? size : "28px",
                  userSelect: "none",
                  cursor: disabled ? "auto" : "pointer",
                  backgroundImage: `url(${user.profileImage})`,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                }}
                onClick={handleUserProfile}
              />
            </StyledTooltip>
          ) : (
            <StyledTooltip title={user.username} placement={"top"}>
              <div
                style={{
                  backgroundColor: user.color,
                  width: size ? size : "28px",
                  height: size ? size : "28px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  color: "#0B0F3B",
                  borderRadius: size ? size : "28px",
                  fontWeight: 600,
                  lineHeight: lineHeight ? lineHeight : "12px",
                  letterSpacing: "0.1em",
                  fontSize: fontSize ? fontSize : "10px",
                  cursor: disabled ? "auto" : "pointer",
                  userSelect: "none",
                }}
                onClick={handleUserProfile}
              >
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            </StyledTooltip>
          )}
        </>
      )}
    </>
  );
}
